import { detectImageFormat, imageFormats, optimiseImage } from '@common';

import { imageRepository } from '@repositories';

const generateOptimisedImageKey = (
  imagePath: string,
  width: number,
  quality: number,
) =>
  `resized/${imagePath.replaceAll('/', '-')}-${imagePath.replaceAll(
    '/',
    '-',
  )}-${width}-${quality}-cover`;

interface OptimisedImage {
  body: ReadableStream;
  contentType: string;
}

export const getOptimisedImage = async (
  imagePath: string,
  width: number,
  quality: number,
): Promise<OptimisedImage | undefined> => {
  const optimisedImageKey = generateOptimisedImageKey(
    imagePath,
    width,
    quality,
  );

  const cachedImage = await imageRepository.get(optimisedImageKey);

  if (cachedImage?.Body !== undefined) {
    return {
      body: cachedImage.Body?.transformToWebStream(),
      contentType: cachedImage.ContentType || imageFormats.WEBP,
    };
  }

  const originalImage = await imageRepository.get(imagePath);

  if (originalImage?.Body === undefined) {
    return;
  }

  const imageBuffer = Buffer.from(
    await originalImage.Body.transformToByteArray(),
  );

  const imageType = detectImageFormat(imageBuffer) ?? originalImage.ContentType;

  if (imageType === undefined) {
    return
  }

  const optimisedImage = await optimiseImage(imageBuffer, imageType, width, quality)

  imageRepository.store(
    optimisedImageKey,
    imageType,
    optimisedImage
  )

  return {
    body: new Blob([optimisedImage]).stream(),
    contentType: imageType
  }
};
