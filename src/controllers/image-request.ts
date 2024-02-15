import { CloudFrontRequest } from 'aws-lambda';
import { imageService } from '@services';
import { logger } from '../common/logger';

const canAcceptAvif = (
  acceptHeader: Array<{
    key?: string | undefined;
    value: string;
  }>,
): boolean => {
  acceptHeader.forEach(({ value }) => {
    if (value.includes('image/avif')) {
      return true;
    }
  });

  return false
};

interface HandlerResponse {
  statusCode: string;
  body: string | Buffer;
  headers: {
    [key: string]: string | undefined;
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

  logger.info({
    message: 'valid uri',
    uri,
  });

  const queryString = new URLSearchParams(request.querystring);

  logger.info({
    queryString,
  });

  const width = parseInt(queryString.get('width') ?? '0');
  logger.info({
    width,
  });

  const quality = parseInt(queryString.get('quality') ?? '75');

  logger.info({
    quality,
  });

  if (isNaN(width) || isNaN(quality)) {
    return {
      statusCode: '400',
      body: 'Invalid value for width or quality',
      headers: {
        'Content-Type': 'text/plain',
      },
    };
  }

  const acceptsAvif = canAcceptAvif(request.headers['Accept']);

  logger.info({
    acceptsAvif
  })

  const result = await imageService.getOptimisedImage(
    uri,
    width,
    Math.min(quality, 75),
    acceptsAvif,
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
    message: 'succesfully generated optimised image',
  });

  return {
    statusCode: '200',
    body: result.image,
    headers: {
      'Content-Type': 'image/' + result.imageType,
      ETag: result.etag,
      'Cache-Control': result.cacheControl,
    },
  };
};
