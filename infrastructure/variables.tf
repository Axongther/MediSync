# ============================================================
# variables.tf — MediSync MVP
# Define todos los parámetros configurables de la infraestructura.
# Las credenciales sensibles se pasan como variables para evitar
# hardcodearlas en el código fuente.
# ============================================================

# ----------------------------------------------------------
# General
# ----------------------------------------------------------
variable "aws_region" {
  description = "Región AWS donde se despliega la infraestructura"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre del proyecto, usado como prefijo en los recursos"
  type        = string
  default     = "medisync"
}

variable "environment" {
  description = "Entorno de despliegue (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# ----------------------------------------------------------
# Red (VPC)
# ----------------------------------------------------------
variable "vpc_cidr" {
  description = "Bloque CIDR de la VPC principal"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "Bloque CIDR de la subred pública (EC2 + S3 endpoint)"
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "Bloque CIDR de la subred privada (RDS)"
  type        = string
  default     = "10.0.2.0/24"
}

variable "private_subnet_cidr_b" {
  description = "Bloque CIDR de la segunda subred privada (requerida por RDS subnet group)"
  type        = string
  default     = "10.0.3.0/24"
}

variable "availability_zone" {
  description = "AZ principal para la subred pública y privada"
  type        = string
  default     = "us-east-1a"
}

variable "availability_zone_b" {
  description = "AZ secundaria requerida por el DB subnet group de RDS"
  type        = string
  default     = "us-east-1b"
}

# ----------------------------------------------------------
# EC2 (Backend Node.js + Express)
# ----------------------------------------------------------
variable "ec2_instance_type" {
  description = "Tipo de instancia EC2 (debe ser nano/micro/small/medium/large en AWS Academy)"
  type        = string
  default     = "t3.small"
}

variable "ec2_ami" {
  description = "AMI para la instancia EC2 (Amazon Linux 2023 en us-east-1)"
  type        = string
  default     = "ami-0c02fb55956c7d316" # Amazon Linux 2023 — us-east-1
}

variable "key_pair_name" {
  description = "Nombre del key pair para acceso SSH (usar 'vockey' en AWS Academy)"
  type        = string
  default     = "vockey"
}

# ----------------------------------------------------------
# RDS MySQL
# ----------------------------------------------------------
variable "db_instance_class" {
  description = "Clase de instancia RDS (máximo db.t3.medium en AWS Academy)"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Nombre de la base de datos MySQL"
  type        = string
  default     = "medisync_db"
}

variable "db_username" {
  description = "Usuario administrador de la base de datos RDS"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Contraseña del usuario administrador de RDS (mínimo 8 caracteres)"
  type        = string
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "Almacenamiento inicial en GB para RDS (máximo 100 GB en AWS Academy)"
  type        = number
  default     = 20
}

# ----------------------------------------------------------
# S3
# ----------------------------------------------------------
variable "s3_bucket_name" {
  description = "Nombre único del bucket S3 para archivos estáticos del frontend"
  type        = string
  default     = "medisync-static-assets"
}

# ----------------------------------------------------------
# Lambda / SES — Notificaciones
# ----------------------------------------------------------
variable "notification_email_from" {
  description = "Dirección de correo verificada en SES usada como remitente"
  type        = string
  default     = "noreply@medisync.example.com"
}

variable "lambda_runtime" {
  description = "Runtime de Lambda para las notificaciones"
  type        = string
  default     = "nodejs18.x"
}

# ----------------------------------------------------------
# Route 53
# ----------------------------------------------------------
# DESHABILITADO — se habilita cuando se tenga un dominio real registrado
# variable "domain_name" {
#   description = "Nombre de dominio gestionado en Route 53 (debe existir como hosted zone)"
#   type        = string
#   default     = "medisync.example.com"
# }
