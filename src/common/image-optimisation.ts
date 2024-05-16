import { ImageTypes } from './constants';
import sharp, { AvailableFormatInfo } from 'sharp';
import { logger } from './logger';

export const optimiseImage = async (
  image: Buffer,
  imageType: string,
  width: number,
  quality: number,
  format: ImageTypes,
): Promise<{
  image: Buffer;
  imageType: ImageTypes;
}> => {
  if (imageType === ImageTypes.svg || imageType === ImageTypes['svg+xml']) {
    return {
      image,
      imageType,
    };
  }

  const pipe = sharp(image);

  if (width > 0) {
    pipe.resize(width, undefined, {
      withoutEnlargement: true,
    });
  }

  if (imageType === ImageTypes.gif) {
    return {
      image: await pipe.toBuffer(),
      imageType,
    };
  }

  logger.info({
    message: `converting image to format: ${format}`,
  });
  const convertImageStart = performance.now()
  const imageBuffer = await pipe.toFormat(format as unknown as AvailableFormatInfo, {
    quality,
  }).toBuffer();
  const convertImageEnd = performance.now()

  logger.info({
    message: `converted image to format: ${format} in ${convertImageEnd - convertImageStart}ms`,
  });

  return {
    image: imageBuffer,
    imageType: format,
  };
};
