locals {
  var_substitues = merge({
    "process.env.IMAGE_STORE_BUCKET" = "\"${var.image_bucket_name}\"",
    "process.env.AWS_REGION"         = "\"${var.image_bucket_region}\""
    },
    { for variable_key, variable_value in var.additional_lambda_variables : "process.env.${variable_key}" => variable_value }
  )

  name = "image-optimisation"
}
