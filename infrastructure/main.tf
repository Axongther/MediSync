# ============================================================
# main.tf — MediSync MVP
# Infraestructura principal en AWS (us-east-1).
# Restricciones AWS Academy:
#   - IAM: usar LabRole / LabInstanceProfile (no crear roles nuevos)
#   - EC2: máximo nano/micro/small/medium/large, máx 9 instancias
#   - RDS: máximo db.t3.medium, gp2, sin Enhanced Monitoring
#   - Sin Cognito, sin CloudFront
# ============================================================

terraform {
  required_version = ">= 1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

# ----------------------------------------------------------
# Provider
# ----------------------------------------------------------
provider "aws" {
  region = var.aws_region
}

# ----------------------------------------------------------
# Data sources
# ----------------------------------------------------------

# Obtiene el ARN del rol LabRole pre-creado por AWS Academy.
# No se puede crear un rol nuevo; se reutiliza este.
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# DESHABILITADO — requiere dominio real registrado en Route 53
# data "aws_route53_zone" "main" {
#   name         = var.domain_name
#   private_zone = false
# }

# ============================================================
# RED — VPC, Subredes, Internet Gateway, Route Tables
# ============================================================

# VPC principal del proyecto
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "${var.project_name}-vpc"
    Environment = var.environment
  }
}

# Internet Gateway — permite que la subred pública acceda a Internet
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# Subred pública — aloja la instancia EC2 (backend)
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = var.availability_zone
  map_public_ip_on_launch = true # EC2 recibe IP pública automáticamente

  tags = {
    Name = "${var.project_name}-subnet-public"
  }
}

# Subred privada principal — aloja RDS MySQL
resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidr
  availability_zone = var.availability_zone

  tags = {
    Name = "${var.project_name}-subnet-private-a"
  }
}

# Segunda subred privada — RDS subnet group requiere mínimo 2 AZs
resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidr_b
  availability_zone = var.availability_zone_b

  tags = {
    Name = "${var.project_name}-subnet-private-b"
  }
}

# Tabla de rutas para la subred pública — dirige tráfico a Internet via IGW
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-rt-public"
  }
}

# Asocia la tabla de rutas pública con la subred pública
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ============================================================
# SECURITY GROUPS
# ============================================================

# Security Group para EC2 (backend Node.js)
# Permite: HTTP (80), HTTPS (443) desde cualquier origen, SSH (22) restringido
resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-sg-ec2"
  description = "Trafico permitido hacia el backend EC2 de MediSync"
  vpc_id      = aws_vpc.main.id

  # HTTP — tráfico web sin cifrar
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS — tráfico web cifrado
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSH — acceso administrativo (restringir a IP conocida en producción)
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # TODO: reemplazar con tu IP en producción
  }

  # Todo el tráfico saliente está permitido
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-ec2"
  }
}

# Security Group para RDS MySQL
# Solo acepta conexiones desde el SG de EC2 en el puerto 3306
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-sg-rds"
  description = "Acceso a RDS MySQL solo desde el SG de EC2"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "MySQL desde EC2"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id] # referencia al SG de EC2
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-rds"
  }
}

# ============================================================
# EC2 — Backend Node.js + Express
# ============================================================

# Instancia EC2 en la subred pública con el backend de MediSync.
# Usa LabInstanceProfile (LabRole) para acceso a otros servicios AWS.
resource "aws_instance" "backend" {
  ami                    = var.ec2_ami
  instance_type          = var.ec2_instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = var.key_pair_name
  iam_instance_profile   = "LabInstanceProfile" # rol pre-creado por AWS Academy

  # Script de arranque: instala Node.js y arranca la aplicación
  user_data = <<-EOF
    #!/bin/bash
    set -e
    yum update -y
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs git
    # Clonar y arrancar la aplicación (ajustar URL del repo)
    # git clone https://github.com/tu-org/medisync-backend.git /app
    # cd /app && npm install && npm start
    echo "EC2 MediSync backend listo"
  EOF

  tags = {
    Name        = "${var.project_name}-ec2-backend"
    Environment = var.environment
  }
}

# Elastic IP — IP pública fija para el EC2 (no cambia al reiniciar)
resource "aws_eip" "backend" {
  instance = aws_instance.backend.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-eip-backend"
  }
}

# ============================================================
# S3 — Archivos estáticos del frontend
# ============================================================

# Bucket S3 para servir archivos estáticos (HTML, CSS, JS, imágenes).
# En este MVP se accede directamente; CloudFront se puede agregar después.
resource "aws_s3_bucket" "static" {
  bucket        = var.s3_bucket_name
  force_destroy = true # permite destruir el bucket aunque tenga objetos (útil en dev)

  tags = {
    Name        = "${var.project_name}-static"
    Environment = var.environment
  }
}

# Configuración de hosting estático en S3
resource "aws_s3_bucket_website_configuration" "static" {
  bucket = aws_s3_bucket.static.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

# Deshabilita el bloqueo de acceso público para permitir lectura pública
resource "aws_s3_bucket_public_access_block" "static" {
  bucket = aws_s3_bucket.static.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Política de bucket: permite lectura pública de todos los objetos
resource "aws_s3_bucket_policy" "static_public_read" {
  bucket = aws_s3_bucket.static.id

  depends_on = [aws_s3_bucket_public_access_block.static]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.static.arn}/*"
      }
    ]
  })
}

# ============================================================
# RDS — MySQL en subred privada
# ============================================================

# Subnet group de RDS: agrupa las dos subredes privadas (RDS requiere ≥2 AZs)
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private.id, aws_subnet.private_b.id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# Instancia RDS MySQL en la subred privada.
# Restricciones AWS Academy: máximo db.t3.medium, gp2, sin Enhanced Monitoring.
resource "aws_db_instance" "mysql" {
  identifier             = "${var.project_name}-mysql"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = var.db_instance_class
  allocated_storage      = var.db_allocated_storage
  storage_type           = "gp2"   # único tipo soportado en AWS Academy
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false   # solo accesible desde dentro de la VPC
  skip_final_snapshot    = true    # facilita destroy en entorno de desarrollo
  multi_az               = false   # single-AZ para reducir costos en MVP

  # Enhanced Monitoring deshabilitado (no soportado en AWS Academy)
  monitoring_interval = 0

  tags = {
    Name        = "${var.project_name}-rds-mysql"
    Environment = var.environment
  }
}

# ============================================================
# LAMBDA + SES — Notificaciones automáticas
# Lambda y SES operan fuera de la VPC (acceso a Internet nativo).
# Se usa LabRole para los permisos de Lambda.
# ============================================================

# Empaqueta el código de la función Lambda desde el directorio local
data "archive_file" "lambda_notifications" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/lambda/notifications"
  output_path = "${path.module}/lambda_notifications.zip"
}

# Función Lambda que envía notificaciones por correo usando SES
resource "aws_lambda_function" "notifications" {
  function_name    = "${var.project_name}-notifications"
  filename         = data.archive_file.lambda_notifications.output_path
  source_code_hash = data.archive_file.lambda_notifications.output_base64sha256
  handler          = "index.handler"
  runtime          = var.lambda_runtime

  # Usa LabRole (pre-creado por AWS Academy) — incluye permisos para SES
  role = data.aws_iam_role.lab_role.arn

  # Variables de entorno disponibles dentro de la función
  environment {
    variables = {
      FROM_EMAIL   = var.notification_email_from
      DB_HOST      = aws_db_instance.mysql.address
      DB_NAME      = var.db_name
    }
  }

  # Lambda fuera de VPC para acceder a SES sin necesidad de NAT Gateway
  # (SES no tiene VPC endpoint en todas las regiones)

  tags = {
    Name        = "${var.project_name}-lambda-notifications"
    Environment = var.environment
  }
}

# Permiso para que EventBridge (o cualquier servicio AWS) invoque la Lambda
resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.notifications.function_name
  principal     = "events.amazonaws.com"
}

# ============================================================
# ROUTE 53 — Entrada de tráfico hacia EC2
# ============================================================

# DESHABILITADO — requiere dominio real registrado en Route 53
# resource "aws_route53_record" "backend" {
#   zone_id = data.aws_route53_zone.main.zone_id
#   name    = var.domain_name
#   type    = "A"
#   ttl     = 300
#   records = [aws_eip.backend.public_ip]
# }

# DESHABILITADO — requiere dominio real registrado en Route 53
# resource "aws_route53_record" "www" {
#   zone_id = data.aws_route53_zone.main.zone_id
#   name    = "www.${var.domain_name}"
#   type    = "CNAME"
#   ttl     = 300
#   records = [var.domain_name]
# }
