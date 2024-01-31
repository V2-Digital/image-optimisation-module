variable "image_bucket" {
  type        = string
  description = "ARN of the bucket where the original images are stored"
}

variable "function_archive" {
  type        = string
  description = "ARN of the bucket to store the function package in"
}

variable "function_archive_prefix" {
  type        = string
  description = "The value to prefix to the function archive location"
}
