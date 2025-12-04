# Guia de Adição de Novas Funcionalidades

## Visão Geral
Este guia fornece um framework estruturado para adicionar novas funcionalidades aos projetos, seguindo as melhores práticas de desenvolvimento com IA.

A ideia é combinar **processo de engenharia de software** com **uso disciplinado de IA** (ex.: GPT 5.1) em cada etapa.

---

## 1. Análise Inicial

### 1.1 Entendimento do Contexto
- [ ] Revisar o PRD (Product Requirements Document) existente
- [ ] Analisar o Design System e padrões de UI/UX
- [ ] Verificar a arquitetura atual do sistema
- [ ] Identificar dependências e impactos potenciais

#### Sugestão de uso de IA

```text
Atue como product/tech lead.
Vou colar abaixo:
- trecho do PRD
- contexto do sistema
- anotações de stakeholders

Organize em:
- resumo da funcionalidade
- objetivos de negócio
- áreas do sistema impactadas
- riscos e dependências que devo observar.

Contexto:
[COLE AQUI]
```

### 1.2 Definição de Escopo
- [ ] Descrever a funcionalidade em formato de User Story
- [ ] Definir critérios de aceitação
- [ ] Mapear endpoints e modelos de dados necessários
- [ ] Identificar necessidades de migração de banco de dados

#### Sugestão de uso de IA

```text
Quero adicionar a seguinte funcionalidade ao sistema:
[DESCREVA EM LINGUAGEM NATURAL]

Transforme em:
- 1 a 3 histórias de usuário (Como [persona], quero [ação], para [benefício])
- critérios de aceitação
- lista inicial de endpoints/serviços e entidades que podem ser impactadas.
```

---

## 2. Planejamento Técnico

### 2.1 Especificação Técnica
- [ ] Atualizar documentação da API (OpenAPI/Swagger)
- [ ] Atualizar modelo de dados (Prisma/SQL)
- [ ] Definir contratos de interface
- [ ] Planejar testes necessários

#### Sugestão de uso de IA

```text
Aqui está a descrição da nova funcionalidade e a API atual (OpenAPI):
[COLE TRECHOS RELEVANTES]

Atue como arquiteto de software.
Proponha:
- novos endpoints ou ajustes em endpoints existentes
- exemplos de payloads de requisição/resposta
- impactos esperados no modelo de dados

Gere também um esboço de alterações em OpenAPI (YAML/JSON), sem inventar campos irreais.
```

### 2.2 Tarefas Técnicas
- [ ] Criar branch a partir da main (feature/nome-da-funcionalidade)
- [ ] Configurar ambiente de desenvolvimento
- [ ] Implementar camada de dados
- [ ] Desenvolver endpoints da API
- [ ] Implementar lógica de negócios
- [ ] Desenvolver componentes de UI
- [ ] Escrever testes automatizados

#### Sugestão de uso de IA

```text
História de usuário e descrição técnica da funcionalidade:
[COLE]

Gere um plano de implementação em tarefas técnicas, incluindo:
- passos para backend (dados, serviços, API)
- passos para frontend (componentes, estados, navegação)
- passos de testes (unitário, integração, E2E)

Organize em uma lista de tarefas que possa virar backlog de sprint.
```

---

## 3. Implementação com IA

### 3.1 Geração de Código
- [ ] Usar prompts específicos para geração de código
- [ ] Implementar seguindo padrões do projeto
- [ ] Revisar e refatorar código gerado
- [ ] Garantir aderência ao style guide

#### Sugestão de uso de IA

```text
Contexto do projeto:
- stack: [ex. Node + Nest + Postgres]
- padrão de arquitetura: [ex. camadas controller/service/repository]
- entidade(s) envolvida(s): [DESCREVA]

Funcionalidade a implementar:
[COLE HISTÓRIA + ESPECIFICAÇÃO]

Gere apenas o código do serviço/método de caso de uso responsável pela regra de negócio,
seguindo o estilo do projeto. Inclua tratamento de erros e tipos adequados.
Não gere controller/rotas ainda.
```

### 3.2 Testes Automatizados
- [ ] Gerar testes unitários com IA
- [ ] Implementar testes de integração
- [ ] Validar cobertura de testes (>80%)
- [ ] Executar testes de regressão

#### Sugestão de uso de IA

```text
Aqui está o serviço/método que acabei de implementar em [LINGUAGEM]:
[COLE CÓDIGO]

Gere testes unitários em [FRAMEWORK DE TESTES] cobrindo:
- caso de sucesso
- entradas inválidas
- casos de borda

Explique em 1 linha o que cada teste garante.
```

```text
Com base nos requisitos e fluxo da funcionalidade:
[COLE]

Sugira testes de integração e E2E mais importantes,
indicando quais ferramentas poderiam ser usadas (ex.: Postman, Playwright, Cypress).
```

---

## 4. Revisão e Qualidade

### 4.1 Code Review
- [ ] Revisar mudanças em pares
- [ ] Validar padrões de código
- [ ] Verificar vulnerabilidades de segurança
- [ ] Validar performance

#### Sugestão de uso de IA

```text
Atue como revisor de código sênior.

Aqui está o diff/arquivo da funcionalidade que implementei:
[COLE]

Avalie:
- legibilidade e organização
- possíveis bugs ou casos de erro não tratados
- conformidade com padrões de código e arquitetura

Sugira melhorias e, se fizer sentido, apresente uma versão refatorada de trechos críticos.
```

### 4.2 Testes Manuais
- [ ] Testar fluxos principais
- [ ] Validar responsividade
- [ ] Verificar acessibilidade
- [ ] Testar em diferentes navegadores

#### Sugestão de uso de IA

```text
Fluxo principal da funcionalidade:
[DESCREVA]

Gere um roteiro de testes manuais com passos claros,
considerando:
- caso de uso feliz
- erros comuns de usuário
- aspectos de acessibilidade e responsividade.
```

---

## 5. Implantação

### 5.1 Preparação para Produção
- [ ] Atualizar documentação
- [ ] Preparar scripts de migração
- [ ] Atualizar changelog
- [ ] Preparar rollback se necessário

#### Sugestão de uso de IA

```text
Mudanças feitas nesta funcionalidade:
[RESUMA]

Gere:
- um trecho de changelog
- uma lista de checagens para migração (se houver mudança de schema)
- um plano simples de rollback.
```

### 5.2 Deploy
- [ ] Merge para branch principal
- [ ] Executar pipeline de CI/CD
- [ ] Monitorar métricas pós-deploy
- [ ] Validar em ambiente de produção

#### Sugestão de uso de IA

```text
Descreva o ambiente de produção e as métricas críticas do sistema:
[COLE]

Sugira quais métricas devo monitorar especificamente
para esta nova funcionalidade nos primeiros dias pós-deploy.
```

---

## 6. Pós-Implantação

### 6.1 Monitoramento
- [ ] Configurar alertas
- [ ] Monitorar erros em produção
- [ ] Acompanhar métricas de desempenho
- [ ] Coletar feedback dos usuários

#### Sugestão de uso de IA

```text
Vou colar alguns erros/logs e feedbacks de usuários
após o deploy desta funcionalidade:
[COLE]

Agrupe em:
- bugs
- problemas de usabilidade
- pedidos de melhoria

Sugira ações de curto prazo e melhorias estruturais.
```

### 6.2 Melhorias Contínuas
- [ ] Analisar métricas de uso
- [ ] Identificar oportunidades de otimização
- [ ] Planejar próximas iterações
- [ ] Documentar lições aprendidas

#### Sugestão de uso de IA

```text
Aqui estão métricas de uso desta funcionalidade e observações da equipe:
[COLE]

Gere um pequeno relatório de lições aprendidas,
com recomendações para a próxima iteração.
```

---

## Ferramentas Recomendadas

### Desenvolvimento
- **Versionamento**: Git
- **CI/CD**: GitHub Actions, GitLab CI
- **Documentação**: Swagger/OpenAPI, Storybook ou equivalente
- **Testes**: Jest, Playwright, Cypress, ou ferramentas equivalentes da stack

### IA
- **Geração de Código**: GitHub Copilot, Codeium, modelos GPT
- **Revisão de Código**: CodeRabbit, SonarQube, modelos GPT
- **Documentação**: Mintlify, Docusaurus, modelos GPT

---

## Templates

### Pull Request
```markdown
## Descrição
[Breve descrição das mudanças]

## Tipo de Mudança
- [ ] Nova funcionalidade
- [ ] Correção de bug
- [ ] Melhoria de performance
- [ ] Atualização de documentação

## Checklist
- [ ] Meu código segue as diretrizes de estilo do projeto
- [ ] Adicionei testes que comprovam minha correção
- [ ] Testes unitários passam localmente
- [ ] Atualizei a documentação conforme necessário

## Screenshots/Vídeos
[Adicione capturas de tela ou vídeos se aplicável]
```

### User Story
```text
Como um [tipo de usuário],
Quero [ação],
Para que [benefício/valor].

Critérios de Aceitação:
- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3
```

---

## Boas Práticas

### Desenvolvimento
- Sempre comece pelos testes (ao menos pensando nos cenários).
- Mantenha as mudanças pequenas e focadas.
- Documente decisões arquiteturais relevantes.
- Siga o princípio da responsabilidade única.

### IA
- Revise sempre o código gerado.
- Mantenha prompts específicos e claros.
- Documente os prompts utilizados que funcionaram bem.
- Não confie cegamente nas saídas da IA; use como assistente, não como verdade absoluta.

---

## Recursos Adicionais
- [Documentação do Projeto](#)
- [Guia de Estilo](#)
- [Playbook de DevOps](#)
- [Política de Branches](#)
