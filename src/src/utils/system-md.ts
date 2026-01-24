import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { EstadoProjeto } from '../types/index.js';

/**
 * Gera o arquivo SYSTEM.md com contexto atual do projeto
 * Este arquivo serve como referência rápida para a IA
 */
export async function gerarSystemMd(
  diretorio: string, 
  estado: EstadoProjeto,
  faseNome?: string,
  especialista?: string,
  checklist?: string[]
): Promise<void> {
  await mkdir(join(diretorio, '.maestro'), { recursive: true });
  
  const entregaveis = estado.entregaveis || {};
  const gatesValidados = estado.gates_validados || [];
  
  const content = `# Sistema: ${estado.nome}

> Contexto atualizado automaticamente pelo MCP Maestro

## Estado Atual

| Campo | Valor |
|-------|-------|
| **Fase** | ${estado.fase_atual}/${estado.total_fases} - ${faseNome || 'Em andamento'} |
| **Tipo** | ${estado.tipo_artefato} |
| **Complexidade** | ${estado.nivel} |
| **Tier Gate** | ${estado.tier_gate} |
| **Atualizado** | ${new Date().toISOString()} |

## Especialista Ativo

🤖 **${especialista || 'Aguardando definição'}**

## Próximos Passos

${checklist?.length ? checklist.map((item, i) => `${i + 1}. ${item}`).join('\n') : '- Aguardando instruções'}

## Artefatos Gerados

${Object.keys(entregaveis).length > 0 
  ? Object.entries(entregaveis).map(([fase, arquivo]) => `- **Fase ${fase}**: ${arquivo}`).join('\n')
  : '- Nenhum artefato gerado ainda'}

## Gates Validados

${gatesValidados.length > 0 
  ? gatesValidados.map(g => `- ✅ Gate ${g} aprovado`).join('\n')
  : '- Nenhum gate validado ainda'}

---

*Arquivo gerado automaticamente. Não editar manualmente.*
`;

  await writeFile(join(diretorio, '.maestro', 'SYSTEM.md'), content, 'utf-8');
}
