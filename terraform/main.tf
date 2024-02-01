data "util_replace" "environment_variable_substitution" {
  content      = file("${path.module}/templates/index.js")
  replacements = local.var_substitues
}


data "archive_file" "function" {
  type = "zip"

  output_path = "/tmp/function.zip"

  source {
    filename = "index.js"
    content  = data.util_replace.environment_variable_substitution.replaced
  }

  source {
    filename = "package.json"
    content  = file("${path.module}/templates/package.json")
  }
}

resource "aws_lambda_function" "main" {
  function_name    = local.name
  role             = aws_iam_role.function.arn
  publish          = true
  source_code_hash = data.archive_file.function.output_base64sha256
  filename         = data.archive_file.function.output_path

  handler = "index.handle"
  runtime = "nodejs20.x"

  logging_config {

    log_group  = aws_cloudwatch_log_group.this.name
    log_format = "JSON"
  }
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${local.name}"
  retention_in_days = 7
}
