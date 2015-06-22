/**
 * Created by shijun on 22/6/15.
 */
var uuid          = require('node-uuid');
var kinesis       = require('./index');

var KinesisHelper = {

  getStream : function (streamName) {
    try {
      return kinesis.stream(streamName);
    } catch (err) {
      console.log(err.stack)
    }
  },

  writeData : function (stream, dataStr) {
    stream.write({
      PartitionKey : uuid.v4(),
      Data         : new Buffer(dataStr)
    }, 'utf8');
  }
};

module.exports = KinesisHelper;