var kinesis  = require('..');
var KinesisHelper = require('../helper.js');
var Sync     = require('sync');

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

function randomDouble(low, high) {
  return Math.random() * (high - low) + low;
}

var data = {
  driverID : randomInt(1, 10000),
  lat      : randomDouble(1, 90),
  lng      : randomDouble(1, 180),
  ts       : Date.now().toString(),
  accuracy : randomInt(1, 5),
  altitude : randomDouble(1, 100),
  bearing  : randomDouble(1, 10),
  source   : 0,
  speed    : randomDouble(1, 120)
};


var stream = KinesisHelper.getStream('test-shard-10');
stream.on('failure', function(){
  //do something
})

var count = 0;
function loadTest() {
  setTimeout(function () {
    try {
      for (var i = 0; i < 500; ++i) {
        var data = {
          driverID : count++,
          lat      : randomDouble(1, 90),
          lng      : randomDouble(1, 180),
          ts       : (Math.floor(Date.now() - randomDouble(100,
                                                           100000))).toString(),
          accuracy : randomInt(1, 5),
          altitude : randomDouble(1, 100),
          bearing  : randomDouble(1, 10),
          source   : 0,
          speed    : randomDouble(1, 120)
        };
        //console.log(data);
        KinesisHelper.writeData(stream, JSON.stringify(data));
      }
      loadTest();
    } catch (err) {
      console.log('in try-catch: ', err.stack);
    }
  }, 30);
}

function loadTest2() {
  Sync(function () {
    for (var i = 0; i < 10000; ++i) {
      for (var j = 0; j < 500; ++j) {
        KinesisHelper.writeData(stream, JSON.stringify(localtionData));
      }
      Sync.sleep(10);
    }
  })
}

loadTest();
//loadTest2();
