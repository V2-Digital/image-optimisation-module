import { ImageTypes, detectImageFormat, logger, optimiseImage } from '@common';
import { s3Repository, externalRepository } from '@repositories';

interface OptimisedImage {
  image: Buffer;
  imageType: string;
  etag?: string;
  cacheControl?: string;
}


/**
 * Fetches and optimises an image from an S3 bucket.
 *
 * @param {string} imagePath - The S3 key of the image to fetch.
 * @param {number} width - The desired width of the optimised image.
 * @param {number} quality - The desired quality of the optimised image.
 * @param {ImageTypes} format - The desired format of the optimised image.
 * @returns {Promise<OptimisedImage | undefined>} - A promise that resolves to the optimised image or undefined if an error occurs.
 */
export const getOptimisedImageFromS3 = async (
  imagePath: string,
  width: number,
  quality: number,
  format: ImageTypes
): Promise<OptimisedImage | undefined> => {
  const imageKey = imagePath.slice(1);
  const originalImage = await s3Repository.get(imageKey);

  if (!originalImage?.Body) {
    logger.error({
      message: 'unable to find image in S3',
    });
    return;
  }

  const imageBuffer = Buffer.from(await originalImage.Body.transformToByteArray());
  const contentType = originalImage.ContentType?.split('image/')[1];
  const originalImageType = detectImageFormat(imageBuffer, contentType);

  if (!originalImageType) {
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
      format
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

/**
 * Fetches and optimises an image from an external URL.
 *
 * @param {string} imageUrl - The URL of the image to fetch.
 * @param {number} width - The desired width of the optimised image.
 * @param {number} quality - The desired quality of the optimised image.
 * @param {ImageTypes} format - The desired format of the optimised image.
 * @returns {Promise<OptimisedImage | undefined>} - A promise that resolves to the optimised image or undefined if an error occurs.
 */
export const getOptimisedImageFromExternal = async (
  imageUrl: string,
  width: number,
  quality: number,
  format: ImageTypes
): Promise<OptimisedImage | undefined> => {
  const imageBuffer = await externalRepository.get(imageUrl);
  if (!imageBuffer) {
    logger.error({
      message: 'unable to find image at external URL',
    });
    return;
  }

  const originalImageType = detectImageFormat(imageBuffer, undefined);
  if (!originalImageType) {
    logger.error({
      message: 'unable to determine image type',
    });
    return {
      image: imageBuffer,
      imageType: '',
    };
  }

  try {
    const { image, imageType } = await optimiseImage(
      imageBuffer,
      originalImageType,
      width,
      quality,
      format
    );

    return {
      image,
      imageType,
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
  };
};
