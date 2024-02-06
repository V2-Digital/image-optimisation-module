import { CloudFrontRequest } from 'aws-lambda';
import { imageService } from '@services';
import { logger } from '../common/logger';

interface HandlerResponse {
  statusCode: string;
  body: string | Buffer;
  headers: {
    [key: string]: string;
  };
}

export const handle = async (
  request: CloudFrontRequest,
): Promise<HandlerResponse> => {
  const uri = request.uri;

  if (uri === undefined) {
    return {
      statusCode: '400',
      body: 'Invalid Request',
      headers: {
        'Content-Type': 'text/plain',
      },
    };
  }

  const queryString = new URLSearchParams(request.querystring);

  const width = parseInt(queryString.get('width') ?? '0');
  const quality = parseInt(queryString.get('quality') ?? '75');

  if (isNaN(width) || isNaN(quality)) {
    return {
      statusCode: '400',
      body: 'Invalid value for width or quality',
      headers: {
        'Content-Type': 'text/plain',
      },
    };
  }

  const result = await imageService.getOptimisedImage(
    uri,
    width,
    Math.min(quality, 75),
  );

  if (result === undefined) {
    return {
      statusCode: '404',
      body: 'Not Found',
      headers: {
        'Content-Type': 'text/plain',
      },
    };
  }

  logger.info({
    message: 'succesfully generated optimised image'
  })

  return {
    statusCode: '200',
    body: result.body,
    headers: {
      'Content-Type': result.contentType,
    },
  };
};
