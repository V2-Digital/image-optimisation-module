variable "image_bucket" {
  description = "The bucket where the original images are stored"
  type = object({
    id  = string
    arn = string
  })
}
