locals {
  var_substitues = {
    "process.env.IMAGE_STORE_BUCKET" = "\"${var.image_bucket_name}\"",
    "process.env.AWS_REGION"         = "\"${var.image_bucket_region}\""
  }

  name = "image-optimisation"
}
