# Guia Base do Sistema Maestro

**Versão:** 1.0  
**Data:** 2026-01-28  
**Autor:** Sistema de Análise  
**Status:** Documento de Referência

---

## 🎯 **Visão Geral do Maestro**

O Maestro é um sistema de orquestração para desenvolvimento assistido por IA que implementa:

- **Processo estruturado** com gates de qualidade entre fases
- **Especialistas de IA** para cada etapa do desenvolvimento  
- **Templates padronizados** para documentação
- **Classificação adaptativa** de complexidade de projetos
- **Persistência de estado** para manter contexto

### **Filosofia: "Qualidade Adaptativa"**
- A qualidade não é negociável, mas a formalidade sim
- Um script simples precisa funcionar corretamente, mas não precisa de arquitetura de microserviços
- Um sistema bancário precisa de rigor máximo em segurança e arquitetura

---

## 📁 **Estrutura Principal do Projeto**

```
Maestro/
├── src/                    # Servidor MCP (TypeScript)
│   ├── src/
│   │   ├── index.ts        # Entry point
│   │   ├── server.ts       # Configuração HTTP
│   │   ├── tools/          # Tools MCP (iniciar, proximo, etc.)
│   │   ├── resources/      # Resources (especialistas, templates)
│   │   ├── flows/          # Definição de fluxos por complexidade
│   │   ├── gates/          # Validadores de qualidade
│   │   └── state/          # Gerenciamento de estado
│   └── package.json
├── content/                 # Conteúdo para IA
│   ├── specialists/        # 25 especialistas IA
│   ├── templates/          # 21 templates de docs
│   ├── workflows/          # 19 workflows
│   ├── skills/             # 122+ skills técnicas
│   └── prompts/            # Prompts contextuais
├── docs/                   # Documentação técnica
└── packages/               # CLI e extensões
```

---

## 🔧 **Componentes-Chave**

### 1. **Servidor MCP**
- **Entry**: `src/src/index.ts`
- **Transporte**: HTTP + SSE (Streamable)
- **Endpoint público**: `https://maestro.deluna.dev.br/mcp`
- **Dependencies**: @modelcontextprotocol/sdk, express, cors, zod

### 2. **Especialistas IA (25)**

#### Especialistas Base
| Especialista | Foco | Quando Usar |
|--------------|------|-------------|
| Gestão de Produto | Visão, MVP, métricas | Início do projeto |
| Engenharia de Requisitos | Requisitos funcionais/não-funcionais | Após definir visão |
| UX Design | Fluxos, arquitetura de informação | Após requisitos |
| Modelagem de Domínio | Entidades, relacionamentos | Após UX |
| Arquitetura de Software | Stack, C4, padrões | Antes de codar |
| Segurança da Informação | OWASP, criptografia, LGPD | Durante e pós-dev |
| Desenvolvimento Backend | Services, controllers, testes | Após contrato |
| DevOps e Infraestrutura | CI/CD, Docker, IaC | Deploy e infra |

#### Especialistas Avançados
| Especialista | Foco | Quando Usar |
|--------------|------|-------------|
| Arquitetura Avançada | DDD, CQRS, Event Sourcing | Sistemas complexos/distribuídos |
| Performance e Escalabilidade | Load testing, caching | Alta escala |
| Observabilidade | Logs, métricas, tracing | Produção enterprise |

### 3. **Templates de Documentos (21)**

Templates estruturados para:
- `PRD.md` → Product Requirements Document
- `requisitos.md` → Requisitos funcionais/não-funcionais
- `design-doc.md` → Documento de design UX
- `modelo-dominio.md` → Entidades e relacionamentos
- `arquitetura.md` → Arquitetura C4
- `checklist-seguranca.md` → OWASP, autenticação
- `plano-testes.md` → Estratégia de testes
- `backlog.md` → Épicos e histórias

### 4. **Fluxos de Desenvolvimento**

Classificação automática baseada em complexidade:

| Nível | Fases | Tipo Projeto | Focus |
|-------|-------|--------------|-------|
| **Essencial** | 7 | POC, Script | Funciona? |
| **Base** | 13 | Internal, Product | Padrão indústria |
| **Avançado** | 17+ | Complexo | Estado da arte |

#### Critérios de Classificação
| Critério | Como Extrai | Pontos |
|----------|-------------|--------|
| Entidades | Conta substantivos em Funcionalidades | 1-3 |
| Integrações | Busca menções a APIs/sistemas externos | 1-3 |
| Segurança | Palavras-chave: auth, LGPD, compliance | 1-3 |
| Escala | Números de usuários mencionados | 1-3 |
| Tempo | Cronograma mencionado | 1-3 |
| Complexidade | Regras de negócio descritas | 1-3 |

**Resultado:**
- 8-12 pontos → Simples (5 fases)
- 13-18 pontos → Médio (10 fases)
- 19-24 pontos → Complexo (14 fases)

---

## 🚀 **Fluxo Principal de Uso**

### 1. **Inicialização**
```bash
# Setup do projeto
npx @maestro-ai/cli

# Inicia desenvolvimento
@mcp:maestro iniciar_projeto
```

### 2. **Desenvolvimento Estruturado**
```
Fase 1: Produto (PRD)
   ↓ [Gate: Problema, Personas, MVP]
Fase 2: Requisitos
   ↓ [Gate: IDs únicos, Critérios testáveis]
Fase 3: UX Design
   ↓ [Gate: Jornadas, Wireframes]
Fase 4: Modelo de Domínio
   ↓ [Gate: Entidades, Relacionamentos]
Fase 5: Arquitetura de Software
   ↓ [Gate: C4, Stack justificada]
Fase 6: Segurança
   ↓ [Gate: OWASP, Auth]
Fase 7: Testes
   ↓ [Gate: Casos de teste, Cobertura]
...continua até entrega final
```

### 3. **Gates de Qualidade**
- **Score >= 70**: Avança automaticamente ✅
- **Score < 70**: Bloqueia e mostra pendências 🔴
- **Proteção**: IA nunca aprova gates manualmente
- **Forçar**: Usuário pode forçar com justificativa

---

## 📋 **Principais Tools MCP**

| Tool | Função | Quando Usar |
|------|--------|-------------|
| `iniciar_projeto` | Cria novo projeto com classificação | Início |
| `confirmar_projeto` | Confirma criação do projeto | Após análise |
| `proximo` | Salva entregável e avança fase | Após completar |
| `validar_gate` | Valida checklist da fase | Antes de avançar |
| `status` | Retorna status do projeto | Verificar progresso |
| `contexto` | Obtém contexto completo | Para IA |
| `salvar` | Salva artefatos | Rascunhos/anexos |
| `nova_feature` | Fluxo para nova feature | Adicionar funcionalidade |
| `corrigir_bug` | Fluxo para correção de bugs | Debugging |
| `refatorar` | Fluxo para refatoração | Melhoria de código |

---

## 🔄 **Coleta Automática de Entregáveis**

O MCP utiliza **instruções embutidas nos especialistas** para que a IA automaticamente chame `proximo()` quando o desenvolvedor sinaliza que quer avançar.

### Gatilhos Reconhecidos
| Gatilho | Exemplos |
|---------|----------|
| **Próximo** | "próximo passo", "próxima fase", "next" |
| **Avançar** | "avançar", "seguir em frente", "continuar" |
| **Conclusão** | "terminei", "pronto", "finalizado" |
| **Implícito** | "pode salvar", "está bom assim" |

### Fluxo Automático
```
👤 Dev: "Próximo" / "Avançar" / "Terminei"
           │
           ▼
🤖 IA identifica entregável da conversa
           │
           ▼
🤖 IA chama: proximo(entregavel: "[conteúdo]")
           │
           ▼
✅ MCP salva, valida gate, carrega próxima fase
```

---

## 🎚️ **Sistema de Gates Adaptativos**

### Tier Essencial (POC, Script)
**Foco:** Funciona?
- Código executa sem erros
- Funcionalidade principal OK

### Tier Base (Internal, Product Simples)
**Foco:** Padrão indústria
- Tier Essencial +
- Testes unitários (>60%)
- Lint sem erros
- Segurança básica (OWASP)

### Tier Avançado (Product Complexo)
**Foco:** Estado da arte
- Tier Base +
- Testes E2E
- Observabilidade
- Performance otimizada
- Compliance (LGPD, SOC2)

---

## 📐 **Protocolo Frontend-First**

Para features com Frontend + Backend:

```
1. CONT (Contrato API)
   ├── Gera: openapi.yaml
   ├── Gera: types (FE + BE)
   └── Gera: Mock Server

2. Paralelo ⚡
   ├── FE (desenvolve contra mock)
   └── BE (implementa contrato)

3. INT (Integração)
   ├── Remove mocks
   ├── Conecta FE ↔ BE real
   └── Testes E2E
```

---

## 🧠 **Recursos MCP Disponíveis**

### Resources
| URI | Descrição |
|-----|-----------|
| `maestro://especialista/{nome}` | Especialistas de IA |
| `maestro://template/{nome}` | Templates de documentos |
| `maestro://guia/{nome}` | Guias práticos |
| `maestro://prompt/{categoria}/{nome}` | Prompts especializados |
| `maestro://system-prompt` | System prompt do Maestro |

### Estrutura de Arquivos Criada
```
[projeto]/
├── .maestro/
│   ├── estado.json          # ⭐ Fonte da verdade
│   ├── resumo.json          # Cache de contexto
│   └── gates-forcados.log   # Histórico de aprovações
└── docs/
    ├── 01-produto/
    │   └── PRD.md
    ├── 02-requisitos/
    │   └── requisitos.md
    ├── 03-ux/
    │   └── design-doc.md
    └── ...
```

---

## 🛠️ **CLI - Instalação e Uso**

### Instalação
```bash
# Instalação completa (todas as IDEs)
npx @maestro-ai/cli

# Apenas para uma IDE específica
npx @maestro-ai/cli --ide gemini
npx @maestro-ai/cli --ide cursor
npx @maestro-ai/cli --ide copilot
npx @maestro-ai/cli --ide windsurf
```

### Estrutura Criada pelo CLI
```
projeto/
├── .maestro/
│   ├── config.json          # Configuração do projeto
│   ├── content/             # Especialistas, templates, prompts
│   └── history/             # Histórico de conversas
├── .agent/
│   ├── skills/              # Skills para a IA
│   └── workflows/           # Workflows automatizados
└── [Arquivos de regras por IDE]
```

---

## 📊 **Métricas e Monitoramento**

### Métricas de Projeto
- **Tempo por fase**: Tracking de duração
- **Gates passados**: Taxa de sucesso
- **Gates forçados**: Qualidade vs velocidade
- **Score médio**: Qualidade geral

### Métricas de Uso
- **Workflows executados**: Popularidade
- **Especialistas usados**: Efetividade
- **Templates aplicados**: Adoção
- **Projetos concluídos**: Sucesso

---

## 🎯 **Próximos Passos para Desenvolvimento**

### **Para entender o sistema:**
1. **Leia** `docs/CONTEXTO_SISTEMA.md` - Filosofia e taxonomia
2. **Estude** `docs/PLANO_IMPLEMENTACAO.md` - Roadmap completo  
3. **Analise** `docs/MCP_ESPECIFICACAO.md` - Detalhes técnicos

### **Para contribuir:**
1. **Explore** `content/specialists/` - Entenda os especialistas
2. **Verifique** `content/templates/` - Templates de documentos
3. **Teste** `src/src/tools/` - Implementação das tools

### **Para estender:**
1. **Novos especialistas** → Adicionar em `content/specialists/`
2. **Novos templates** → Adicionar em `content/templates/`
3. **Novas validações** → Implementar em `src/src/gates/`

---

## 🔗 **Links Importantes**

- **Servidor Público**: https://maestro.deluna.dev.br
- **Health Check**: https://maestro.deluna.dev.br/health
- **CLI NPM**: @maestro-ai/cli
- **Documentação**: docs/README.md

---

## 📝 **Considerações Finais**

O sistema Maestro representa uma abordagem estruturada para desenvolvimento assistido por IA, combinando:

- **Simplicidade** de uso com **poder** de orquestração
- **Flexibilidade** de customização com **consistência** de qualidade  
- **Performance** local com **inteligência** distribuída
- **Portabilidade** universal com **integração** profunda

A base para guiar desenvolvimento de software está sólida e pronta para uso, com capacidade de adaptação automática à complexidade de cada projeto e garantia de qualidade através de gates validados.

---

**Versão:** 1.0  
**Data:** 2026-01-28  
**Próxima Revisão:** 2026-02-28
