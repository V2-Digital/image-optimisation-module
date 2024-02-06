import { ImageTypes } from './constants';
import sharp from 'sharp';

const generateDesiredImageFormat = (contentType: string): ImageTypes => {
  if (contentType === ImageTypes.gif) {
    return ImageTypes.gif;
  }

  if (contentType === ImageTypes.avif) {
    return ImageTypes.avif;
  }

  return ImageTypes.webp;
};

export const optimiseImage = async (
  image: Buffer,
  imageType: string,
  width: number,
  quality: number,
): Promise<{
  image: Buffer;
  imageType: ImageTypes;
}> => {
  if (imageType === ImageTypes.svg) {
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

  const desiredImageFormat = generateDesiredImageFormat(imageType);

  pipe.toFormat(desiredImageFormat, {
    quality
  });

  return {
    image: await pipe.toBuffer(),
    imageType: desiredImageFormat,
  };
};
