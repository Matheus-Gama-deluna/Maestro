# 📘 Plano de Controle – Implementação Fase 1 e Fase 2
**Projeto:** MCP Maestro – Otimização de Prompts e Skills  
**Responsável:** Equipe Maestro Core  
**Data:** 03/02/2026

---

## 🧱 Fase 1 – Fundação (Semanas 1-4)
### Objetivos
1. Criar `setup_inicial` e sistema global de preferências.
2. Garantir que skills/templates sejam lidos do diretório correto para cada IDE.
3. Ativar enforcement básico antes do salvamento/avanço de fases.

### Backlog Técnico
| Item | Descrição | Arquivos-alvo | Dependências |
|------|-----------|---------------|--------------|
| F1-01 | Implementar tool `setup_inicial` com schema completo (IDE, modo, Stitch, stacks, time) | `src/src/tools/setup-inicial.ts` | Novo arquivo; reutiliza helpers de storage |
| F1-02 | Persistir config global em `~/.maestro/config.json` (ler/gravar com fallback) | `src/src/state/config.ts` (novo) | F1-01 |
| F1-03 | Atualizar `iniciar_projeto` para consumir config global e acionar wizard apenas uma vez | `src/src/tools/iniciar-projeto.ts` | F1-01, F1-02 |
| F1-04 | Injetar rules/skills usando `ide-paths.ts` (`getSkillsDir`, `getSkillPath`) | `src/src/utils/content-injector.ts` | F1-03 |
| F1-05 | Criar `SkillEnforcement` básico (verificar leitura de SKILL.md, template e checklist) | `src/src/gates/intelligent-validator.ts` + novo módulo | F1-04 |
| F1-06 | Integrar enforcement em `proximo()` bloqueando avanço sem skill/template | `src/src/tools/proximo.ts` | F1-05 |
| F1-07 | Registrar logs em `.maestro/logs/enforcement.log` e salvar paths da IDE no estado | `src/src/state/storage.ts` | F1-06 |

### Critérios de Aceite
- Setup executado uma única vez por usuário; dados carregados automaticamente nos projetos seguintes.
- Mensagens de skill exibem caminhos corretos (ex.: `.windsurf/skills/...`).
- `proximo()` retorna erro claro quando a skill da fase não foi lida.
- Logs de enforcement listam fase, skill e resultado de validação.

---

## 🧠 Fase 2 – Inteligência (Semanas 5-8)
### Objetivos
1. Reorganizar fluxo: PRD primeiro, classificação automática após análise.
2. Implementar inferência inteligente controlada, respeitando dados sensíveis.
3. Integrar inferência com especialistas sem perguntas redundantes.

### Backlog Técnico
| Item | Descrição | Arquivos-alvo | Dependências |
|------|-----------|---------------|--------------|
| F2-01 | Ajustar `iniciar_projeto` para estado `aguardando_prd` e remover perguntas antecipadas | `src/src/tools/iniciar-projeto.ts` | F1-03 |
| F2-02 | Atualizar `proximo()` (fase 1) para chamar `analisarPRD()` + `sugerirClassificacao()` | `src/src/tools/proximo.ts` | F2-01 |
| F2-03 | Criar `PRDAnalyzer` com NLP/regex (entidades, integrações, segurança, escala) | `src/src/analyzers/prd-analyzer.ts` | F2-02 |
| F2-04 | Implementar `InferenceEngine` + `SensitiveDataGuard` com whitelist de campos inferíveis | `src/src/orchestrator/inference-engine.ts` | F2-02 |
| F2-05 | Integrar `SmartQuestionEngine` para priorizar perguntas (ignorar dados sensíveis) | `src/src/orchestrator/question-engine.ts` | F2-04 |
| F2-06 | Registrar inferências em `.maestro/logs/inference.log` com anonimização/hashes | `src/src/state/logs.ts` | F2-04 |
| F2-07 | Atualizar especialistas para exibir alertas automáticos via `formatSkillMessage()` usando a IDE correta | `src/src/tools/proximo.ts` + `content/skills/*` | F1-04 |

### Controles de Sensibilidade
- Lista de keywords sensíveis em `content/rules/SENSITIVE_KEYWORDS.md`.
- Campo `allowSensitiveInference` desabilitado por padrão em `setup_inicial`.
- `sanitizeContext()` remove/mascara emails, tokens, documentos antes de rodar inferência.
- Qualquer recomendação baseada em dados limitados deve retornar aviso pedindo confirmação do usuário.

### Critérios de Aceite
- Classificação sugerida somente após PRD, com justificativa textual (entidades, integrações, etc.).
- Inferência não utiliza campos marcados como sensíveis; logs mostram `hasSensitiveData=false` quando bloqueado.
- Especialistas perguntam apenas itens não inferidos com confiança ≥0.8.
- Caminhos de skills continuam corretos mesmo após reorganização do fluxo.

---

## 📈 Monitoramento e Métricas
| Métrica | Baseline | Meta após Fase 2 |
|---------|----------|------------------|
| Prompts por projeto | 25-35 | ≤ 18 |
| Tempo de setup | 10-15 min | 3-5 min |
| Erros de skill/template | Casuais | 0 bloqueados por enforcement |
| Incidentes de inferência sensível | Não rastreados | 0 (todos bloqueados/logados) |

---

## ✅ Próximos Passos
1. Validar plano com stakeholders e priorizar backlog F1-01 → F1-07.
2. Implementar Fase 1 e rodar QA focado em IDEs diferentes (Windsurf, Cursor, Antigravity).
3. Iniciar Fase 2 após verificação, garantindo integração entre `PRDAnalyzer`, `InferenceEngine` e `SmartQuestionEngine`.
4. Monitorar métricas e ajustar regras de sensibilidade antes da Fase 3.
