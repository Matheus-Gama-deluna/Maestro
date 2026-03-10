# 04 - Estado e Memória do Maestro (v6.0)

O **Maestro MCP** adota uma abordagem resiliente e persistente para a gestão de estado. Por ser uma arquitetura projetada para assistir LLMs assincronamente através de múltiplas etapas (fases), ele não pode depender de memória volátil (RAM) para manter o contexto do ciclo de vida de um projeto. Toda a memória de curto e longo prazo reside fisicamente na máquina do usuário.

A gestão do estado e da base de conhecimento ocorre predominantemente nas pastas `.maestro/` e é operada pelos módulos em `src/src/state/` e `src/src/core/knowledge/`.

## 1. O Estado do Projeto (`estado.json`)

O arquivo central para o funcionamento do Maestro em um diretório de trabalho é o `.maestro/estado.json`. Ele representa a "memória de curto prazo" e o controle de versão metodológico do Maestro.

### Módulos de Manipulação
-   **`src/src/state/storage.ts` e `src/src/state/context.ts`**: Encapsulam as funções de leitura, parsing, e escrita (gravação segura no disco) do estado. Eles validam a estrutura e fornecem métodos seguros para transitar propriedades (como `fase_atual`, `nivel`, etc.).
-   **Middleware de Persistência (`src/src/middleware/persistence.middleware.ts`)**: Automatiza a rotina de salvamento. Toda vez que uma ferramenta (como `executar` ou `maestro`) processa com sucesso uma transição ou criação de conteúdo, este middleware garante que o novo JSON seja comitado em disco.

### O Que Ele Armazena
A interface `EstadoProjeto` (tipicamente definida em `src/src/types/`) contém os metadados do fluxo:
-   **Identificação:** Nome, descrição, UUID e diretório raiz.
-   **Ciclo de Vida:** Em qual fase o projeto está (`fase_atual`), qual o total de fases, e quais *gates* (checklists metodológicos de fim de fase) já foram validados (`gates_validados`).
-   **Configurações do Usuário:** Nível de rigor (`simples`, `medio`, `complexo`), IDE alvo (Windsurf, Cursor), modo (Economy, Balanced, Quality), e se o desenvolvedor deseja utilizar o Stitch para prototipagem de frontend.
-   **Artefatos:** Um mapeamento de chaves-valor listando os caminhos absolutos ou relativos para cada entregável concluído (ex: `"fase_1": "docs/prd.md"`).

## 2. A Base de Conhecimento ("Memória de Longo Prazo")

Na v6.0, o histórico estruturado do projeto ganhou robustez através do módulo `KnowledgeBase` localizado em `src/src/core/knowledge/`. Todo o conhecimento analítico fica retido na subpasta `.maestro/knowledge/`.

### O Módulo `KnowledgeBase.ts`
Esta classe funciona como um banco de dados de arquivos baseado em `.json`. Seu propósito é garantir que o conhecimento metodológico, arquitetural e as métricas não se percam em um longo log de conversa ou através da deleção acidental de arquivos de projeto.

#### Tipos de Entradas (KnowledgeEntries)
As informações são classificadas e gravadas em quatro categorias principais (`types.ts`):

1.  **`adr` (Architecture Decision Records)**
    -   Salvo em `.maestro/knowledge/adrs/`
    -   *Estrutura*: Decisão, Contexto, Alternativas (com prós/contras), Consequências e Riscos previstos.
    -   *Geração Automática*: O middleware `adr-generation.middleware.ts` tenta inferir passivamente se o arquivo ou entregável atual possui características de decisão estrutural e força o LLM/sistema a registrar o ADR antes de mudar de fase.
2.  **`pattern` (Padrões Identificados)**
    -   Salvo em `.maestro/knowledge/patterns/`
    -   *Estrutura*: Nome do padrão, problema, solução, exemplos no codebase.
3.  **`decision` (Decisões Técnicas Menores)**
    -   *Estrutura*: Ação tomada, o porquê, e resultado (outcome). Mais granular que um ADR.
4.  **`metric` (Métricas do Projeto)**
    -   *Estrutura*: Nome, valor, limite (threshold), e tendência (melhorando, estável, degradando). Coletadas frequentemente nas fases de *Quality* e *Performance*.

### Recuperação de Contexto
A recuperação deste conhecimento é ativamente gerenciada através de algoritmos de ranqueamento interno do `KnowledgeBase` (combinando *Tempo de criação* + *Relevância assinalada*).

Quando a IA usa a ferramenta `contexto` (`tools/contexto.ts`), o Maestro lê as Decisões Arquiteturais e Técnicas mais relevantes (limitadas para não estourar o limite de tokens) e embute isso na resposta, dizendo à IA: *"Lembre-se que na Fase 2 decidimos usar PostgreSQL ao invés de MongoDB pelo motivo X"*.

## Resumo
A separação entre `estado.json` e `KnowledgeBase` permite ao Maestro distinguir o "fluxo de controle e progresso de projeto" (que muda a toda hora) da "memória estrutural" (imutável e apendável). Tudo persiste no ambiente local da máquina (`.maestro/`), tornando o contexto do Maestro perfeitamente transportável se o desenvolvedor *commitar* essa pasta em seu repositório Git.