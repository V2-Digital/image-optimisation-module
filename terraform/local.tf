locals {
  var_substitues = {
    "process.env.IMAGE_STORE_BUCKET" = "\"${var.image_bucket}\""
  }

  name = "image-optimisation"
}
