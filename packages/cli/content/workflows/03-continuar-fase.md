---
description: Retoma a fase atual exatamente do ponto onde foi interrompida
---

# 🔄 Workflow de Continuação - /continuar-fase

## 1. Ler estado atual

```javascript
const estado = lerJson('.maestro/estado.json');
const faseAtual = estado.fases[estado.faseAtual];
if (!faseAtual) throw new Error('Fase atual não encontrada');

function salvarEstado(state) {
  escreverJson('.maestro/estado.json', state, { spaces: 2 });
}
```

## 2. Identificar último artefato

- Use `faseAtual.artefatos` para encontrar o arquivo principal.
- Se vazio, referencie o template padrão da fase (ex.: `docs/01-produto/PRD.md`).

```javascript
const arquivo = faseAtual.artefatos?.slice(-1)[0] || faseAtual.entregavel;
const analise = analisarArquivo(arquivo);
/* analise = {
   secoesPreenchidas,
   secoesFaltantes,
   percentualCompleto,
   proximaSecao
} */
```

## 3. Mensagem de retomada

```
📋 **Retomando Fase {estado.faseAtual}/{estado.totalFases} - {faseAtual.nome}**
- Especialista: {faseAtual.especialista}
- Artefato: {arquivo}
- Progresso: {analise.percentualCompleto}%
- Última ação: {analise.ultimaSecao}
- Próxima tarefa: {analise.proximaSecao}
```

## 4. Carregar contexto

1. Consulte `content/guides/fases-mapeamento.md` para mapear fase → especialista/prompt/template/skills.
2. Abra o especialista e prompt correspondentes. Ex.: fase 2 → `specialists/Especialista em Engenharia de Requisitos com IA.md` + `prompts/requisitos.md`.
3. Carregue os templates associados (ver tabela) e compare com o artefato atual para detectar seções faltantes.
4. Liste explicitamente na resposta quais arquivos serão atualizados (ex.: `docs/02-requisitos/requisitos.md`, `templates/matriz-rastreabilidade.md`).

## 5. Retomar execução

- Perguntar ao usuário se deseja continuar exatamente da próxima seção, revisar algo ou mudar o foco.
- Ao continuar, seguir checklist da fase (regras em `content/rules/validation-rules.md`).

## 6. Atualização de estado (manual)

Quando terminar a sessão:
- Atualizar `faseAtual.progresso` e `faseAtual.artefatos`.
- Registrar nota no histórico, se necessário.
- Atualizar `estado.metrica.ultimoComando = '/continuar-fase'`.
- Chamar `salvarEstado(estado)` para persistir.
