import { ImageTypes, detectImageFormat, logger, optimiseImage } from '@common';

import { imageRepository } from '@repositories';

interface OptimisedImage {
  image: Buffer;
  imageType: string;
  etag?: string;
  cacheControl?: string;
}

export const getOptimisedImage = async (
  imagePath: string,
  width: number,
  quality: number,
  format: ImageTypes,
): Promise<OptimisedImage | undefined> => {
  // remove first backslash
  const imageKey = imagePath.slice(1);

  logger.info({
    message: 'getting optimised image',
    imagePath,
    width,
    quality,
    imageKey,
  });

  const fetchImageStart = performance.now();
  const originalImage = await imageRepository.get(imageKey);
  const fetchImageEnd = performance.now();

  logger.info({
    message: `fetched image from s3 in: ${fetchImageEnd - fetchImageStart}ms`,
  });

  if (originalImage?.Body === undefined) {
    logger.error({
      message: 'unable to find image',
    });

    return;
  }

  const bufferImageStart = performance.now();
  const imageBuffer = Buffer.from(
    await originalImage.Body.transformToByteArray(),
  );
  const bufferImageEnd = performance.now();

  logger.info({
    message: `generated-image-buffer in ${bufferImageEnd - bufferImageStart}ms`,
  });

  const contentType = originalImage.ContentType?.split('image/')[1];

  const originalImageType = detectImageFormat(imageBuffer, contentType);

  logger.info({
    message: 'determined image metadata',
    contentType,
    originalImageType,
  });

  if (originalImageType === undefined) {
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
      cacheControl: originalImage.CacheControl,
      etag: originalImage.ETag,
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
    cacheControl: originalImage.CacheControl,
    etag: originalImage.ETag,
  };
};
