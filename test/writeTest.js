'use strict';

var kinesis       = require('..');
var KinesisHelper = require('../helper.js');
var Sync          = require('sync');

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

function randomDouble(low, high) {
  return Math.random() * (high - low) + low;
}

var data        = {
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
var fs          = require('fs');
var kinesisConf = JSON.parse(fs.readFileSync('../config.json', 'utf8'));

console.log(kinesisConf)
var stream      = KinesisHelper.getStream(kinesisConf, 'stg-eta');
stream.on('failure', function (d) {
  console.log(d)
  //do something
})

var count = 0;
function loadTest() {
  setTimeout(function () {
    try {
      for (var i = 0; i < 1; ++i) {
        var data  = {
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
        var data2 = {
          msgType      : 1,
          actionRecord : {
            driverId  : 208,//randomInt(10000, 10010),
            action    : 0,
            bookingId : "TEST-" + randomInt(10000, 20000)
          }
        }
        //console.log(data);
        KinesisHelper.writeData(stream, JSON.stringify(data2));
      }
      //loadTest();
    } catch (err) {
      console.log('in try-catch: ', err.stack);
    }
  }, 5000);
}

function loadTest2() {
  Sync(function () {
    for (var i = 0; i < 10000; ++i) {
      for (var j = 0; j < 500; ++j) {
        var ldata = {
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
        KinesisHelper.writeData(stream,
                                JSON.stringify(ldata),
                                Date.now().toString(),
                                'endpoint:locationUpdate-v5');
      }
      Sync.sleep(10);
    }
  })
}

//loadTest();
loadTest2();
