# Contexto do Sistema Maestro

## 🎯 Objetivo e Filosofia

O Maestro é um sistema de desenvolvimento assistido por IA que visa garantir qualidade de software através de processos estruturados (gates), adaptando-se à complexidade de cada projeto.

**Filosofia: "Qualidade Adaptativa"**
- A qualidade não é negociável, mas a formalidade sim.
- Um script simples precisa funcionar corretamente, mas não precisa de arquitetura de microserviços.
- Um sistema bancário precisa de rigor máximo em segurança e arquitetura.

## 🤖 Instruções para Agentes de IA

Ao operar o Maestro, você deve:

1. **Seguir o Processo Confirmado**:
   - Respeite o `tier_gate` definido no estado.
   - Não pule validações obrigatórias para aquele tier.

2. **Validar antes de Avançar**:
   - Use `validar_gate()` antes de considerar uma fase concluída.
   - Só sugira `proximo()` se o gate estiver verde ou se houver justificativa clara para forçar.

3. **Inferir com Cuidado**:
   - Ao iniciar projetos, analise a semântica da descrição.
   - Sempre peça confirmação ao usuário sobre suas inferências de Tipo e Complexidade.

4. **Proteção de Gates**:
   - O sistema bloqueia avanços com score < 70.
   - NUNCA tente burlar isso chamando `aprovar_gate` por conta própria.
   - Explique ao usuário o que falta e peça orientação.

## 🏗️ Taxonomia de Projetos

### Dimensão 1: Tipo de Artefato (`TipoArtefato`)

| Tipo | Descrição | Exemplo | Tier Típico |
|------|-----------|---------|-------------|
| `poc` | Prova de conceito, descartável | Spike técnico, teste de lib | Essencial |
| `script` | Automação, ferramenta CLI | Automação de backup, bot | Essencial |
| `internal` | Ferramenta interna, baixa escala | Dashboard admin, intranet | Base |
| `product` | Produto para usuários reais | SaaS, App Mobile, E-commerce | Base/Avançado |

### Dimensão 2: Complexidade (`NivelComplexidade`)

| Nível | Fases | Descrição |
|-------|-------|-----------|
| `simples` | 7 | MVP, escopo fechado, poucas integrações |
| `medio` | 13 | Sistema completo com BD, Auth, API |
| `complexo` | 17+ | Arquitetura distribuída, alta criticidade |

### Tiers de Gates (`TierGate`)

O tier define o RIGOR das validações:

- **Essencial**: Mínimo para funcionar. Foca em "O que" e "Como básico".
- **Base**: Padrão de indústria. Foca em "Como bem feito", manutenibilidade e segurança básica.
- **Avançado**: Estado da arte. Foca em escalabilidade, observabilidade, segurança avançada e compliance.

## 🛠️ Ferramentas Principais

- `iniciar_projeto`: Analisa e sugere configuração.
- `confirmar_projeto`: Cria o projeto com configuração validada.
- `validar_gate`: Verifica se o entregável atende aos requisitos do tier.
- `proximo`: Avança de fase (gera artefatos e atualiza estado).
- `classificar`: Permite ajustar a complexidade/tipo durante o projeto.

## 📚 Decisões Arquiteturais (ADRs)

- **Statelessness**: O servidor MCP não mantém estado em memória entre requisições (exceto cache de sessão). O estado "verdadeiro" fica em `.maestro/estado.json`.
- **Inferência + Confirmação**: A IA sugere, o humano decide. Isso evita alucinações de escopo.
- **Arquivo Único de Estado**: Tudo sobre o projeto vive em um JSON, facilitando backup e migração.
