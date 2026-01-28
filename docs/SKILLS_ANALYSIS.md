# Análise do Sistema de Skills do Maestro

## 1. O Conceito de Skill
No Maestro, uma "Skill" é um pacote modular de conhecimento especializado projetado para ser consumido por uma IA.
Ao contrário de um prompt simples, uma Skill é estruturada como um mini-repositório de documentação técnica que ensina a IA como desempenhar uma função específica (ex: "Frontend Design", "API Patterns").

## 2. Estrutura de Diretórios
As skills residem em `packages/cli/content/skills/` e seguem este padrão:

```
skills/
├── frontend-design/           # Uma Skill completa
│   ├── SKILL.md               # Manifesto (Metadata + Instruções)
│   ├── ux-psychology.md       # Knowledge Base auxiliar
│   ├── color-system.md        # Knowledge Base auxiliar
│   └── scripts/               # (Opcional) Scripts utilitários
│       └── audit.py
└── database-design/
    └── ...
```

## 3. O Manifesto `SKILL.md`
É o ponto de entrada da Skill. Ele contém:
- **Metadata (YAML Frontmatter)**: Nome, descrição, ferramentas permitidas.
- **Filosofia**: Princípios core que a IA deve adotar.
- **Regras de Leitura**: Tabela instruindo a IA sobre quais arquivos auxiliares ler e quando (ex: "🔴 ux-psychology.md = ALWAYS READ").
- **Constraint Analysis**: Perguntas obrigatórias que a IA deve fazer ao usuário antes de começar.
- **Anti-Patterns**: O que *não* fazer (e.g., "Avoid Bento Grids for simple sites").

## 4. O `SkillAdapter`: Polimorfismo de IDE
O componente `packages/cli/src/adapters/skill-adapter.ts` é a peça chave que permite que a mesma base de conhecimento funcione em diferentes "motores" de IA (IDEs).

Ele transforma a skill "Master" para formatos específicos:

### 4.1. Para Windsurf (`.windsurf/skills/`)
- **Estratégia**: Cópia direta (1:1).
- **Motivo**: O Windsurf lê nativamente o formato markdown e entende referências entre arquivos.

### 4.2. Para Cursor (`.cursor/skills/`)
- **Estratégia**: Simplificação e flattening.
- **Transformação**:
    - Reescreve `SKILL.md` gerando seções "Quick Access" e "When to Use" otimizadas para o indexador RAG do Cursor.
    - Remove frontmatter complexo que pode confundir o modelo do Cursor.

### 4.3. Para Antigravity (`.agent/skills/`)
- **Estratégia**: Formato `.agent` estruturado.
- **Transformação**:
    - Renomeia `SKILL.md` para `skill.md` (lowercase).
    - Gera novo frontmatter YAML específico para Antigravity:
        ```yaml
        trigger: on_demand
        category: frontend  # Inferido pelo adapter
        version: 1.0.0
        ```
    - Move arquivos auxiliares para subdiretório `content/` para manter a raiz limpa.
    - Gera seção "Available Resources" apontando para `content/`.

## 5. Como o Antigravity Consome
Quando o comando `maestro init --ide antigravity` roda:
1.  O adapter cria `.agent/skills/frontend-design/skill.md`.
2.  A IA do Antigravity, ao receber um prompt ou gatilho, lê este `skill.md`.
3.  O arquivo instrui a IA a ler os recursos em `content/` conforme necessário ("Progressive Disclosure").

## 6. Conclusão
O sistema de Skills é uma "Camada de Abstração de Conhecimento".
Ele desacopla *o que* a IA precisa saber (conteúdo markdown) de *como* a IDE específica ingere esse conhecimento (adapter). Isso permite:
1.  Manutenção centralizada (alterar `ux-psychology.md` uma vez afeta todas as IDEs).
2.  Especialização profunda (skills podem ser muito grandes pois são quebradas em arquivos menores).
3.  Portabilidade entre diferentes assistentes de IA.
