kinesisFire
-------

1. Fire and forget all records to the stream with a single http call.
2. Easliy exceed the kinesis write rate limitation.
3. Drop the records if any error occurs during the process.

-----------------------------------

Example
-------

```js
var KinesisHelper = {

  getStream : function (kinesisConf, streamName) {
    try {

      return kinesis.stream(kinesisConf, streamName);
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



var stream = KinesisHelper.getStream('YourStreamname');
stream.on('error', function(err) {
  console.log('catch error: ' + err.stack);
})

function runTest()
{
    for (var i = 0; i < 10000; ++i) {
      for (var j = 0; j < 500; ++j) {
        KinesisHelper.writeData(stream, JSON.stringify({ foo : i, bar:j}));
      }
  })
}

runTest();
```
