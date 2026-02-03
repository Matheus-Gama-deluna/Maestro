# Mudanças: Sistema de Caminhos Multi-IDE

## Resumo

Implementado sistema para suportar múltiplas IDEs (Windsurf, Cursor, Antigravity) com referências dinâmicas aos diretórios de skills e workflows, eliminando referências hardcoded para `.agent`.

## Problema Identificado

O sistema tinha referências hardcoded para `.agent/skills/` em vários arquivos, mas foi projetado para funcionar com três IDEs diferentes:
- **Windsurf**: `.windsurf/skills/`
- **Cursor**: `.cursor/skills/`
- **Antigravity**: `.agent/skills/`

Isso causava problemas quando a IA tentava ativar skills, pois as referências não correspondiam ao diretório correto da IDE em uso.

## Solução Implementada

### 1. Novo Utilitário: `ide-paths.ts`

Criado arquivo `src/src/utils/ide-paths.ts` com:

- **Configurações centralizadas** para cada IDE
- **Funções utilitárias** para obter caminhos corretos:
  - `getSkillsDir(ide)` - Diretório de skills
  - `getWorkflowsDir(ide)` - Diretório de workflows
  - `getSkillPath(skillName, projectDir, ide)` - Caminho completo da skill
  - `getSkillFilePath(skillName, ide)` - Caminho do SKILL.md
  - `getSkillResourcePath(skillName, resourceType, ide)` - Caminhos de resources
  - `formatSkillMessage(skillName, ide)` - Mensagem formatada com caminhos corretos
- **Detecção automática de IDE**: `detectIDE(projectDir)` - Detecta IDE pelos arquivos presentes

### 2. Campo `ide` no Estado do Projeto

Adicionado campo opcional `ide` na interface `EstadoProjeto`:
```typescript
ide?: 'windsurf' | 'cursor' | 'antigravity';
```

Este campo é:
- Salvo durante `iniciar_projeto` / `confirmar_projeto`
- Usado para determinar caminhos corretos em todas as tools
- Fallback para detecção automática se não estiver presente

### 3. Arquivos Atualizados

#### `src/src/types/index.ts`
- Adicionado campo `ide` na interface `EstadoProjeto`

#### `src/src/state/storage.ts`
- Atualizado `criarEstadoInicial()` para aceitar parâmetro `ide`
- IDE é salvo no estado do projeto

#### `src/src/tools/iniciar-projeto.ts`
- Importa `formatSkillMessage` de `ide-paths.ts`
- Usa `formatSkillMessage()` ao invés de referências hardcoded
- Passa IDE para `criarEstadoInicial()`

#### `src/src/tools/status.ts`
- Importa `formatSkillMessage` e `detectIDE` de `ide-paths.ts`
- Detecta IDE do estado ou do diretório
- Usa `formatSkillMessage()` para exibir informações da skill

#### `src/src/tools/proximo.ts`
- Importa `formatSkillMessage`, `detectIDE` e `getSkillResourcePath` de `ide-paths.ts`
- Detecta IDE do estado ou do diretório
- Usa caminhos dinâmicos para templates e resources

#### `src/src/tools/contexto.ts`
- Importa `formatSkillMessage` e `detectIDE` de `ide-paths.ts`
- Usa caminhos corretos baseados na IDE

#### `src/src/tools/validar-gate.ts`
- Importa `getSkillResourcePath` e `detectIDE` de `ide-paths.ts`
- Usa caminhos corretos para checklists

#### `src/src/utils/prompt-mapper.ts`
- Adicionado comentário de deprecação em `getSkillPath()`
- Atualizada documentação para referenciar `ide-paths.ts`

## Fluxo de Funcionamento

### 1. Inicialização do Projeto

```typescript
// Usuário executa iniciar_projeto com IDE especificada
iniciar_projeto(
  nome: "Meu Projeto",
  diretorio: "/path/to/project",
  ide: "windsurf"  // ou "cursor" ou "antigravity"
)

// Sistema:
// 1. Injeta conteúdo para a IDE especificada
// 2. Salva IDE no estado.json
// 3. Retorna mensagens com caminhos corretos
```

### 2. Durante Execução

```typescript
// Em qualquer tool (status, proximo, contexto, etc.)
const ide = estado.ide || detectIDE(diretorio) || 'windsurf';

// Usa IDE para obter caminhos corretos
const skillMessage = formatSkillMessage(skillName, ide);
// Resultado: Caminhos corretos para .windsurf/skills/ ou .cursor/skills/ ou .agent/skills/
```

### 3. Detecção Automática

Se o campo `ide` não estiver no estado, o sistema detecta automaticamente:

```typescript
function detectIDE(projectDir: string): IDEType | null {
  // Verifica presença de arquivos/diretórios característicos
  if (existsSync('.windsurfrules') || existsSync('.windsurf')) return 'windsurf';
  if (existsSync('.cursorrules') || existsSync('.cursor')) return 'cursor';
  if (existsSync('.gemini') || existsSync('.agent')) return 'antigravity';
  return null;
}
```

## Benefícios

1. **Compatibilidade Multi-IDE**: Sistema funciona corretamente em qualquer IDE suportada
2. **Manutenibilidade**: Configurações centralizadas em um único arquivo
3. **Flexibilidade**: Fácil adicionar suporte para novas IDEs
4. **Detecção Automática**: Sistema detecta IDE automaticamente quando possível
5. **Mensagens Corretas**: IA sempre referencia caminhos corretos para o usuário

## Prompt ao Usuário

Se a IDE não for especificada durante `iniciar_projeto`, o sistema agora retorna:

```
⚠️ **Ação Necessária**: Por favor, informe qual IDE você está utilizando 
para configurar o ambiente corretamente.

Execute novamente o comando informando o parâmetro `ide`:
- `windsurf`
- `cursor`
- `antigravity`
```

## Ativação Automática de Skills

Com estas mudanças, as skills são ativadas corretamente porque:

1. **Caminhos Corretos**: Sistema sempre usa o diretório correto da IDE
2. **Mensagens Precisas**: IA recebe instruções com caminhos exatos
3. **Detecção Inteligente**: Sistema detecta IDE automaticamente quando possível
4. **Estado Persistente**: IDE é salva no estado.json para uso futuro

## Exemplo de Uso

### Windsurf
```
Skill: specialist-gestao-produto
Localização: .windsurf/skills/specialist-gestao-produto/SKILL.md
Resources: .windsurf/skills/specialist-gestao-produto/resources/templates/
```

### Cursor
```
Skill: specialist-gestao-produto
Localização: .cursor/skills/specialist-gestao-produto/SKILL.md
Resources: .cursor/skills/specialist-gestao-produto/resources/templates/
```

### Antigravity
```
Skill: specialist-gestao-produto
Localização: .agent/skills/specialist-gestao-produto/SKILL.md
Resources: .agent/skills/specialist-gestao-produto/resources/templates/
```

## Próximos Passos

1. **Testar**: Compilar e testar o sistema com cada IDE
2. **Documentar**: Atualizar documentação do usuário
3. **Migrar**: Atualizar projetos existentes para incluir campo `ide`
4. **Validar**: Confirmar que skills são ativadas corretamente em todas as IDEs

## Notas Técnicas

- Erros de lint sobre `uuid` e `validarEstrutura` são pré-existentes e não relacionados a estas mudanças
- Sistema mantém compatibilidade com projetos antigos via detecção automática
- Função `getSkillPath()` em `prompt-mapper.ts` marcada como deprecated mas mantida para compatibilidade
