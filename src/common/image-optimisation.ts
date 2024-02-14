import { ImageTypes } from './constants';
import sharp from 'sharp';

export const optimiseImage = async (
  image: Buffer,
  imageType: string,
  width: number,
  quality: number,
  canAcceptAvif: boolean
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
    pipe.resize(width);
  }

  if (imageType === ImageTypes.gif) {
    return {
      image: await pipe.toBuffer(),
      imageType
    }
  }

  const desiredImageFormat = canAcceptAvif ? ImageTypes.avif : ImageTypes.webp

  pipe.toFormat(desiredImageFormat, {
    quality
  });

  return {
    image: await pipe.toBuffer(),
    imageType: desiredImageFormat,
  };
};
