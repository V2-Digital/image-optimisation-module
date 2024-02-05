import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { TASK_PARAMETERS, logger } from "@common";

const s3Client = new S3Client({
  region: "ap-southeast-2",
});

export const get = async (imageKey: string) => {
  return s3Client.send(new GetObjectCommand({
    Bucket: TASK_PARAMETERS.IMAGE_STORE_BUCKET,
    Key: imageKey
  })).catch((error) => {

    logger.error({
      message: 'error getting image from image store',
      error,
      imageKey
    })

    return null
  })
}
