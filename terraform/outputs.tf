output "lambda_arn" {
  description = "ARN of the deployed lambda"
  value       = aws_lambda_function.main.arn
}
