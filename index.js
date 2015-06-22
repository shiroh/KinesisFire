//TODO stop and retry mechanism when request failure happens.
var util       = require('util'),
    stream     = require('stream'),
    https      = require('https'),
    crypto     = require('crypto'),
    aws4       = require('aws4'),
    configFile = require('./config.js'),
    https      = require('https');

exports.stream = function (streamName) {
  return new KinesisStream(streamName)
}

util.inherits(KinesisStream, stream.Duplex);

exports.KinesisStream = KinesisStream
function KinesisStream(streamName) {
  this.config                  = configFile[streamName];
  stream.Duplex.call(this, { objectMode : true })
  this.streamName              = streamName;
  this.name                    = streamName;
  this.records                 = [];
  this.sentFlag                = false;
  this.region                  = this.config.region;
  this.credentials             = this.config.credentials;
  this.timeout                 = this.config.timeout;
  this.agent                   = new https.Agent;
  this.agent.keepAlive         = true;
  this.agent.maxSockets        = this.config.maxSockets;
  this.agent.options.keepAlive = true;
  this.version                 = this.config.version;
  this.failureCount            = 0;
  this.blockSending            = false;
  this.blockSendingInterval    = this.config.blockInterval;
  this._sendToKinesisRecursively();

  var self = this;
  this.on('error', function (err) {
    if (self.config.failureHandlerFlag) {
      self.failureCount++;
      if (self.failureCount >= self.config.failureThreshold && self.blockSending === false) {
        self.blockSendingInterval = (self.blockSendingInterval * 2) >= 600000 ? 600000 : self.blockSendingInterval * 2;
        self.blockSending         = true;
        setTimeout(function () {
          self.blockSending = false;
        }, self.blockSendingInterval)
      }
      self.emit('failure', err);
    }
  });

  this.on('success', function () {
    if (self.config.failureHandlerFlag) {
      self.failureCount = 0;
      self.blockSendingInterval = self.config.blockInterval;
    }
  });
}

KinesisStream.prototype.getSelfRecords = function () {
  return this.records;
}


KinesisStream.prototype.write = function (data, endCoding) {
  var self = this;
  try {
    self.makeRecord(data, endCoding);
  } catch (err) {
    self.emit('error', err);
  }
}

KinesisStream.prototype._sendToKinesisRecursively = function () {
  var self = this;
  setTimeout(function () {
    if (self.config.failureHandlerFlag && self.blockSending) {
      return;
    }
    if (self.sentFlag === true) {
      self.sentFlag = false;
      self._sendToKinesisRecursively();
      return;
    }
    self._sendToKinesis(function () {
      self._sendToKinesisRecursively();
    });
  }, self.config.waitBetweenPutRecordsCallsInMilliseconds);
}

KinesisStream.prototype._sendToKinesis = function (done) {
  var self      = this;
  self.sentFlag = true;
  if (self.records.length <= 0) {
    done();
    return;
  }
  var recordsParams = {
    Records    : self.records,
    StreamName : self.streamName
  };
  self.makeBatchRequest(recordsParams);
  delete self.records;
  self.records      = [];
  done();
}

KinesisStream.prototype.makeRecord = function (data, encoding) {
  if (this.config.failureHandlerFlag && this.blockSending) {
    return;
  }
  var self = this;
  if (Buffer.isBuffer(data)) data = { Data : data }

  if (Buffer.isBuffer(data.Data)) data.Data = data.Data.toString('base64')

  if (!data.PartitionKey) data.PartitionKey = crypto.randomBytes(16).toString('hex')

  self.records.push(data);
  if (self.records.length >= self.config.recordsToWritePerBatch) {
    self._sendToKinesis(function () {
      self.sentFlag = true
    });
    //return cb();
  }
  //return cb();
}

KinesisStream.prototype.makeBatchRequest = function (data) {
  var self = this;
  self.request('PutRecords',
               data,
               self.options,
               function (err, responseData) {
                 if (err) {
                   self.emit('putRecord')
                   return self.emit('error', err)
                 }
               })
}


KinesisStream.prototype.request = function (action, data, options, cb) {
  var self = this;

  var httpOptions = {};
  var body        = JSON.stringify(data)

  httpOptions.host    = 'kinesis.' + self.region + '.amazonaws.com'
  httpOptions.agent   = self.agent
  httpOptions.timeout = self.timeout
  httpOptions.region  = self.region
  httpOptions.method  = 'POST'
  httpOptions.path    = '/'
  httpOptions.body    = body

  httpOptions.headers = {
    'Host'           : httpOptions.host,
    'Content-Length' : Buffer.byteLength(body),
    'Content-Type'   : 'application/x-amz-json-1.1',
    'X-Amz-Target'   : 'Kinesis_' + self.version + '.' + action,
  }

  return this.makeRequest(httpOptions, body, function (err, resp) {
    httpOptions = {};
    body        = {};
    if (err) {
      self.emit('error', err)
      return;
    }
    return resp;
  });

}

KinesisStream.prototype.makeRequest = function (httpOptions, body, cb) {
  httpOptions.headers.Date = new Date().toUTCString()
  aws4.sign(httpOptions, this.credentials)
  var self                 = this;
  var req                  = https.request(httpOptions, function (res) {
    var json = ''

    res.setEncoding('utf8')

    res.on('error', cb)
    res.on('data', function (chunk) {
      json += chunk
    })
    res.on('end', function () {
      var response, parseError

      if (json)
        try {
          response = JSON.parse(json)
        } catch (e) {
          parseError = e
        }

      if (res.statusCode == 200 && !parseError) {
        self.emit('success');
        return cb(null, response)
      } else {
        var error        = new Error
        error.statusCode = res.statusCode
        if (response != null) {
          error.name    = (response.__type || '').split('#').pop()
          error.message = response.message || response.Message || JSON.stringify(response)
        } else {
          if (res.statusCode == 413) json = 'Request Entity Too Large'
          error.message = 'HTTP/1.1 ' + res.statusCode + ' ' + json
        }
        self.emit('error', error);
        cb(error)
      }

    })
  }).on('error', cb)

  req.setTimeout(this.timeout);

  req.end(body)
  delete httpOptions.body;
  return req;
}

