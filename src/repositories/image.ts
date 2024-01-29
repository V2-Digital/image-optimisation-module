import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { TASK_PARAMETERS, logger } from "@common";

const s3Client = new S3Client({
  region: "ap-southeast-2",
});

export const get = async (imageKey: string) => {
  return s3Client.send(new GetObjectCommand({
    Bucket: TASK_PARAMETERS.IMAGE_STORE_BUCKET,
    Key: imageKey
  })).catch(() => {

    logger.error({
      message: 'image not found in image store',
      imageKey
    })

    return null
  })
}

export const store = async (imageKey: string, contentType: string, buffer: Buffer) => {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: TASK_PARAMETERS.IMAGE_STORE_BUCKET,
      Key: imageKey,
      ContentType: contentType,
      Body: buffer,
    })
  );
}
