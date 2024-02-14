import { detectImageFormat, logger, optimiseImage } from '@common';

import { imageRepository } from '@repositories';

interface OptimisedImage {
  image: Buffer;
  imageType: string;
  etag: string | undefined;
  cacheControl: string | undefined;
}

export const getOptimisedImage = async (
  imagePath: string,
  width: number,
  quality: number,
  canAcceptAvif: boolean
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

  const imageType = detectImageFormat(
    imageBuffer,
    originalImage.ContentType?.split('image/')[1],
  );

  if (imageType === undefined) {
    logger.error({
      message: 'unable to determine image type',
    });

    throw new Error('Unable to determine image type');
  }

  return {
    ...await optimiseImage(imageBuffer, imageType, width, quality, canAcceptAvif),
    cacheControl: originalImage.CacheControl,
    etag: originalImage.ETag,
  };
};
