import { CloudFrontRequest } from 'aws-lambda';
import { imageService } from '@services';
import { logger } from '../common/logger';
import { ImageTypes } from '../common/constants';

const bestAcceptedFormat = (
  acceptHeader:
    | Array<{
        key?: string | undefined;
        value: string;
      }>
    | undefined,
): ImageTypes => {
  if (acceptHeader === undefined) {
    logger.info({
      message: 'no accept header',
    });
    return ImageTypes.webp;
  }

  const values = acceptHeader.reduce(
    (previousValue, { value }) => previousValue + value + ',',
    '',
  );

  logger.info({
    message: `accept headers`,
    values,
  });

  if (values.includes('*/*') || values.includes('image/webp')) {
    logger.info({
      message: `best format is: ${ImageTypes.webp}`,
    });
    return ImageTypes.webp;
  }
  if (values.includes('image/png')) {
    logger.info({
      message: `best format is: ${ImageTypes.png}`,
    });
    return ImageTypes.png;
  }
  if (values.includes('image/jpeg')) {
    logger.info({
      message: `best format is: ${ImageTypes.jpeg}`,
    });
    return ImageTypes.jpeg;
  }
  if (values.includes('image/jpg')) {
    logger.info({
      message: `best format is: ${ImageTypes.jpg}`,
    });
    return ImageTypes.jpg;
  }

  return ImageTypes.webp;
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

  const format = bestAcceptedFormat(request.headers['accept']);
  logger.info({
    message: `accepted format: ${format}`,
  });

  const result = await imageService.getOptimisedImage(
    uri,
    width,
    Math.min(quality, 75),
    format,
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
