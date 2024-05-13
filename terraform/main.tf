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

// Using sensitive to reduce console noise
resource "local_sensitive_file" "function" {
  content  = data.util_replace.environment_variable_substitution.replaced
  filename = "${path.module}/bin/index.mjs"
}

data "archive_file" "function" {
  type = "zip"

  output_path = "/tmp/function.zip"
  source_dir  = "${path.module}/bin"

  excludes = ["package.json", "index.js"]

  depends_on = [null_resource.npm_install, local_sensitive_file.function]
}

resource "aws_lambda_function" "main" {
  function_name    = local.name
  role             = aws_iam_role.function.arn
  publish          = true
  source_code_hash = data.archive_file.function.output_base64sha256
  filename         = data.archive_file.function.output_path

  handler = "index.handler"
  runtime = "nodejs20.x"
  memory_size = 1769
}
