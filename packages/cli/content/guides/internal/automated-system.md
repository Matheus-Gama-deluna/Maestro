---
description: Workflow para atualizar o arquivo de contexto mestre (SYSTEM.md)
---

# 📝 /atualizar-system - Manutenção de Contexto

> Este trabalho garante que o arquivo `.maestro/SYSTEM.md` reflita o estado exato do projeto, servindo como "memória rápida" para a IA a cada nova sessão.

## 1. Coleta de Dados

*   **Ação:** Leia `.maestro/estado.json`.
*   **Ação:** Leia `.maestro/resumo.json`.

## 2. Geração de SYSTEM.md

*   **Ação:** Sobrescreva `.maestro/SYSTEM.md` com o seguinte template preenchido:

```markdown
# Sistema: {nome_projeto}

> Contexto atualizado automaticamente pelo Maestro FS.

## Estado Atual

| Campo | Valor |
|-------|-------|
| **Fase** | {fase_atual}/{total_fases} - {nome_fase} |
| **Nível** | {nivel} |
| **Última Atualização** | {data_atual} |

## Objetivo Atual (Contexto)
{contexto_atual.objetivo}

## Especialista Ativo
🤖 **{especialista_da_fase}**

## Artefatos Gerados
{lista_de_entregaveis_formatada}

---
*Para ver detalhes completos, leia .maestro/resumo.json*
```

## 3. Trigger Automático

*   **Dica:** Este workflow deve ser rodado ao final de cada `/avancar-fase` ou `/iniciar-projeto`.
