# Prompt: Infrastructure as Code com Terraform

> **Quando usar**: Provisionar infraestrutura em cloud de forma reproduzível
> **Especialista**: [DevOps e Infraestrutura](../../02-especialistas/Especialista%20em%20DevOps%20e%20Infraestrutura.md)
> **Nível**: Médio a Complexo

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- `docs/CONTEXTO.md` - Entendimento do projeto
- `docs/05-arquitetura/arquitetura.md` - Arquitetura e requisitos de infra

Após gerar, salve o resultado em:
- `infra/terraform/` - Diretório com módulos
- `infra/terraform/environments/` - Configs por ambiente

---

## Prompt Completo

```text
Atue como especialista em Terraform e Infrastructure as Code.

## Contexto do Projeto

[COLE O CONTEÚDO DE docs/CONTEXTO.md]

## Cloud Provider

- Provider: [AWS/GCP/Azure]
- Região principal: [região]
- Multi-região: [Sim/Não]

## Recursos Necessários

### Computação
- [ ] VMs/EC2 instances
- [ ] Containers (ECS/EKS/GKE/AKS)
- [ ] Serverless (Lambda/Cloud Functions)
- [ ] Auto Scaling Groups

### Banco de Dados
- [ ] PostgreSQL managed (RDS/Cloud SQL/Azure DB)
- [ ] MySQL managed
- [ ] MongoDB managed
- [ ] Redis managed
- [ ] ElasticSearch

### Rede
- [ ] VPC dedicada
- [ ] Subnets (públicas/privadas)
- [ ] Load Balancer
- [ ] CDN
- [ ] VPN/Direct Connect

### Storage
- [ ] Object Storage (S3/GCS/Blob)
- [ ] File Storage
- [ ] Block Storage

### Segurança
- [ ] IAM roles/policies
- [ ] Security Groups
- [ ] WAF
- [ ] Secrets Manager
- [ ] KMS

### Observabilidade
- [ ] CloudWatch/Cloud Monitoring
- [ ] Logs centralizados

## Ambientes

- [ ] Development
- [ ] Staging
- [ ] Production

## Requisitos

- State backend: [S3/GCS/Terraform Cloud]
- Módulos: [monolítico/modularizado]
- Tagging strategy: [padrão de tags]

---

## Sua Missão

Gere código Terraform organizado:

### 1. Estrutura de Diretórios

```
infra/terraform/
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── database/
│   ├── compute/
│   └── security/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   └── prod/
├── versions.tf
└── README.md
```

### 2. Provider e Versões

```hcl
# versions.tf
terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
```

### 3. Backend Configuration

```hcl
# environments/prod/backend.tf
terraform {
  backend "s3" {
    bucket         = "[project]-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "[region]"
    encrypt        = true
    dynamodb_table = "[project]-terraform-lock"
  }
}
```

### 4. Módulo VPC

```hcl
# modules/vpc/main.tf
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_subnet" "public" {
  count             = length(var.public_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.public_subnet_cidrs[count.index]
  availability_zone = var.azs[count.index]
  
  map_public_ip_on_launch = true
  
  tags = {
    Name = "${var.project_name}-public-${count.index + 1}"
    Type = "public"
  }
}

resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.azs[count.index]
  
  tags = {
    Name = "${var.project_name}-private-${count.index + 1}"
    Type = "private"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "${var.project_name}-igw"
  }
}

resource "aws_nat_gateway" "main" {
  count         = var.enable_nat_gateway ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id
  
  tags = {
    Name = "${var.project_name}-nat"
  }
}

resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? 1 : 0
  domain = "vpc"
}
```

```hcl
# modules/vpc/variables.tf
variable "project_name" {
  type        = string
  description = "Nome do projeto"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "CIDR block da VPC"
}

variable "public_subnet_cidrs" {
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
  description = "CIDRs das subnets públicas"
}

variable "private_subnet_cidrs" {
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
  description = "CIDRs das subnets privadas"
}

variable "azs" {
  type        = list(string)
  description = "Availability zones"
}

variable "enable_nat_gateway" {
  type        = bool
  default     = true
  description = "Habilitar NAT Gateway"
}
```

```hcl
# modules/vpc/outputs.tf
output "vpc_id" {
  value       = aws_vpc.main.id
  description = "ID da VPC"
}

output "public_subnet_ids" {
  value       = aws_subnet.public[*].id
  description = "IDs das subnets públicas"
}

output "private_subnet_ids" {
  value       = aws_subnet.private[*].id
  description = "IDs das subnets privadas"
}
```

### 5. Módulo Database

```hcl
# modules/database/main.tf
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet"
  subnet_ids = var.subnet_ids
  
  tags = {
    Name = "${var.project_name}-db-subnet"
  }
}

resource "aws_security_group" "db" {
  name        = "${var.project_name}-db-sg"
  description = "Security group for RDS"
  vpc_id      = var.vpc_id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = var.allowed_security_groups
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "main" {
  identifier           = "${var.project_name}-db"
  engine               = "postgres"
  engine_version       = var.postgres_version
  instance_class       = var.instance_class
  allocated_storage    = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  
  db_name  = var.database_name
  username = var.master_username
  password = var.master_password
  
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  
  multi_az               = var.multi_az
  publicly_accessible    = false
  storage_encrypted      = true
  deletion_protection    = var.environment == "prod" ? true : false
  skip_final_snapshot    = var.environment != "prod"
  
  backup_retention_period = var.backup_retention_days
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"
  
  performance_insights_enabled = true
  
  tags = {
    Name = "${var.project_name}-db"
  }
  
  lifecycle {
    prevent_destroy = false  # Mudar para true em prod
  }
}
```

### 6. Arquivo de Variáveis por Ambiente

```hcl
# environments/prod/terraform.tfvars
project_name = "myapp"
environment  = "prod"
aws_region   = "us-east-1"

# VPC
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
private_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
azs                  = ["us-east-1a", "us-east-1b", "us-east-1c"]

# Database
instance_class        = "db.t3.medium"
allocated_storage     = 50
max_allocated_storage = 200
multi_az              = true
backup_retention_days = 7

# Compute
instance_type    = "t3.medium"
min_size         = 2
max_size         = 10
desired_capacity = 2
```

### 7. Main Entry Point

```hcl
# environments/prod/main.tf
module "vpc" {
  source = "../../modules/vpc"
  
  project_name        = var.project_name
  vpc_cidr            = var.vpc_cidr
  public_subnet_cidrs = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  azs                 = var.azs
  enable_nat_gateway  = true
}

module "database" {
  source = "../../modules/database"
  
  project_name           = var.project_name
  environment            = var.environment
  vpc_id                 = module.vpc.vpc_id
  subnet_ids             = module.vpc.private_subnet_ids
  allowed_security_groups = [module.compute.app_security_group_id]
  
  instance_class        = var.instance_class
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  multi_az              = var.multi_az
  backup_retention_days = var.backup_retention_days
  
  database_name    = "${var.project_name}_${var.environment}"
  master_username  = "admin"
  master_password  = var.db_password  # De variável sensível
}
```

### 8. Comandos Úteis

```bash
# Inicializar
cd environments/prod
terraform init

# Planejar
terraform plan -out=tfplan

# Aplicar
terraform apply tfplan

# Ver estado
terraform state list

# Destruir (cuidado!)
terraform destroy

# Formatar código
terraform fmt -recursive

# Validar
terraform validate

# Importar recurso existente
terraform import module.vpc.aws_vpc.main vpc-12345
```
```

---

## Exemplo de Uso

```text
Atue como especialista em Terraform.

## Contexto

SaaS de gestão financeira para PMEs.

## Cloud Provider

- AWS
- Região: sa-east-1
- Multi-região: Não (por enquanto)

## Recursos

### Computação
- [x] ECS Fargate

### Banco
- [x] PostgreSQL RDS (Multi-AZ em prod)
- [x] Redis ElastiCache

### Rede
- [x] VPC dedicada
- [x] ALB público
- [x] Subnets públicas e privadas

### Segurança
- [x] IAM roles
- [x] Security Groups
- [x] Secrets Manager

## Ambientes

- [x] staging
- [x] prod

## Requisitos

- State no S3 com lock DynamoDB
- Módulos reutilizáveis
- Tags: Project, Environment, Team, CostCenter
```

---

## Checklist Pós-Geração

- [ ] Estrutura de diretórios organizada
- [ ] Backend remoto configurado (S3 + DynamoDB)
- [ ] Providers versionados
- [ ] Módulos com variables e outputs
- [ ] Separação por ambiente (tfvars)
- [ ] Tags padrão aplicadas
- [ ] Outputs para recursos importantes
- [ ] README com instruções
- [ ] .gitignore configurado (*.tfstate, .terraform/)
- [ ] Sensitive variables marcadas
