import { ImageTypes, detectImageFormat, logger, optimiseImage } from '@common';

import { s3Repository, externalRepository } from '@repositories';

interface OptimisedImage {
  image: Buffer;
  imageType: string;
  etag?: string;
  cacheControl?: string;
}

/**
 * Fetches and optimises an image from either an S3 bucket or an external URL.
 *
 * @param {string} imagePath - The path or URL of the image to fetch.
 * @param {number} width - The desired width of the optimised image.
 * @param {number} quality - The desired quality of the optimised image.
 * @param {ImageTypes} format - The desired format of the optimised image.
 * @returns {Promise<OptimisedImage | undefined>} - A promise that resolves to the optimised image or undefined if an error occurs.
 */
export const getOptimisedImage = async (
  imagePath: string,
  width: number,
  quality: number,
  format: ImageTypes,
): Promise<OptimisedImage | undefined> => {
  logger.info({
    message: 'getting optimised image',
    imagePath,
    width,
    quality,
  });

  const fetchImageStart = performance.now();

  let imageBuffer: Buffer | null = null;
  let cacheControl: string | undefined;
  let etag: string | undefined;
  let contentType: string | undefined;

  if (imagePath.startsWith('http')) {
    // If imagePath starts with 'http', treat it as an external URL and fetch the image
    imageBuffer = await externalRepository.get(imagePath);
  } else {
    // If imagePath does not start with 'http', treat it as an S3 key and fetch the image from S3
    const imageKey = imagePath.slice(1);
    const originalImage = await s3Repository.get(imageKey);

    if (originalImage?.Body) {
      imageBuffer = Buffer.from(
        await originalImage.Body.transformToByteArray(),
      );
      cacheControl = originalImage.CacheControl;
      etag = originalImage.ETag;
      contentType = originalImage.ContentType?.split('image/')[1];
    }
  }

  const fetchImageEnd = performance.now();
  logger.info({
    message: `fetched image in: ${fetchImageEnd - fetchImageStart}ms`,
  });

  if (!imageBuffer) {
    logger.error({
      message: 'unable to find image',
    });

    return;
  }

  const originalImageType = detectImageFormat(imageBuffer, contentType);

  logger.info({
    message: 'determined image metadata',
    contentType,
    originalImageType,
  });

  if (!originalImageType) {
    logger.error({
      message: 'unable to determine image type',
    });

    return {
      image: imageBuffer,
      imageType: contentType ?? '',
    };
  }

  try {
    const { image, imageType } = await optimiseImage(
      imageBuffer,
      originalImageType,
      width,
      quality,
      format,
    );

    logger.info({
      message: 'optimised image',
    });

    return {
      image,
      imageType,
      cacheControl,
      etag,
    };
  } catch (error) {
    logger.error({
      message: 'failed to optimise image',
      error,
    });
  }

  return {
    image: imageBuffer,
    imageType: originalImageType,
    cacheControl,
    etag,
  };
};
