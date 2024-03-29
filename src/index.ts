import {
  CloudFrontHeaders,
  CloudFrontRequestEvent,
  CloudFrontResultResponse,
  Handler,
} from 'aws-lambda';
import { TASK_PARAMETERS, logger } from '@common';

import { imageRequestController } from '@controllers';

logger.info({
  message: 'lambda starting',
  TASK_PARAMETERS,
});

export const handler: Handler<
  CloudFrontRequestEvent,
  CloudFrontResultResponse
> = async (event): Promise<CloudFrontResultResponse> => {
  logger.info({
    message: 'event recieved',
    event,
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
          value: value ?? '',
        },
      ];
    }

    if (typeof result.body === 'string' || TASK_PARAMETERS.LOCAL_ENVIRONMENT) {
      return {
        body: result.body as string,
        status: result.statusCode,
        headers,
      };
    }

    return {
      body: result.body.toString('base64'),
      bodyEncoding: 'base64',
      status: result.statusCode,
      headers,
    };
  } catch (error) {
    logger.error({
      message: 'image optimisation failed',
      error,
    });

    return {
      body: 'Internal Server Error',
      status: '500',
    };
  }
};
