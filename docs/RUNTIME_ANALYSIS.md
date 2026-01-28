# Análise do Runtime Maestro (File System First)

## 1. O Conceito de AI-Driven Runtime

Diferente de sistemas tradicionais onde um binário (runtime) executa código e chama a IA, no Maestro **a IA é o Runtime**.
Os arquivos em `.maestro/content/workflows/` não são scripts para uma máquina executar, são **instruções de operação** para o modelo de linguagem (LLM).

O "Loop de Execução" acontece da seguinte forma:
1.  **Trigger**: Usuário executa um comando de chat (ex: `/avancar-fase`).
2.  **Instruction Loading**: A IDE (via configuração em `.windsurfrules` ou `.cursorrules`) instrui a IA a ler o arquivo de workflow correspondente.
3.  **Processing**: A IA "lê" o markdown, interpreta as instruções imperativas ("Leia o estado...", "Valide...", "Atualize...").
4.  **Execution**: A IA usa suas ferramentas (Tools) para efetivar as ações no File System (`read_file`, `write_to_file`).

## 2. Anatomia dos Workflows Core

A "inteligência" do sistema está codificada em três workflows principais distribuídos pelo CLI:

### 2.1. O Router (`/00-maestro`)
Atua como o ponto de entrada único.
- **Lógica**: Analisa `.maestro/estado.json` para determinar em que ponto do ciclo de vida o projeto está.
- **Decisão**: Se o projeto é novo -> encaminha para `01`. Se existe e tem pendências -> `03`. Se está pronto para avançar -> `02`.
- **Destaque**: Possui lógica de "Self-Healing" (detecta divergências entre o estado salvo e a estrutura teórica do fluxo).

### 2.2. O Inicializador (`/01-iniciar-projeto`)
Responsável pelo "Bootstrapping".
- **Função**: Cria a "banco de dados" inicial (`estado.json` e `resumo.json`).
- **Interatividade**: Instrui a IA a entrevistar o usuário para definir escopo.
- **Definição de Tipagem**: Estabelece o `tier` e `nivel` do projeto, que ditarão as regras futuras.

### 2.3. O Orquestrador (`/02-avancar-fase`)
É o "motor de estado" do sistema.
- **Validação**: Consulta `quality-gates.md` antes de permitir qualquer movimento.
- **Atualização de Estado**: É o único "autorizado" a incrementar o `fase_atual` no JSON.
- **Roteamento Dinâmico**: Usa a tabela em `guides/fases-mapeamento.md` para "descobrir" quem é o próximo especialista.

## 3. O "Banco de Dados" de Conhecimento

O sistema evita hardcoding de lógica nos prompts. Em vez disso, usa arquivos markdown como tabelas de lookup:

- **`guides/fases-mapeamento.md`**: É a tabela de roteamento principal. Mapeia `Fase ID` -> `Especialista` + `Template` + `Prompts`.
- **`rules/quality-gates.md`**: Contém a lógica de validação ("Business Rules").
- **`estado.json`**: É a persistência da instância atual.

## 4. O Mecanismo de Injeção de Contexto

Quando o workflow `02-avancar-fase` diz:
> *"Carregue o Especialista: `read_file('content/specialists/...')`"*

Ele está fazendo uma **Injeção de Persona Dinâmica**. A IA deixa de ser um assistente genérico e "carrega" o system prompt específico daquela fase (ex: Arquiteto de Software ou Product Manager) apenas pelo tempo necessário, descarregando-o ao mudar de fase.

## 5. Conclusão da Análise

O Maestro funciona como um **Sistema Operacional Textual** para IAs.
- **Kernel**: A própria IA (Gemini/GPT/Claude).
- **Processos**: Os Workflows (`.md`).
- **Memória**: O diretório `.maestro/` (`estado.json`, `resumo.json`).
- **Drivers**: Os arquivos de regras e configuração de IDE (`.windsurfrules`, etc).

Essa arquitetura torna o sistema extremamente resiliente (pois tudo é texto legível) e portável (pois o estado viaja com o repositório git).
