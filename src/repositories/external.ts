import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { TASK_PARAMETERS, logger } from '@common';

const getFromExternal = TASK_PARAMETERS.GET_FROM_EXTERNAL === 'true';
const baseExternalUrl = TASK_PARAMETERS.BASE_EXTERNAL_URL;

let axiosInstance: AxiosInstance;

if (getFromExternal && baseExternalUrl) {
  axiosInstance = axios.create({
    baseURL: baseExternalUrl,
  });
} else {
  axiosInstance = axios.create();
}

/**
 * Fetches an image from an external source.
 *
 * @param {string} imageUrl - The path or full URL of the image to fetch.
 * If a full URL is provided, it will be used directly.
 * Example: "https://example.com/images/photo.png"
 *
 * If a relative path is provided, it will be appended to the base URL if configured.
 * Example: "/images/photo.png"
 *
 * @returns {Promise<Buffer | null>} - A promise that resolves to the image data or null if an error occurs.
 */
export const get = async (imageUrl: string): Promise<Buffer | null> => {
  try {
    const response: AxiosResponse<Buffer> = await axiosInstance.get(imageUrl, {
      responseType: 'arraybuffer',
    });

    return response.data;
  } catch (error) {
    logger.error({
      message: 'error getting image from external URL',
      error,
      imageUrl,
    });

    return null;
  }
};
