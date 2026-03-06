# Análise e Pontos de Melhoria: MCP Maestro

Este documento consolida os pontos de atenção (bugs) e oportunidades de melhoria (limitações e refinamentos) identificados na análise da documentação de testes do MCP Maestro (`maestro-mcp-documentacao.md`).

## 🚨 Pontos de Correção (Bugs Confirmados)

1. **A Ferramenta `analisar` Ignora o Parâmetro `code`**
   - **Problema:** Ao chamar a ferramenta com um código real (ex: `analisar({ tipo: "qualidade", code: "..." })`), o servidor a ignora, retorna falha de comunicação ("Nenhuma chamada de tool detectada") e exibe instruções de como usar.
   - **Impacto:** Inviabiliza análises pontuais de trechos de código via ferramentas MCP.

2. **A Ferramenta `validar` Ignora o Parâmetro `fase`**
   - **Problema:** Na chamada `validar({ tipo: "entregavel", fase: N })`, o Maestro descarta o número repassado e foca na fase onde ele já se encontra.
   - **Impacto:** Impede a validação retroativa ou específica de entregáveis de outras fases.

3. **Falso-Positivo de Entregáveis Ausentes (Extensões de Arquivo)**
   - **Problema:** Durante a Fase Técnica (ex: Frontend), ao chamar `validar()`, o Maestro acusa `Nenhum Entregável Encontrado`, mesmo existindo código fonte no diretório.
   - **Causa Provável:** O mecanismo de auto-leitura aparentemente procura apenas por arquivos com a extensão `.md`.
   - **Impacto:** O *Readiness Gate* bloqueia o avanço por não conseguir detectar adequadamente os pacotes de código submetidos.

4. **Retorno 404 em Resources de Templates**
   - **Problema:** Enquanto as personas são acessíveis nativamente via link MCP (ex: `maestro://skills/specialist-design/SKILL.md`), a busca direta pelos templates (ex: `maestro://skills/specialist-design/templates/template.md`) lança "Resource não encontrado" (404).
   - **Impacto:** Força o uso da ferramenta `contexto()`, que injeta grandes volumes de dados (12kB), prejudicando a performance do contexto caso o agente apenas precise puxar um template modularmente.

5. **Ação "salvar" não Persiste Dados**
   - **Problema:** A chamada `executar({ acao: "salvar" })` devolve mensagens instrucionais informando como salvar, mas não executa a gravação efetiva do arquivo no disco.
   - **Impacto:** Obriga que a IA consuma tokens emitindo chamadas explícitas de persistência (como ferramentas do sistema de arquivos) de modo redundante para registrar ou atualizar o entregável localmente.

---

## 💡 Oportunidades de Melhoria (Limitações / Refinamentos Arquiteturais)

1. **Inconsistência na Classificação Progressiva**
   - **Cenário:** Oscilações erráticas durante a transição de fases. O projeto pode ter sua estimativa original de 10 fases alterada para 11, e posteriormente cair para 5 fases alegando baixa confiança, para depois estabilizar-se de forma brusca nas fases subsequentes (ex: ao chegar na Fase 3).
   - **Melhoria Sugerida:** Refinar o algoritmo de avaliação contínua para evitar flutuações agressivas no nível do projeto, mantendo um limiar de confiança mais sensato para o recalculo das rotas para não confundir o usuário com constantes mudanças de rumo.

2. **"Alucinações" do Parser de Inferência Semântica**
   - **Cenário:** O sistema extrai fatos irreais do contexto (ex: prever um time de "10 devs" pois o número 10 foi referenciado num exemplo de custo; ou extrair "E-commerce" onde o domínio é outro).
   - **Melhoria Sugerida:** Ajustar as heurísticas de parsing ou usar um modelo menor dedicado (SLM) para extração de entidades estruturadas do PRD, em vez de depender de uma leitura baseada em regras limitadas.

3. **Transparência e Feedback dos Gates**
   - **Cenário:** A avaliação muitas vezes resulta apenas em um aviso binário simplista ("Gate forçado" ou "Gate aprovado") sem explicitar o "Score Numérico" (0-100) obtido pelo documento e os aspectos onde a nota foi reduzida.
   - **Melhoria Sugerida:** Renderizar os scores obtidos em cada quesito da checklist para criar um loop de feedback acionável, de modo que a IA ou o Desenvolvedor saibam não apenas que foram aprovados, mas onde a qualidade pode ser melhorada e corrigida.

4. **Aviso Redundante de "Salvar em Disco"**
   - **Cenário:** Durante fluxos orgânicos, o servidor insiste na mensagem "Para melhor performance, salve o arquivo no disco primeiro", mesmo em casos em que o fluxo canônico opera exclusivamente via auto-leitura local.
   - **Melhoria Sugerida:** Omitir esse _warning_ e torná-lo visível apenas quando o arquivo passado por argumento não pôde ser encontrado no disco e consequentemente foi lido apenas via argumento repassado.

5. **Comportamento Punitivo no "Auto-Avanço"**
   - **Cenário:** Se houver três chamadas sucessivas do comando `avançar()` que não evoluam o estado adequadamente, o sistema exibe "Loop detectado" e bloqueia rigidamente.
   - **Melhoria Sugerida:** Exibir com detalhes as exatas falhas subjacentes que barraram o avanço antes de iniciar a punição e sugerir de forma amigável revisões ou *fallback* de edição durante a última *retry*, em vez de simplesmente travar o fluxo.
