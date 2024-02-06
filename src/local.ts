import { CloudFrontHeaders, CloudFrontRequest } from 'aws-lambda';
import { TASK_PARAMETERS, logger } from '@common';

import { handler } from '.';

const server = Bun.serve({
  port: TASK_PARAMETERS.PORT,
  async fetch(request) {
    const { searchParams, pathname } = new URL(request.url);

    if (pathname === '/favicon.ico') {
      return new Response();
    }

    const headers: CloudFrontHeaders = {};

    request.headers.forEach((value, key) => {
      headers[key] = [
        {
          key,
          value,
        },
      ];
    });

    const exampleRequest: CloudFrontRequest = {
      clientIp: '203.0.113.178',
      headers: headers,
      method: request.method,
      querystring: searchParams.toString(),
      uri: pathname,
    };

    const result = await handler(
      {
        Records: [
          {
            cf: {
              config: {
                distributionDomainName: 'x',
                distributionId: 'x',
                eventType: 'origin-request',
                requestId: 'x',
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

    // removes void values
    if (!result) {
      return new Response();
    }

    const responseHeaders: [string, string][] = [];

    for (const [key, value] of Object.entries(result.headers ?? {})) {
      responseHeaders.push([key, value[0].value]);
    }

    if (result.bodyEncoding !== 'base64') {
      return new Response(result.body, {
        headers: responseHeaders,
      });
    }

    if (result.body === undefined) {
      return new Response('Bad Response');
    }

    return new Response(Buffer.from(result.body, 'base64'), {
      headers: responseHeaders,
    });
  },
});

logger.info({
  message: 'server started',
  url: server.url,
});
