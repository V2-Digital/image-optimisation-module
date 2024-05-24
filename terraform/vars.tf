variable "image_bucket_name" {
  description = "Name of the bucket the images are stored in"
  type        = string
}

variable "image_bucket_arn" {
  description = "ARN of the bucket the images are stored in"
  type        = string
}

variable "image_bucket_region" {
  description = "Region of the bucket the images are stored in"
  type        = string
}

variable "additional_lambda_variables" {
  description = "Additional variables to pass through to lambda"
  type        = map(string)
  default     = {}
}
