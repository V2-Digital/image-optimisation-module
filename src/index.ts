import { CloudFrontRequest, CloudFrontRequestEvent, Handler } from 'aws-lambda';

import { imageRequestController } from '@controllers';

export const handler: Handler<CloudFrontRequestEvent> = async (event) => {
  return imageRequestController.handle(event.Records[0].cf.request);
};

const exampleRequest: CloudFrontRequest = {
  clientIp: '203.0.113.178',
  headers: {
    host: [
      {
        key: 'Host',
        value: 'd111111abcdef8.cloudfront.net',
      },
    ],
    'user-agent': [
      {
        key: 'User-Agent',
        value: 'curl/7.66.0',
      },
    ],
    accept: [
      {
        key: 'accept',
        value: '*/*',
      },
    ],
  },
  method: 'GET',
  querystring: '',
  uri: '/',
};

handler(
  {
    Records: [
      {
        cf: {
          config: {
            distributionDomainName: 'd111111abcdef8.cloudfront.net',
            distributionId: 'EDFDVBD6EXAMPLE',
            eventType: 'viewer-request',
            requestId:
              '4TyzHTaYWb1GX1qTfsHhEqV6HUDd_BzoBZnwfnvQc_1oF26ClkoUSEQ==',
          },
          request: exampleRequest,
        },
      },
    ],
  },
  {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'example',
    awsRequestId: '1234',
    functionVersion: '1234',
    getRemainingTimeInMillis: () => 10,
    invokedFunctionArn: '',
    logGroupName: 'log group',
    logStreamName: 'stream',
    memoryLimitInMB: '512',
    done: () => {},
    fail: () => {},
    succeed: () => {},
  },
  () => {},
);
