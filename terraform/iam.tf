data "aws_iam_policy_document" "assume_role_policy_doc" {
  statement {
    sid    = "AllowAwsToAssumeRole"
    effect = "Allow"

    actions = ["sts:AssumeRole"]

    principals {
      type = "Service"

      identifiers = [
        "edgelambda.amazonaws.com",
        "lambda.amazonaws.com",
      ]
    }
  }
}

data "aws_iam_policy_document" "image_bucket_access" {
  statement {
    sid    = "AllowImageBucketAcess"
    effect = "Allow"

    actions   = ["s3:GetObject"]
    resources = ["${var.image_bucket_arn}/*"]
  }
}

resource "aws_iam_role" "function" {
  name = "${local.name}-function"

  assume_role_policy = data.aws_iam_policy_document.assume_role_policy_doc.json

  inline_policy {
    name   = "image_bucket_access"
    policy = data.aws_iam_policy_document.image_bucket_access.json
  }

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  ]
}
