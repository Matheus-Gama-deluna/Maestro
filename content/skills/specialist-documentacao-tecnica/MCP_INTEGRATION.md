# 🔧 MCP Integration Guide · Documentação Técnica

## 🎯 Visão Geral

Este guia descreve como integrar o especialista de Documentação Técnica com o servidor MCP (Model Context Protocol) para automação completa de criação, validação e publicação de documentação técnica.

### 🏗️ Arquitetura de Integração

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Skill UI      │    │   MCP Server     │    │  External Tools │
│ (User Interface)│◄──►│ (Orchestration)  │◄──►│ (Execution)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   Templates & Examples    Functions Logic    Build & Deploy
   Progressive Disclosure   Quality Gates    CI/CD Pipeline
```

## 📋 Funções MCP Disponíveis

### 1. `init_documentation_structure`

**Propósito:** Criar estrutura base de documentação para um projeto.

#### Parâmetros
```typescript
interface InitDocumentationParams {
  project_path: string;           // Caminho do projeto
  project_type: "web" | "api" | "mobile" | "library";
  tier: "1" | "2" | "3";          // Nível de documentação
  audience: "developers" | "users" | "both";
  name: string;                   // Nome do projeto
  description: string;            // Descrição do projeto
}
```

#### Retorno
```typescript
interface InitDocumentationResult {
  status: "success" | "error";
  data: {
    project: ProjectInfo;
    created: {
      directories: string[];
      files: FileCreated[];
      templates: TemplateCreated[];
    };
    next_steps: string[];
    quality_score: QualityScore;
    created_at: string;
  };
}
```

#### Exemplo de Uso
```python
# No servidor MCP
async def init_documentation_structure(params: Dict) -> Dict:
    """Implementação real da função"""
    try:
        initializer = DocumentationInitializer(params["project_path"])
        result = await initializer.create_structure(params)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "error": str(e)}
```

---

### 2. `validate_documentation_quality`

**Propósito:** Validar qualidade da documentação existente.

#### Parâmetros
```typescript
interface ValidateQualityParams {
  project_path: string;
  validations: {
    completeness: boolean;
    accuracy: boolean;
    accessibility: boolean;
    freshness: boolean;
  };
  min_score: number;              // Score mínimo para aprovação
}
```

#### Retorno
```typescript
interface ValidateQualityResult {
  status: "success" | "error";
  data: {
    validation: {
      timestamp: string;
      total_score: number;
      min_score: number;
      passed: boolean;
      results: ValidationResults;
    };
    summary: string;
    recommendations: string[];
    next_steps: string[];
  };
}
```

#### Exemplo de Uso
```python
# No servidor MCP
async def validate_documentation_quality(params: Dict) -> Dict:
    """Implementação real da função"""
    try:
        validator = DocumentationValidator(params["project_path"])
        result = await validator.validate_quality(params)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "error": str(e)}
```

---

### 3. `process_documentation_for_publishing`

**Propósito:** Processar documentação para publicação automática.

#### Parâmetros
```typescript
interface ProcessForPublishingParams {
  project_path: string;
  platform: "github-pages" | "vercel" | "netlify" | "readthedocs";
  auto_sync: boolean;
  versioning: "semantic" | "date" | "custom";
  optimize_images: boolean;
  generate_pdf: boolean;
  minify: boolean;
}
```

#### Retorno
```typescript
interface ProcessForPublishingResult {
  status: "success" | "error";
  data: {
    processing: {
      timestamp: string;
      platform: string;
      steps_completed: number;
      total_steps: number;
    };
    results: {
      build_path: string;
      files_processed: number;
      optimization_stats: OptimizationStats;
      platform_config: PlatformConfig;
      deploy_ready: boolean;
    };
    next_actions: string[];
    quality_metrics: QualityMetrics;
  };
}
```

#### Exemplo de Uso
```python
# No servidor MCP
async def process_documentation_for_publishing(params: Dict) -> Dict:
    """Implementação real da função"""
    try:
        publisher = DocumentationPublisher(params["project_path"])
        result = await publisher.process_for_publishing(params)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "error": str(e)}
```

---

## 🚀 Configuração do Servidor MCP

### 1. Estrutura do Servidor

```python
# mcp_server_documentation.py
from mcp import Server, types
from .documentation_functions import (
    init_documentation_structure,
    validate_documentation_quality,
    process_documentation_for_publishing
)

app = Server("documentation-technical")

@app.call_tool()
async def handle_documentation_tool(
    name: str,
    arguments: dict
) -> dict:
    """Handler principal para ferramentas de documentação"""
    
    if name == "init_documentation_structure":
        return await init_documentation_structure(arguments)
    
    elif name == "validate_documentation_quality":
        return await validate_documentation_quality(arguments)
    
    elif name == "process_documentation_for_publishing":
        return await process_documentation_for_publishing(arguments)
    
    else:
        raise ValueError(f"Unknown tool: {name}")

@app.list_tools()
async def list_documentation_tools() -> list[types.Tool]:
    """Lista ferramentas disponíveis"""
    return [
        types.Tool(
            name="init_documentation_structure",
            description="Create documentation structure for a project",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_path": {"type": "string"},
                    "project_type": {"type": "string", "enum": ["web", "api", "mobile", "library"]},
                    "tier": {"type": "string", "enum": ["1", "2", "3"]},
                    "audience": {"type": "string", "enum": ["developers", "users", "both"]},
                    "name": {"type": "string"},
                    "description": {"type": "string"}
                },
                "required": ["project_path", "project_type", "tier", "audience", "name", "description"]
            }
        ),
        types.Tool(
            name="validate_documentation_quality",
            description="Validate documentation quality",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_path": {"type": "string"},
                    "validations": {
                        "type": "object",
                        "properties": {
                            "completeness": {"type": "boolean"},
                            "accuracy": {"type": "boolean"},
                            "accessibility": {"type": "boolean"},
                            "freshness": {"type": "boolean"}
                        }
                    },
                    "min_score": {"type": "number"}
                },
                "required": ["project_path", "min_score"]
            }
        ),
        types.Tool(
            name="process_documentation_for_publishing",
            description="Process documentation for publishing",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_path": {"type": "string"},
                    "platform": {"type": "string", "enum": ["github-pages", "vercel", "netlify", "readthedocs"]},
                    "auto_sync": {"type": "boolean"},
                    "versioning": {"type": "string", "enum": ["semantic", "date", "custom"]},
                    "optimize_images": {"type": "boolean"},
                    "generate_pdf": {"type": "boolean"},
                    "minify": {"type": "boolean"}
                },
                "required": ["project_path", "platform"]
            }
        )
    ]

async def main():
    """Função principal do servidor"""
    import sys
    
    # Inicializar servidor
    async with app.run() as server:
        await server.run(*sys.argv[1:])

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

### 2. Configuração do Cliente

```typescript
// client.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

class DocumentationClient {
  private client: Client;
  
  constructor() {
    const transport = new StdioClientTransport({
      command: "python",
      args: ["mcp_server_documentation.py"]
    });
    
    this.client = new Client(
      {
        name: "documentation-client",
        version: "1.0.0"
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );
    
    await this.client.connect(transport);
  }
  
  async initDocumentation(params: InitDocumentationParams): Promise<InitDocumentationResult> {
    const result = await this.client.callTool({
      name: "init_documentation_structure",
      arguments: params
    });
    
    return result.content as InitDocumentationResult;
  }
  
  async validateQuality(params: ValidateQualityParams): Promise<ValidateQualityResult> {
    const result = await this.client.callTool({
      name: "validate_documentation_quality",
      arguments: params
    });
    
    return result.content as ValidateQualityResult;
  }
  
  async processForPublishing(params: ProcessForPublishingParams): Promise<ProcessForPublishingResult> {
    const result = await this.client.callTool({
      name: "process_documentation_for_publishing",
      arguments: params
    });
    
    return result.content as ProcessForPublishingResult;
  }
}
```

---

## 🔄 Fluxo de Trabalho Completo

### 1. Inicialização do Projeto

```typescript
// Exemplo de fluxo completo
async function createProjectDocumentation() {
  const client = new DocumentationClient();
  
  // 1. Inicializar estrutura
  const initResult = await client.initDocumentation({
    project_path: "./my-project",
    project_type: "web",
    tier: "2",
    audience: "developers",
    name: "My Web Project",
    description: "A modern web application with React and Node.js"
  });
  
  console.log("✅ Estrutura criada:", initResult.data.created);
  
  // 2. Validar qualidade inicial
  const validationResult = await client.validateQuality({
    project_path: "./my-project",
    validations: {
      completeness: true,
      accuracy: true,
      accessibility: true,
      freshness: true
    },
    min_score: 75
  });
  
  console.log("📊 Score inicial:", validationResult.data.validation.total_score);
  
  // 3. Processar para publicação
  const publishResult = await client.processForPublishing({
    project_path: "./my-project",
    platform: "github-pages",
    auto_sync: true,
    versioning: "semantic",
    optimize_images: true,
    generate_pdf: false,
    minify: true
  });
  
  console.log("🚀 Ready for deploy:", publishResult.data.results.deploy_ready);
  
  return {
    init: initResult,
    validation: validationResult,
    publish: publishResult
  };
}
```

### 2. Atualização Contínua

```typescript
// Exemplo de atualização automatizada
async function updateDocumentation(projectPath: string) {
  const client = new DocumentationClient();
  
  // 1. Validar documentação atual
  const validation = await client.validateQuality({
    project_path: projectPath,
    validations: { completeness: true, accuracy: true, accessibility: true, freshness: true },
    min_score: 75
  });
  
  if (!validation.data.validation.passed) {
    console.log("⚠️ Documentação precisa de melhorias");
    
    // 2. Aplicar melhorias automáticas
    const improvements = await client.processForPublishing({
      project_path: projectPath,
      platform: "github-pages",
      auto_sync: false,
      versioning: "semantic",
      optimize_images: true,
      generate_pdf: false,
      minify: true
    });
    
    console.log("🔧 Melhorias aplicadas:", improvements.data.next_actions);
    
    // 3. Revalidar
    const revalidation = await client.validateQuality({
      project_path: projectPath,
      validations: { completeness: true, accuracy: true, accessibility: true, freshness: true },
      min_score: 75
    });
    
    if (revalidation.data.validation.passed) {
      console.log("✅ Documentação aprovada para publicação");
    }
  }
  
  return validation;
}
```

---

## 🛡️ Segurança e Validação

### 1. Validação de Parâmetros

```python
# validation.py
from pydantic import BaseModel, validator
from typing import List, Optional
from pathlib import Path

class InitDocumentationParams(BaseModel):
    project_path: str
    project_type: str
    tier: int
    audience: str
    name: str
    description: str
    
    @validator('project_path')
    def validate_project_path(cls, v):
        path = Path(v)
        if not path.exists():
            raise ValueError(f"Project path does not exist: {v}")
        return str(path.absolute())
    
    @validator('project_type')
    def validate_project_type(cls, v):
        valid_types = ['web', 'api', 'mobile', 'library']
        if v not in valid_types:
            raise ValueError(f"Invalid project_type. Must be one of: {valid_types}")
        return v
    
    @validator('tier')
    def validate_tier(cls, v):
        if v not in [1, 2, 3]:
            raise ValueError("Tier must be 1, 2, or 3")
        return v
    
    @validator('audience')
    def validate_audience(cls, v):
        valid_audiences = ['developers', 'users', 'both']
        if v not in valid_audiences:
            raise ValueError(f"Invalid audience. Must be one of: {valid_audiences}")
        return v
```

### 2. Tratamento de Erros

```python
# error_handling.py
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class DocumentationError(Exception):
    """Base exception for documentation errors"""
    pass

class ValidationError(DocumentationError):
    """Raised when validation fails"""
    pass

class ProcessingError(DocumentationError):
    """Raised when processing fails"""
    pass

def handle_mcp_error(func):
    """Decorator for MCP error handling"""
    async def wrapper(*args, **kwargs):
        try:
            result = await func(*args, **kwargs)
            return result
        except ValidationError as e:
            logger.error(f"Validation error: {e}")
            return {
                "status": "error",
                "error": "validation_error",
                "message": str(e)
            }
        except ProcessingError as e:
            logger.error(f"Processing error: {e}")
            return {
                "status": "error",
                "error": "processing_error",
                "message": str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return {
                "status": "error",
                "error": "unexpected_error",
                "message": "An unexpected error occurred"
            }
    return wrapper
```

---

## 📊 Monitoramento e Logging

### 1. Sistema de Logging

```python
# logging_config.py
import logging
import json
from datetime import datetime

class DocumentationLogger:
    def __init__(self):
        self.logger = logging.getLogger("documentation")
        self.logger.setLevel(logging.INFO)
        
        # File handler
        file_handler = logging.FileHandler("documentation.log")
        file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
        self.logger.addHandler(file_handler)
        
        # Structured logging for metrics
        self.metrics_logger = logging.getLogger("documentation_metrics")
        metrics_handler = logging.FileHandler("documentation_metrics.json")
        self.metrics_logger.addHandler(metrics_handler)
    
    def log_function_call(self, function_name: str, params: Dict, result: Dict):
        """Log function calls with metrics"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "function": function_name,
            "params": params,
            "result_status": result.get("status"),
            "duration_ms": result.get("duration_ms"),
            "score": result.get("data", {}).get("validation", {}).get("total_score")
        }
        
        self.metrics_logger.info(json.dumps(log_entry))
    
    def log_quality_metrics(self, project_path: str, metrics: Dict):
        """Log quality metrics"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "event": "quality_validation",
            "project_path": project_path,
            "metrics": metrics
        }
        
        self.metrics_logger.info(json.dumps(log_entry))
```

### 2. Métricas de Performance

```python
# metrics.py
import time
from functools import wraps
from typing import Dict, Any

def track_performance(func):
    """Decorator to track function performance"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            duration_ms = int((time.time() - start_time) * 1000)
            
            if isinstance(result, dict):
                result["duration_ms"] = duration_ms
            
            return result
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            return {
                "status": "error",
                "error": str(e),
                "duration_ms": duration_ms
            }
    return wrapper

class PerformanceMetrics:
    def __init__(self):
        self.metrics = {
            "init_calls": 0,
            "validate_calls": 0,
            "publish_calls": 0,
            "total_duration_ms": 0,
            "average_score": 0,
            "success_rate": 0
        }
    
    def record_call(self, function_name: str, duration_ms: int, success: bool, score: int = 0):
        """Record metrics for a function call"""
        self.metrics["total_duration_ms"] += duration_ms
        
        if function_name == "init_documentation_structure":
            self.metrics["init_calls"] += 1
        elif function_name == "validate_documentation_quality":
            self.metrics["validate_calls"] += 1
            if score > 0:
                self.metrics["average_score"] = (
                    (self.metrics["average_score"] * (self.metrics["validate_calls"] - 1) + score) /
                    self.metrics["validate_calls"]
                )
        elif function_name == "process_documentation_for_publishing":
            self.metrics["publish_calls"] += 1
        
        total_calls = (
            self.metrics["init_calls"] + 
            self.metrics["validate_calls"] + 
            self.metrics["publish_calls"]
        )
        
        if success:
            self.metrics["success_rate"] = (
                (self.metrics["success_rate"] * (total_calls - 1) + 100) / total_calls
            )
        else:
            self.metrics["success_rate"] = (
                (self.metrics["success_rate"] * (total_calls - 1)) / total_calls
            )
```

---

## 🚀 Deploy e Produção

### 1. Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy MCP server
COPY mcp_server_documentation.py .
COPY documentation_functions/ ./documentation_functions/

# Expose port (if needed)
EXPOSE 8000

# Run server
CMD ["python", "mcp_server_documentation.py"]
```

### 2. Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: documentation-mcp-server
spec:
  replicas: 2
  selector:
    matchLabels:
      app: documentation-mcp-server
  template:
    metadata:
      labels:
        app: documentation-mcp-server
    spec:
      containers:
      - name: server
        image: documentation-mcp-server:latest
        ports:
        - containerPort: 8000
        env:
        - name: LOG_LEVEL
          value: "INFO"
        - name: METRICS_ENABLED
          value: "true"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### 3. Monitoring Setup

```yaml
# monitoring.yaml
apiVersion: v1
kind: Service
metadata:
  name: documentation-mcp-service
spec:
  selector:
    app: documentation-mcp-server
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP

---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: documentation-mcp-monitor
spec:
  selector:
    matchLabels:
      app: documentation-mcp-server
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
```

---

## 📚 Recursos Adicionais

### Documentação de Referência
- **MCP Protocol:** https://modelcontextprotocol.io
- **Pydantic Validation:** https://pydantic-docs.helpmanual.io
- **Async Python:** https://docs.python.org/3/library/asyncio.html

### Exemplos Completos
- **Basic Setup:** Exemplo mínimo de configuração
- **Advanced Integration:** Integração com CI/CD
- **Custom Functions:** Como adicionar funções personalizadas
- **Error Handling:** Tratamento robusto de erros

### Comunidade e Suporte
- **Discord:** #mcp-documentation
- **GitHub Issues:** Para bugs e feature requests
- **Documentation:** https://docs.maestro.dev/mcp-documentation

---

**Status:** ✅ **Production Ready**  
**Versão:** v1.0.0  
**Última atualização:** 30/01/2026  

---

*Este guia está em constante evolução. Contribuições são bem-vindas!*