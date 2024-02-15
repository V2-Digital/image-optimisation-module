import { detectImageFormat, logger, optimiseImage } from '@common';

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
  canAcceptAvif: boolean,
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

  const originalImage = await imageRepository.get(imageKey);

  if (originalImage?.Body === undefined) {
    logger.error({
      message: 'unable to find image',
    });

    return;
  }

  const imageBuffer = Buffer.from(
    await originalImage.Body.transformToByteArray(),
  );

  const contentType = originalImage.ContentType?.split('image/')[1];

  const originalImageType = detectImageFormat(imageBuffer, contentType);

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
      canAcceptAvif,
    );

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
