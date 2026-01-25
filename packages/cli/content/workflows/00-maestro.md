---
description: Workflow universal inteligente que detecta estado e toma a próxima ação
---

# 🤖 Workflow Universal - /maestro

## Objetivo

Detectar automaticamente o estado do projeto Maestro, validar se o estado reflete os fluxos MCP (7/13/17 fases + Stitch) e decidir a ação adequada, respondendo no chat com contexto completo.

## Sincronização com os fluxos MCP

Antes de qualquer decisão:

1. Ler `.maestro/estado.json` **e** o template original em `packages/cli/content/templates/estado-template.json` para entender a estrutura completa.
2. Ler `src/src/flows/types.ts` para conhecer `FLUXO_SIMPLES`, `FLUXO_MEDIO`, `FLUXO_COMPLEXO` e a inserção opcional de Stitch (`getFluxoComStitch`).
3. Verificar se `estado.fases` segue a mesma ordem e quantidade de fases do fluxo correspondente. Se detectar divergências (fase faltando, numeração diferente), listar no resumo e sugerir ao usuário rodar `/iniciar-projeto` ou ajustar manualmente.

## Como funciona

1. **Ler estado** em `.maestro/estado.json` (se não existir, classificar como `novo_projeto`).
2. **Validar consistência** comparando `estado.fases` com o fluxo MCP adequado.
3. **Classificar estado** usando a função mental abaixo.
4. **Mapear ação** (`/01-iniciar-projeto`, `/03-continuar-fase`, `/02-avancar-fase`).
5. **Responder** com resumo e próxima ação sugerida.

```javascript
const estado = lerJson('.maestro/estado.json');
const fluxo = estado?.projeto
  ? getFluxoComStitch(estado.projeto.complexidade, estado.projeto.usarStitch)
  : null;

if (!estado || !estado.projeto?.nome) {
  return { status: 'novo_projeto', proximaAcao: '/01-iniciar-projeto' };
}

const faseAtual = estado.fases[estado.faseAtual];
if (!faseAtual || faseAtual.status !== 'concluida') {
  return {
    status: 'fase_incompleta',
    proximaAcao: '/03-continuar-fase',
    fase: estado.faseAtual,
    arquivoFoco: faseAtual?.artefatos?.slice(-1)[0] || fluxo?.fases?.find(f => f.numero === estado.faseAtual)?.entregavel_esperado,
    divergenciasFluxo: compararComFluxo(estado.fases, fluxo?.fases)
  };
}

return {
  status: 'pronto_para_avancar',
  proximaAcao: '/02-avancar-fase',
  fase: estado.faseAtual,
  proximaFase: estado.faseAtual + 1,
  divergenciasFluxo: compararComFluxo(estado.fases, fluxo?.fases)
};
```

## Template de resposta

```
📋 **Status Detectado:** {status}
- Projeto: {estado.projeto.nome}
- Fase atual: {estado.faseAtual}/{totalFases} - {faseAtual.nome} (Status: {faseAtual.status})
- Tier: {estado.projeto.tier} | Nível: {estado.projeto.nivel}
- Última atualização: {estado.updated_at}
- Arquivo foco: {arquivoFoco}

🎯 **Próxima ação sugerida:** {proximaAcao}
➡️ Execute o comando correspondente ou peça um ajuste específico.

{divergenciasFluxo?.length ? `⚠️ Divergências detectadas entre estado e fluxo MCP:
- ${divergenciasFluxo.join('\n- ')}` : ''}
```

## Regras rápidas

- Sempre verificar se há bloqueios (`faseAtual.status === 'bloqueado'`) e destacar no resumo.
- Se detectar `novo_projeto`, **não** tentar gerar estado: apenas orientar o usuário a rodar `/iniciar-projeto`.
- Se o usuário preferir outra ação, respeitar e registrar no histórico (se aplicável).
