# 09 - Knowledge Base e Skills (Especialistas - v6.0)

O Maestro interage com o LLM da IDE (ex: Claude, GPT-4) modulando o seu comportamento através de "Personas" ou "Skills". Em vez de confiar no conhecimento geral do LLM, o Maestro injeta o *know-how* metodológico de um engenheiro sênior para a fase específica em que o projeto está.

A gestão desse conteúdo é feita pelos serviços localizados em `src/src/services/` (SkillLoader e ContentResolver) que leem os dados estáticos do repositório em `content/`.

## Content Resolver (`ContentResolverService`)
Como o código do Maestro MCP roda via pacote do NPM (`npx @maestro-ai/mcp-server`), descobrir o caminho correto dos arquivos de conteúdo (os arquivos de texto e JSON que formam as regras) não é trivial.

-   **Objetivo**: Encontrar o caminho absoluto onde a pasta `content/` está localizada, seja rodando localmente (desenvolvimento) ou instalado globalmente num cache do NPX.
-   **Como Funciona**: Ele percorre a árvore de diretórios (através do `dirname` e chamadas de `fs.existsSync`) até encontrar pastas como `specialists`, `prompts`, `templates` e `skills`. Uma vez resolvidas, ele armazena e expõe caminhos absolutos seguros para que o sistema leia esses prompts.

## Skill Loader (`SkillLoaderService`)
Este é o serviço responsável por compilar o pacote de conhecimento (A "Skill") a ser injetado no contexto.

-   **Objetivo**: Combinar a Identidade do Especialista, as Regras Operacionais e o Template do Entregável baseado na fase atual e no modo de operação (`economy`, `balanced`, `quality`).
-   **Estrutura da Skill**: Quando o `withSkillInjection` ou a ferramenta `contexto` precisa do especialista da Fase 2 (UX), o `SkillLoader` junta as seguintes peças (lidas da pasta `content/`):
    1.  **Specialist Data**: O JSON do especialista. Ele contém o `name` ("Especialista de UX"), as restrições e o tom de voz que a IA deve adotar.
    2.  **Skill Content**: As diretrizes práticas. Varia dependendo do modo (`economy` pode ser só "Gere telas", `quality` instrui a fazer pesquisa de acessibilidade).
    3.  **Template Content**: Um esqueleto do arquivo Markdown ou arquivo de código a ser gerado, garantindo que a IA saiba os subtítulos exatos que o `DeliverableValidator` vai cobrar no final da fase.
    4.  **Checklist Content**: A lista de verificação de fim-de-fase.

## Como as Skills Chegam ao LLM

Como mencionado no documento 05 (Orquestração), a Skill é uma string concatenada que é injetada sorrateiramente na propriedade `specialist_persona` do retorno da requisição JSON-RPC.

As IDEs modernas com integração MCP muitas vezes exibem isso como um comentário no terminal de output ou injetam esse bloco de texto invisivelmente no "System Prompt" do Claude/GPT logo antes de ele processar a resposta do usuário, efetivamente forçando-o a fazer um *roleplay* restrito ao framework do Maestro.