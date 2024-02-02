import {
  CloudFrontHeaders,
  CloudFrontRequest,
  CloudFrontRequestEvent,
  CloudFrontResultResponse,
  Handler,
} from 'aws-lambda';
import { TASK_PARAMETERS, logger } from '@common';

import { imageRequestController } from '@controllers';

export const handler: Handler<
  CloudFrontRequestEvent,
  CloudFrontResultResponse
> = async (event) => {
  logger.info({
    message: 'lambda starting',
    TASK_PARAMETERS,
    event
  });
  try {
    const result = await imageRequestController.handle(
      event.Records[0].cf.request,
    );

    const headers: CloudFrontHeaders = {};

    for (const [key, value] of Object.entries(result.headers)) {
      headers[key] = [
        {
          key,
          value,
        },
      ];
    }

    return {
      body: result.body.toString(),
      status: result.statusCode,
      headers,
    };
  } catch (error) {
    return {
      body: 'Internal Server Error',
      status: '500',
    };
  }
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

if (TASK_PARAMETERS.LOCAL_ENVIRONMENT) {
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
}
