import axios, { AxiosResponse } from 'axios';
import { logger } from '@common';

export const get = async (imageUrl: string): Promise<Buffer | null> => {
  try {
    const response: AxiosResponse<Buffer> = await axios.get(imageUrl, {
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
