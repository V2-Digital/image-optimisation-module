import sharp, { Sharp } from 'sharp';

import { imageFormats } from '@common';

const translateImageFormat = (contentType: string, pipe: Sharp) => {
  if (contentType === imageFormats.GIF) {
    return pipe;
  }

  if (contentType === imageFormats.AVIF) {
    return pipe.toFormat('avif');
  }

  return pipe.toFormat('webp');
};

const setImageQuality = (contentType: string, quality: number, pipe: Sharp) => {
  if (contentType === imageFormats.GIF) {
    return pipe;
  }

  if (contentType === imageFormats.AVIF) {
    return pipe.avif({
      quality,
    });
  }

  return pipe.webp({
    quality,
  });
};

export const optimiseImage = async (
  imageBuffer: Buffer,
  contentType: string,
  width: number,
  quality: number,
): Promise<Buffer> => {
  if (contentType === imageFormats.SVG) {
    return imageBuffer;
  }

  let pipe = sharp(imageBuffer);

  pipe.resize(width);

  pipe = translateImageFormat(contentType, pipe);

  pipe = setImageQuality(contentType, quality, pipe);

  return pipe.toBuffer();
};
