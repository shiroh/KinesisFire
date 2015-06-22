'use strict';

module.exports = {

  // The streama name which need to strictly match the name of the stream to be processed in the code.
  'test-shard-10' : {

    // AWS credentials
    credentials : {

      // AWS access key Id
      accessKeyId     : 'AKIAJ55DT35JPNGKJ4WQ',
      // AWS access key
      secretAccessKey : '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',
    },

    //AWS region
    region : 'ap-southeast-1',

    stream : 'test-shard-10',

    // The producer application batches records in to the size specified
    // here, and makes a single PutRecords API call to ingest all records to the
    // stream.
    recordsToWritePerBatch : 500,

    // The interval between two writes. the timer will be reset every time a new request be sent.
    // If during the interval there's no write be executed, records in the memory will be forced to be flushed to the remote peer.
    waitBetweenPutRecordsCallsInMilliseconds : 5000,

    // amazon API version
    version : '20131202',

    // Https sockets, keep-alive by default.
    maxSockets : 500,

    // Https timeout, drop the request if no response before the timeout.
    timeout : 100,

    //when request failure exceed the number, writer will stop writting and retry after blockInterval ms.
    failureThreshold : 10,

    //the switch of failure control feature
    failureHandlerFlag : true,

    //the retry interval after failure exceed the threshold, doubled after failure on next attempt.
    blockInterval : 1000
  }
};
