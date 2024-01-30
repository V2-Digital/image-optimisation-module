import { detectImageFormat, logger, optimiseImage } from '@common';

import { imageRepository } from '@repositories';

interface OptimisedImage {
  body: ReadableStream;
  contentType: string;
}

export const getOptimisedImage = async (
  imagePath: string,
  width: number,
  quality: number,
): Promise<OptimisedImage | undefined> => {
  logger.info({
    message: 'getting optimised image',
    imagePath,
    width,
    quality
  })

  const originalImage = await imageRepository.get(imagePath);

  if (originalImage?.Body === undefined) {
    logger.error({
      message: 'unable to find image'
    })

    return;
  }

  const imageBuffer = Buffer.from(
    await originalImage.Body.transformToByteArray(),
  );

  const imageType = detectImageFormat(imageBuffer) ?? originalImage.ContentType;

  if (imageType === undefined) {
    logger.error({
      message: 'unable to determine image type'
    })

    throw new Error('Unable to determine image type')
  }

  const optimisedImage = await optimiseImage(imageBuffer, imageType, width, quality)

  return {
    body: new Blob([optimisedImage]).stream(),
    contentType: imageType
  }
};
