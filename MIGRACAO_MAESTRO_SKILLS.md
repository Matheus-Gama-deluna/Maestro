# Migração de `maestro://` para Skills Locais - Estratégia e Status

## Decisão: Opção A (Compatibilidade com Deprecação Gradual)

### Justificativa
- **Compatibilidade**: Mantém prompts antigos funcionando
- **Transição suave**: Permite migração gradual sem quebrar fluxos existentes
- **Melhor UX**: Erros informativos guiam usuários para novo modelo

---

## Status da Implementação

### ✅ Fase 1: Diagnóstico (Completo)
- [x] Inventário de usos legados de `maestro://`
- [x] Mapeamento da arquitetura de skills
- [x] Análise do ciclo completo do `proximo()`
- [x] Relação entre Fases e Skills

**Arquivos afetados:**
- `src/tools/proximo.ts` (1 ocorrência)
- `src/utils/instructions.ts` (6 ocorrências)
- `src/resources/index.ts` (4 handlers)
- `src/utils/files.ts` (funções `lerEspecialista`, `lerTemplate`)

---

### ✅ Fase 2: Hotfix (Completo)
- [x] Normalização robusta de nomes em `lerEspecialista`
  - Função `normalizarNomeEspecialista()` com remoção de acentos
  - Mapa `ESPECIALISTA_SKILL_MAP` com aliases
  - 3 estratégias de busca (alias → fuzzy → includes)
  
- [x] Mensagens de erro melhoradas
  - Lista skills disponíveis
  - Sugestão de verificar `content/skills`
  - Contexto detalhado

**Arquivos modificados:**
- `src/utils/files.ts` - `lerEspecialista()` refatorado

---

### ✅ Fase 3: Migração Estrutural (Completo)
- [x] Atualizar mensagens do `proximo()` para skills
  - Bloco "Entregável Inválido" agora usa `getIDESkillResourcePath()`
  - Instruções apontam para caminhos locais (`.windsurf/skills/...`)
  
- [x] Refatorar `utils/instructions.ts` para skills
  - `gerarInstrucaoRecursos()` - recebe `faseNome` ao invés de especialista/template
  - `gerarInstrucaoRecursosCompacta()` - versão compacta
  - `gerarInstrucaoProximaFase()` - para transição entre fases
  - Todos usam `getSkillParaFase()` + `getSkillResourcePath()`

- [x] Adicionar campo `skill` ao tipo `Fase`
  - Campo opcional em `src/types/index.ts`
  - Adicionado a todas as fases do `FLUXO_SIMPLES`

**Arquivos modificados:**
- `src/tools/proximo.ts` - Mensagem de entregável inválido
- `src/utils/instructions.ts` - Todas as 3 funções refatoradas
- `src/types/index.ts` - Campo `skill?` adicionado

---

### 🔄 Fase 4: Estratégia para `maestro://` (Em Progresso)

#### Opção Escolhida: A (Compatibilidade com Deprecação Gradual)

**Implementação:**
1. Manter handlers em `src/resources/index.ts` funcionando
2. Adicionar warnings de deprecação nos comentários
3. Melhorar mensagens de erro (já feito em Fase 2)
4. Documentar migração para usuários

**Próximos passos:**
- [ ] Adicionar comentário de deprecação em `resources/index.ts`
- [ ] Atualizar system prompt com aviso de deprecação
- [ ] Criar guia de migração para usuários

---

### ⏳ Fase 5: Testes e Validação (Pendente)

**Testes a implementar:**
- [ ] Teste unitário: `lerEspecialista("Gestão de Produto")` → encontra skill
- [ ] Teste unitário: `lerEspecialista("gestao-produto")` → encontra skill
- [ ] Teste unitário: Normalização de acentos e espaços
- [ ] Teste de integração: Mensagem de entregável inválido usa skills
- [ ] Teste de integração: Fluxo PRD-first com skills
- [ ] Teste de regressão: `maestro://especialista/` ainda funciona

---

## Impacto nas Mensagens do Sistema

### Antes (Legado)
```
1. Ler especialista:
   read_resource("maestro://especialista/Gestão de Produto")

2. Ler template:
   read_resource("maestro://template/PRD")
```

### Depois (Skills)
```
1. SKILL.md (instruções do especialista):
   `.windsurf/skills/specialist-gestao-produto/resources/reference/SKILL.md`

2. Templates (estrutura do entregável):
   `.windsurf/skills/specialist-gestao-produto/resources/templates/`

3. Checklists (validação):
   `.windsurf/skills/specialist-gestao-produto/resources/checklists/`
```

---

## Benefícios da Migração

1. **Consistência**: Todas as instruções usam o mesmo padrão de skills
2. **Robustez**: Normalização de nomes evita erros de mapping
3. **UX melhorada**: Caminhos explícitos para arquivos locais
4. **Compatibilidade**: Código antigo continua funcionando
5. **Transição suave**: Usuários podem migrar gradualmente

---

## Próximas Ações

1. Implementar testes automatizados (Fase 5)
2. Executar testes e validar fluxo completo
3. Documentar mudanças para usuários
4. Considerar deprecação formal em versão futura

---

**Data de início:** 2026-02-04
**Status geral:** 60% completo (3/5 fases)
