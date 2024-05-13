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

  pipe.toFormat(format as unknown as AvailableFormatInfo, {
    quality,
  });

  return {
    image: await pipe.toBuffer(),
    imageType: format,
  };
};
