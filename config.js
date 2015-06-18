'use strict';

module.exports = {

  // The streama name which need to strictly match the name of the stream to be processed in the code.
  'YouStreamName' : {

    // AWS credentials
    credentials : {

      // AWS access key Id
      accessKeyId     : 'YourAmazonAcceseeKeyId',
      // AWS access key
      secretAccessKey : 'YourSecretAccessKey',
    },

    //AWS region
    region : 'ap-southeast-1',

    stream : 'YouStreamName',

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
    maxSockets : 200,

    // Https timeout, drop the request if no response before the timeout.
    timeout : 100,
  }
};
