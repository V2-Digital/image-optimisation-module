import { CloudFrontRequest } from 'aws-lambda';
import { imageService } from '@services';

interface HandlerResponse {
  statusCode: number;
  body: string | ReadableStream;
  headers: {
    [key: string]: string;
  };
}

export const handle = async (
  request: CloudFrontRequest,
): Promise<HandlerResponse | undefined> => {
  const uri = request.uri;

  if (uri === undefined) {
    return {
      statusCode: 400,
      body: 'Invalid Request',
      headers: {
        'Content-Type': 'text/plain',
      },
    };
  }

  const queryString = new URLSearchParams(request.querystring);

  const width = parseInt(queryString.get('width') ?? '');
  const quality = parseInt(queryString.get('quality') ?? '');

  if (isNaN(width) || isNaN(quality)) {
    return {
      statusCode: 400,
      body: 'Invalid value for width or quality',
      headers: {
        'Content-Type': 'text/plain',
      },
    };
  }

  const result = await imageService.getOptimisedImage(uri, width, quality);

  if (result === undefined) {
    return {
      statusCode: 404,
      body: 'Not Found',
      headers: {
        'Content-Type': 'text/plain',
      },
    };
  }

  return {
    statusCode: 200,
    body: result.body,
    headers: {
      'Content-Type': result.contentType
    }
  }
};
