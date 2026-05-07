# ============================================================
# outputs.tf — MediSync MVP
# Expone los valores más relevantes tras aplicar el plan Terraform.
# Útil para conectar otros módulos o para referencia rápida post-deploy.
# ============================================================

# ----------------------------------------------------------
# Red
# ----------------------------------------------------------
output "vpc_id" {
  description = "ID de la VPC principal de MediSync"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "ID de la subred pública (EC2)"
  value       = aws_subnet.public.id
}

output "private_subnet_id" {
  description = "ID de la subred privada principal (RDS)"
  value       = aws_subnet.private.id
}

# ----------------------------------------------------------
# EC2
# ----------------------------------------------------------
output "ec2_instance_id" {
  description = "ID de la instancia EC2 del backend"
  value       = aws_instance.backend.id
}

output "ec2_public_ip" {
  description = "Elastic IP pública asignada al EC2 backend"
  value       = aws_eip.backend.public_ip
}

output "ec2_public_dns" {
  description = "DNS público de la instancia EC2"
  value       = aws_instance.backend.public_dns
}

# ----------------------------------------------------------
# S3
# ----------------------------------------------------------
output "s3_bucket_name" {
  description = "Nombre del bucket S3 para archivos estáticos"
  value       = aws_s3_bucket.static.bucket
}

output "s3_website_endpoint" {
  description = "URL del sitio web estático servido desde S3"
  value       = aws_s3_bucket_website_configuration.static.website_endpoint
}

# ----------------------------------------------------------
# RDS
# ----------------------------------------------------------
output "rds_endpoint" {
  description = "Endpoint de conexión a la base de datos RDS MySQL"
  value       = aws_db_instance.mysql.address
  sensitive   = false # el host no es secreto; la contraseña sí lo es
}

output "rds_port" {
  description = "Puerto de la base de datos RDS MySQL"
  value       = aws_db_instance.mysql.port
}

output "rds_db_name" {
  description = "Nombre de la base de datos creada en RDS"
  value       = aws_db_instance.mysql.db_name
}

# ----------------------------------------------------------
# Lambda
# ----------------------------------------------------------
output "lambda_function_name" {
  description = "Nombre de la función Lambda de notificaciones"
  value       = aws_lambda_function.notifications.function_name
}

output "lambda_function_arn" {
  description = "ARN de la función Lambda de notificaciones"
  value       = aws_lambda_function.notifications.arn
}

# ----------------------------------------------------------
# Route 53
# ----------------------------------------------------------

# DESHABILITADO — depende de recursos Route 53 comentados en main.tf
# output "route53_backend_fqdn" {
#   description = "FQDN del registro A que apunta al backend EC2"
#   value       = aws_route53_record.backend.fqdn
# }

# DESHABILITADO — depende de recursos Route 53 comentados en main.tf
# output "route53_www_fqdn" {
#   description = "FQDN del registro CNAME para www"
#   value       = aws_route53_record.www.fqdn
# }
