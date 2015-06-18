//var Readable = require('stream').Readable,
//    kinesis = require('..')
//
//require('https').globalAgent.maxSockets = Infinity
//require('https').globalAgent.keepAlive         = true;
//require('https').globalAgent.options.keepAlive = true
//require('https').globalAgent.maxSockets        = 200;
//
//var readable = new Readable({objectMode: true})
//readable._read = function() {
//  for (var i = 0; i < 100; i++)
//    this.push({PartitionKey: i.toString(), Data: new Buffer('a')})
//  this.push(null)
//}
//
//var kinesisStream = kinesis.stream({name: 'test', writeConcurrency: 5})
//
//readable.pipe(kinesisStream).on('end', function() { console.log('done') })
//
//function KinesisObj(newStream) {
//    var stream = newStream;
//    var
//}
//
//function KinesisPool(size) {
//  var streams = [];
//
//}

var kinesis  = require('..');
var Sync     = require('sync');
var uuid     = require('node-uuid');
var memwatch = require('memwatch');
var heapdump = require('heapdump');

//memwatch.on('leak', function(info) {
//  console.error(info);
//  var file = '/tmp/myapp-' + process.pid + '-' + Date.now() + '.heapsnapshot';
//  heapdump.writeSnapshot(file, function(err){
//    if (err) console.error(err);
//    else console.error('Wrote snapshot: ' + file);
//  });
//});

var KinesisHelper = {

  getStream : function (streamName) {
    try {

      return kinesis.stream(streamName);
    } catch (err) {
      console.log(err.stack)
      //logger.error('[kinesis] error occurs in getStream');
    }
  },

  writeData : function (stream, dataStr) {
    //var pKey = uuid.v4(); // e.g. 32a4fbed-676d-47f9-a321-cb2f267e2918
    stream.write({
      PartitionKey : uuid.v4(),
      Data         : new Buffer(dataStr)
      //Data          : dataStr,
    }, 'utf8');
  }
};

var fNumber       = 213.2
var localtionData = {
  driverID : 13412321,
  lat      : 1.113,
  lon      : 123.324,
  testNum  : fNumber.toString(),
  accuracy : 10.0,
  speed    : "60.0",
  dateTime : Date.now().toString()
};

var stream = KinesisHelper.getStream('YourStreamname');
stream.on('error', function(err) {
  console.log('catch error: ' + err.stack);
})

//Sync(function () {
//  try {
//for (var i = 0; i < 20; ++i) {
////while(true){
//  KinesisHelper.writeData(stream,
//                          JSON.stringify({ id : i }));
////}
//}
//Sync.sleep(2000);
//
//} catch (err) {
//  console.log(err.stack);
//}
//});


function loadTest() {
  setTimeout(function () {
    for (var i = 0; i < 500; ++i) {
      KinesisHelper.writeData(stream, JSON.stringify(localtionData));

    }
    loadTest();
  }, 1);
}

function loadTest2()
{
  Sync(function () {
    for (var i = 0; i < 10000; ++i) {
      for (var j = 0; j < 500; ++j) {
        KinesisHelper.writeData(stream, JSON.stringify(localtionData));
      }
      Sync.sleep(10);
    }
  })
}

//loadTest();
//loadTest2();
