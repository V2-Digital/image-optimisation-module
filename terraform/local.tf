locals {
  var_substitues = {
    "process.env.IMAGE_STORE_BUCKET" = "\"${data.aws_s3_bucket.image_bucket.id}\"",
    "process.env.AWS_REGION"         = "\"${data.aws_s3_bucket.image_bucket.region}\""
  }

  name = "image-optimisation"
}
