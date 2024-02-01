data "util_replace" "environment_variable_substitution" {
  content      = file("${path.module}/bin/index.js")
  replacements = local.var_substitues
}

resource "null_resource" "npm_install" {
  provisioner "local-exec" {
    command = "cd ${path.module}/bin && npm install --cpu=x64 --os=linux"
  }
  triggers = {
    always_run = timestamp()
  }
}

data "archive_file" "function" {
  type = "zip"

  output_path = "/tmp/function.zip"

  source {
    filename = "index.mjs"
    content  = data.util_replace.environment_variable_substitution.replaced
  }

  dynamic "source" {
    for_each = fileset("${path.module}/bin/node_modules", "**")

    content {
      content  = filebase64("${path.module}/bin/node_modules/${source.key}")
      filename = "node_modules/${source.key}"
    }
  }

  depends_on = [null_resource.npm_install]
}

resource "aws_lambda_function" "main" {
  function_name    = local.name
  role             = aws_iam_role.function.arn
  publish          = true
  source_code_hash = data.archive_file.function.output_base64sha256
  filename         = data.archive_file.function.output_path

  handler = "index.handler"
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
