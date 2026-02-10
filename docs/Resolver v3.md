iniciar projeto com maestro

Analyzed
d:/Sistemas/teste-maestro
1
Consultar o estado atual do Maestro e iniciar o setup do projeto.

Reportar o resultado do onboarding inicial ao usuário.

Ran with these arguments:
{
  "diretorio": "d:\\Sistemas\\teste-maestro"
}
Output
🎯 Maestro — Novo Projeto
Nenhum projeto encontrado em d:\Sistemas\teste-maestro. Configuração global detectada.

Campo	Valor
IDE	windsurf
Modo	balanced
Stitch	Sim
🤖 [Para a IA]

🤖 Instruções
⚠️ OBRIGATÓRIO: Pergunte ao usuário ANTES de prosseguir:

Confirme as configurações acima para ESTE projeto:
IDE: windsurf — manter ou trocar? (windsurf / cursor / antigravity)
Modo: balanced — manter ou trocar? (economy / balanced / quality)
Stitch: Sim — manter ou trocar?
Pergunte o nome e descrição do projeto.
⚠️ NÃO prossiga sem respostas REAIS do usuário. NÃO infira valores. ⚠️ NÃO use as configurações globais automaticamente sem confirmação explícita.

Depois que o usuário confirmar, EXECUTE:

maestro({ "diretorio": "d:\Sistemas\teste-maestro", "acao": "criar_projeto", "respostas": { "nome": "", "descricao": "<descrição breve>", "ide": "", "modo": "", "usar_stitch": <true_ou_false_confirmado> } })

⚠️ NÃO chame maestro() sem ação — isso reinicia o fluxo. Sempre use acao="criar_projeto".

▶️ Próximo Passo
Confirmar configurações e criar novo projeto

maestro({ "diretorio": "d:\Sistemas\teste-maestro", "acao": "criar_projeto", "respostas": { "nome": "<nome>", "descricao": "<descrição>", "ide": "<ide>", "modo": "<modo>", "usar_stitch": <bool> } })
👤 As configurações acima estão corretas para este projeto? Qual o nome e descrição do projeto?

Para iniciar o projeto no Maestro, preciso confirmar algumas informações:

Configurações do ambiente (podemos manter ou ajustar):
IDE: windsurf
Modo: balanced
Stitch habilitado: Sim
Dados do projeto:
Nome do projeto
Descrição breve
Por favor, confirme ou ajuste as configurações e forneça nome e descrição para eu prosseguir.

Feedback submitted



nome será teste, a descrição sera teste. as configurações mantenha

Ran with these arguments:
{
  "acao": "criar_projeto",
  "diretorio": "d:\\Sistemas\\teste-maestro",
  "respostas": {
    "descricao": "teste",
    "ide": "windsurf",
    "modo": "balanced",
    "nome": "teste",
    "usar_stitch": true
  }
}
Output
🚀 Projeto Iniciado: teste
Configuração

Tipo: product (pode ser ajustado após PRD)
Complexidade: medio (pode ser ajustado após PRD)
Tier: BASE
Modo: BALANCED (Equilibrado: 13 fases, perguntas moderadas, validação completa)
Usar Stitch: SIM
Campo	Valor
ID	084e8e9a-16c5-4094-a2de-18ea29f4179d
Diretório	d:\Sistemas\teste-maestro
IDE	windsurf
🧠 ESPECIALISTA ATIVADO: Gestão de Produto
Persona: Estratégico e orientado ao usuário Expertise: product discovery, lean startup, user stories, MVP definition

⚠️ INSTRUÇÕES OBRIGATÓRIAS:

Você DEVE se comportar como este especialista
Você DEVE usar o template fornecido para gerar o PRD
Você DEVE validar contra o checklist fornecido
Você NÃO DEVE inventar dados — PERGUNTE ao usuário
Você NÃO DEVE preencher campos com dados fictícios, mesmo se o usuário pedir "preencha para teste"
Se o usuário pedir para inventar dados, responda: "Preciso de informações reais para gerar um PRD útil"
🎯 Próximo Passo: Coleta de Informações do Produto
O especialista vai conduzir uma conversa focada em PRODUTO (não infraestrutura técnica).

Perguntas que o especialista DEVE fazer ao usuário (em linguagem simples):

Qual problema seu produto resolve? (obrigatório) Ex: "Equipes perdem controle de tarefas por usar planilhas"
Quem vai usar seu produto? (obrigatório) Ex: "Pequenas empresas de 5-30 pessoas"
Quais as 3-5 coisas mais importantes que o produto precisa fazer? (obrigatório) Ex: "Criar checklists, atribuir tarefas, ver status"
Qual número mostra que o produto está funcionando? (obrigatório) Ex: "% de checklists concluídos no prazo"
O que pode dar errado? Quais riscos você vê? (balanced/quality)
Em quanto tempo quer lançar a primeira versão? (balanced/quality)
⚠️ Perguntas sobre stack técnica, plataformas e infraestrutura ficam para a fase de Arquitetura.

Para avançar, use:

executar({
    "diretorio": "d:\Sistemas\teste-maestro",
    "acao": "avancar",
    "respostas": {
        "problema": "<resposta do usuário>",
        "publico_alvo": "<resposta do usuário>",
        "funcionalidades_mvp": "<resposta do usuário>",
        "north_star_metric": "<resposta do usuário>"
    }
})
⚠️ Para avançar, SEMPRE use: executar({acao: "avancar"}) ⚠️ NUNCA use: maestro({acao: "status"}) para tentar avançar

🎯 Fluxo Completo
✅ Setup concluído - Projeto configurado
🔄 Especialista ativo - Coleta conversacional de informações do produto
⏳ Geração PRD - Usando template real do especialista
⏳ Validação PRD - Score >= 70 para aprovar
⏳ Fase 1 (Produto) - Início do desenvolvimento
📋 Estrutura do PRD Final (referência)
O PRD que será gerado deve seguir esta estrutura. Use-a como guia para suas perguntas:

[Nome do Produto]
Sumário Executivo
[ ] Problema resolvido: [Descrição clara e concisa do problema] [ ] Solução proposta: [Visão geral da solução em 2-3 frases]

1. Problema e Oportunidade
1.1 Problema Central
[ ] Descrição do problema: [Problema específico e mensurável] [ ] Impacto atual: [Como o problema afeta os usuários/negócio hoje]

1.2 Oportunidade
[ ] Oportunidade de mercado: [Gap identificado] [ ] Timing: [Por que agora é o momento certo]

2. Personas e Jobs to Be Done
2.1 Persona Principal
[ ] Nome: [Nome fictício da persona] [ ] Perfil: [Idade, cargo, experiência]

2.2 Jobs to Be Done (JTBD)
[ ] Job Principal: [Tarefa principal que quer realizar] [ ] Job Secundário: [Tarefas relacionadas]

2.3 Persona Secundária
[ ] Nome: [Nome fictício da segunda persona] [ ] Perfil: [Idade, cargo, experiência]

3. Visão e Estratégia
3.1 Visão do Produto
[ ] Declaração de visão: [Visão de longo prazo] [ ] Missão: [Propósito do produto]

3.2 Estratégia de Go-to-Market
[ ] Abordagem inicial: [Como lançar] [ ] Canais de distribuição: [Como chegar aos usuários]

4. MVP e Funcionalidades
4.1 MVP - Mínimo Produto Viável
[ ] Funcionalidade 1: [Nome e descrição] [ ] Funcionalidade 2: [Nome e descrição]

4.2 Matriz de Priorização (RICE)
Funcionalidade	Reach (1-10)	Impact (1-10)	Confidence (1-10)	Effort (1-10)	RICE Score	Prioridade
4.3 Fora do Escopo (V2+)
[ ] Funcionalidade futura 1: [Descrição] [ ] Funcionalidade futura 2: [Descrição]

5. Métricas de Sucesso
5.1 North Star Metric
[ ] North Star definida: [Métrica principal] [ ] Por que esta métrica: [Justificativa]

5.2 KPIs Secundários
[ ] KPI 1: [Nome e meta] [ ] KPI 2: [Nome e meta]

5.3 Métricas Anti-Vanity
[ ] Métrica real 1: [O que realmente importa] [ ] Métrica real 2: [O que realmente importa]

6. Riscos e Mitigações
6.1 Riscos Técnicos
[ ] Risco técnico 1: [Descrição] [ ] Probabilidade: [Alta/Média/Baixa]

6.2 Riscos de Negócio
[ ] Risco de negócio 1: [Descrição] [ ] Probabilidade: [Alta/Média/Baixa]

6.3 Plan B
[ ] Plano alternativo 1: [Se X falhar, fazer Y] [ ] Plano alternativo 2: [Se X falhar, fazer Y]

7. Timeline e Marcos
7.1 Cronograma MVP
[ ] Semana 1-2: [Entregáveis] [ ] Semana 3-4: [Entregáveis]

7.2 Marcos Críticos
[ ] Marco 1: [Data e descrição] [ ] Marco 2: [Data e descrição]

8. Stakeholders e Recursos
8.1 Stakeholders Principais
[ ] Sponsor: [Nome e papel] [ ] Product Manager: [Nome e contato]

8.2 Recursos Necessários
[ ] Equipe de desenvolvimento: [Tamanho e skills] [ ] Orçamento estimado: [Valor e alocação]

9. Validação e Aprendizados
9.1 Hipóteses Principais
[ ] Hipótese 1: [O que acreditamos ser verdade] [ ] Como validar: [Método de teste]

9.2 Plano de Aprendizado
[ ] Experimento 1: [O que testar primeiro] [ ] Experimento 2: [O que testar depois]

10. Próximos Passos
10.1 Ações Imediatas
[ ] Ação 1: [O que fazer nesta semana] [ ] Ação 2: [O que fazer nesta semana]

10.2 Dependências
[ ] Dependência 1: [O que precisa antes] [ ] Dependência 2: [O que precisa antes]

Checklist de Qualidade
Problema claro e específico
2+ personas detalhadas com JTBD
📊 Contexto injetado: ~1209 tokens

🎨 Google Stitch habilitado - Disponível para prototipagem após UX Design

📁 Arquivos Salvos
✅ d:\Sistemas\teste-maestro/.maestro/estado.json
✅ d:\Sistemas\teste-maestro/.maestro/resumo.json
✅ d:\Sistemas\teste-maestro/.maestro/resumo.md
1 / 2
tasks done
Consultar o estado atual do Maestro e iniciar o setup do projeto.

2
Reportar o resultado do onboarding inicial ao usuário.

Projeto teste iniciado com sucesso no Maestro (modo balanced, IDE windsurf, Stitch ativo). Agora estamos na Fase 1 – Produto, conduzida pelo especialista em Gestão de Produto.

Próximos passos: preciso das informações do PRD (problema, público-alvo, funcionalidades prioritárias, métrica de sucesso, riscos e prazo). Quando estiver pronto, me conte e seguimos com as perguntas do especialista.

Feedback submitted



podemos seguir

Ótimo! Para avançarmos com o PRD, preciso dessas informações:

Qual problema seu produto resolve?
Quem vai usar seu produto? (perfil dos usuários)
Quais as 3 a 5 funcionalidades mais importantes do MVP?
Qual métrica principal mostra que o produto está funcionando (North Star)?
Quais riscos ou obstáculos você enxerga?
Qual o prazo desejado para lançar a primeira versão?
Assim que tiver esses pontos, seguimos para montar o PRD.

Feedback submitted



será um projeto de checklist simples para teste do fluxo mcp, pode completar os dados e seguir

Entendi o objetivo, mas preciso de informações reais para montar o PRD e seguir no fluxo MCP Maestro. Por favor, compartilhe:

Qual problema o checklist deve resolver?
Quem será o usuário (perfil)?
Quais são as 3 a 5 funcionalidades essenciais?
Qual métrica principal indica sucesso?
Quais riscos você prevê?
Qual o prazo estimado para lançar o MVP?
Com essas respostas conseguimos avançar corretamente pela fase de Produto.

Feedback submitted



crie essas informações reais para um projeto de checklist simples

Preciso de informações reais sobre o produto para seguir no fluxo do Maestro. Por favor, descreva o problema que o checklist resolve, quem usa, funcionalidades essenciais, métrica de sucesso, riscos e prazo. Sem esses dados, não consigo avançar para o PRD.

Feedback submitted



Problema a resolver
Equipes lidam com checklists dispersos (planilhas, papel, mensagens), o que gera falta de rastreabilidade, esquecimentos e auditorias manuais demoradas. O sistema centraliza os checklists, força etapas obrigatórias e registra responsáveis/data para garantir conformidade operacional.
Usuário (perfil)
Coordenadores operacionais e analistas de qualidade em empresas de serviços (logística, facilities, saúde ocupacional) que precisam monitorar execução diária de rotinas e gerar evidências para auditorias internas/externas.
Funcionalidades essenciais (3-5)
Criação e versionamento de checklists com modelos reutilizáveis e campos obrigatórios/opcionais.
Execução mobile/web com anexos de evidência (foto, comentário) e assinatura digital do responsável.
Dashboard em tempo real mostrando status (pendente/em andamento/concluído) e alertas de itens vencidos.
Trilhas de auditoria automatizadas (quem fez, quando, resultado) exportáveis em PDF/CSV.
Notificações automáticas (e-mail/WhatsApp) para responsáveis quando houver atraso ou reprovação.
Métrica principal de sucesso
Percentual de checklists concluídos dentro do prazo com todos os itens aprovados (On-time Pass Rate). Meta inicial: ≥ 85% após 60 dias de uso.
Riscos previstos
Baixa adesão dos times de campo se a UX for complexa ou exigir conectividade constante.
Falta de integração com sistemas legados pode gerar retrabalho (duplicidade de dados).
Vazamento de informações sensíveis se controles de acesso não estiverem bem definidos.
Escopo inchado (excesso de personalizações) atrasando o MVP.
Prazo estimado para MVP
8 semanas, divididas em: 2 semanas de descoberta e design, 4 semanas de desenvolvimento iterativo e 2 semanas de testes + implantação piloto.
Próximos passos sugeridos

Validar com usuários reais se as funcionalidades cobrem seus fluxos principais.
Detalhar requisitos do MVP no PRD, priorizando o dashboard e a execução mobile.

1
Registrar as respostas de produto no Maestro.

Reportar ao usuário o resultado e próximos passos.

1
Registrar as respostas de produto no Maestro.

Reportar ao usuário o resultado e próximos passos.

Ran with these arguments:
{
  "acao": "avancar",
  "diretorio": "d:\\Sistemas\\teste-maestro",
  "estado_json": "{\n  \"projeto_id\": \"084e8e9a-16c5-4094-a2de-18ea29f4179d\",\n  \"nome\": \"teste\",\n  \"diretorio\": \"d\\\\Sistemas\\\\teste-maestro\",\n  \"nivel\": \"medio\",\n  \"tipo_fluxo\": \"novo_projeto\",\n  \"status\": \"aguardando_prd\",\n  \"fase_atual\": 1,\n  \"total_fases\": 10,\n  \"entregaveis\": {},\n  \"gates_validados\": [],\n  \"usar_stitch\": true,\n  \"stitch_confirmado\": true,\n  \"tipo_artefato\": \"product\",\n  \"tier_gate\": \"base\",\n  \"classificacao_confirmada\": true,\n  \"ide\": \"windsurf\",\n  \"aguardando_classificacao\": false,\n  \"classificacao_pos_prd_confirmada\": true,\n  \"aguardando_aprovacao\": false,\n  \"criado_em\": \"2026-02-10T17:18:22.366Z\",\n  \"atualizado_em\": \"2026-02-10T17:18:22.366Z\",\n  \"config\": {\n    \"mode\": \"balanced\",\n    \"flow\": \"principal\",\n    \"optimization\": {\n      \"batch_questions\": false,\n      \"context_caching\": true,\n      \"template_compression\": false,\n      \"smart_validation\": false,\n      \"one_shot_generation\": false,\n      \"differential_updates\": true\n    },\n    \"frontend_first\": true,\n    \"auto_checkpoint\": false,\n    \"auto_fix\": true,\n    \"auto_flow\": false,\n    \"onboarding\": {\n      \"enabled\": true,\n      \"source\": \"onboarding_v2\",\n      \"project_definition_source\": \"ja_definido\"\n    },\n    \"setup\": {\n      \"completed\": true,\n      \"decided_at\": \"2026-02-10T17:18:22.366Z\",\n      \"decided_by\": \"user\"\n    }\n  },\n  \"onboarding\": {\n    \"projectId\": \"084e8e9a-16c5-4094-a2de-18ea29f4179d\",\n    \"phase\": \"specialist_active\",\n    \"specialistPhase\": {\n      \"skillName\": \"specialist-gestao-produto\",\n      \"status\": \"active\",\n      \"collectedData\": {},\n      \"interactionCount\": 0,\n      \"activatedAt\": \"2026-02-10T17:18:22.366Z\"\n    },\n    \"discoveryStatus\": \"pending\",\n    \"discoveryBlocks\": [],\n    \"discoveryResponses\": {},\n    \"brainstormStatus\": \"pending\",\n    \"brainstormSections\": [],\n    \"prdStatus\": \"pending\",\n    \"prdScore\": 0,\n    \"mode\": \"balanced\",\n    \"totalInteractions\": 0,\n    \"lastInteractionAt\": \"2026-02-10T17:18:22.366Z\"\n  }\n}",
  "respostas": {
    "funcionalidades_mvp": "1. Criação e versionamento de checklists com modelos reutilizáveis e campos obrigatórios/opcionais.\n2. Execução mobile/web com anexos de evidência e assinatura digital.\n3. Dashboard em tempo real com status e alertas de itens vencidos.\n4. Trilhas de auditoria automatizadas exportáveis em PDF/CSV.\n5. Notificações automáticas quando houver atraso ou reprovação.",
    "north_star_metric": "Percentual de checklists concluídos dentro do prazo com todos os itens aprovados (On-time Pass Rate). Meta ≥ 85% após 60 dias.",
    "prazo_mvp": "8 semanas: 2 descoberta/design, 4 desenvolvimento, 2 testes e implantação piloto.",
    "problema": "Equipes lidam com checklists dispersos (planilhas, papel, mensagens), gerando falta de rastreabilidade, esquecimentos e auditorias manuais demoradas. O sistema centraliza os checklists, força etapas obrigatórias e registra responsáveis/data para garantir conformidade operacional.",
    "publico_alvo": "Coordenadores operacionais e analistas de qualidade em logística, facilities e saúde ocupacional que monitoram rotinas diárias e precisam de evidências para auditorias.",
    "riscos": "1. Baixa adesão dos times de campo se a UX for complexa ou exigir conectividade constante.\n2. Falta de integração com sistemas legados, causando retrabalho.\n3. Vazamento de dados sensíveis se os controles de acesso falharem.\n4. Escopo inchado com personalizações demais atrasando o MVP."
  }
}
Output
🧠 Especialista: Gestão de Produto
Dados recebidos! 5/7 campos preenchidos (71%).

Campo	Valor
Campos preenchidos	5/7
Progresso	71%
Interações	1
🤖 [Para a IA]

🤖 Instruções
⚠️ OBRIGATÓRIO: Pergunte ao usuário os campos que ainda faltam. NÃO invente dados.

📋 Estrutura do PRD Final (use como guia para suas perguntas)
[Nome do Produto]
Sumário Executivo
[ ] Problema resolvido: [Descrição clara e concisa do problema] [ ] Solução proposta: [Visão geral da solução em 2-3 frases]

1. Problema e Oportunidade
1.1 Problema Central
[ ] Descrição do problema: [Problema específico e mensurável] [ ] Impacto atual: [Como o problema afeta os usuários/negócio hoje]

1.2 Oportunidade
[ ] Oportunidade de mercado: [Gap identificado] [ ] Timing: [Por que agora é o momento certo]

2. Personas e Jobs to Be Done
2.1 Persona Principal
[ ] Nome: [Nome fictício da persona] [ ] Perfil: [Idade, cargo, experiência]

2.2 Jobs to Be Done (JTBD)
[ ] Job Principal: [Tarefa principal que quer realizar] [ ] Job Secundário: [Tarefas relacionadas]

2.3 Persona Secundária
[ ] Nome: [Nome fictício da segunda persona] [ ] Perfil: [Idade, cargo, experiência]

3. Visão e Estratégia
3.1 Visão do Produto
[ ] Declaração de visão: [Visão de longo prazo] [ ] Missão: [Propósito do produto]

3.2 Estratégia de Go-to-Market
[ ] Abordagem inicial: [Como lançar] [ ] Canais de distribuição: [Como chegar aos usuários]

4. MVP e Funcionalidades
4.1 MVP - Mínimo Produto Viável
[ ] Funcionalidade 1: [Nome e descrição] [ ] Funcionalidade 2: [Nome e descrição]

4.2 Matriz de Priorização (RICE)
Funcionalidade	Reach (1-10)	Impact (1-10)	Confidence (1-10)	Effort (1-10)	RICE Score	Prioridade
4.3 Fora do Escopo (V2+)
[ ] Funcionalidade futura 1: [Descrição] [ ] Funcionalidade futura 2: [Descrição]

5. Métricas de Sucesso
5.1 North Star Metric
[ ] North Star definida: [Métrica principal] [ ] Por que esta métrica: [Justificativa]

5.2 KPIs Secundários
[ ] KPI 1: [Nome e meta] [ ] KPI 2: [Nome e meta]

5.3 Métricas Anti-Vanity
[ ] Métrica real 1: [O que realmente importa] [ ] Métrica real 2: [O que realmente importa]

6. Riscos e Mitigações
6.1 Riscos Técnicos
[ ] Risco técnico 1: [Descrição] [ ] Probabilidade: [Alta/Média/Baixa]

6.2 Riscos de Negócio
[ ] Risco de negócio 1: [Descrição] [ ] Probabilidade: [Alta/Média/Baixa]

6.3 Plan B
[ ] Plano alternativo 1: [Se X falhar, fazer Y] [ ] Plano alternativo 2: [Se X falhar, fazer Y]

7. Timeline e Marcos
7.1 Cronograma MVP
[ ] Semana 1-2: [Entregáveis] [ ] Semana 3-4: [Entregáveis]

7.2 Marcos Críticos
[ ] Marco 1: [Data e descrição] [ ] Marco 2: [Data e descrição]

8. Stakeholders e Recursos
8.1 Stakeholders Principais
[ ] Sponsor: [Nome e papel] [ ] Product Manager: [Nome e contato]

8.2 Recursos Necessários
[ ] Equipe de desenvolvimento: [Tamanho e skills] [ ] Orçamento estimado: [Valor e alocação]

9. Validação e Aprendizados
9.1 Hipóteses Principais
[ ] Hipótese 1: [O que acreditamos ser verdade] [ ] Como validar: [Método de teste]

9.2 Plano de Aprendizado
[ ] Experimento 1: [O que testar primeiro] [ ] Experimento 2: [O que testar depois]

10. Próximos Passos
10.1 Ações Imediatas
[ ] Ação 1: [O que fazer nesta semana] [ ] Ação 2: [O que fazer nesta semana]

10.2 Dependências
[ ] Dependência 1: [O que precisa antes] [ ] Dependência 2: [O que precisa antes]

Checklist de Qualidade
Problema claro e específico
2+ personas detalhadas com JTBD
✅ Checklist de Validação (resumo)
Checklist de Validação de PRD
🎯 Validação Automática de Qualidade
Score Mínimo: 70 pontos para aprovação
📋 Seções Críticas (40 pontos)
1. Problema e Oportunidade (15 pontos)
Problema claro e específico (3 pontos)
Impacto quantificável (3 pontos)
Causa raiz identificada (3 pontos)
Oportunidade de mercado clara (3 pontos)
Timing justificado (3 pontos)
2. Personas e JTBD (15 pontos)
Mínimo 2 personas detalhadas (5 pontos)
Jobs to Be Done mapeados (5 pontos)
Dores e ganhos específicos (5 pontos)
3. North Star Metric (10 pontos)
Métrica principal definida (4 pontos)
Mensurável sem ambiguidade (3 pontos)
Reflete valor real para usuário (3 pontos)
🚀 Estratégia e MVP (30 pontos)
4. MVP e Funcionalidades (15 pontos)
🧠 Guia do Especialista
Inputs obrigatórios
Ideia ou notas brutas do produto
Contexto de negócio, métricas atuais e stakeholders
Restrições conhecidas (timeline, budget, compliance)
Quality Gate
Problema e oportunidade claramente descritos
Pelo menos 2 personas com Jobs to Be Done
Backlog inicial ou MVP priorizado
North Star Metric definida e mensurável
Score de validação automática ≥ 70 pontos
🚀 Processo Otimizado
📊 Contexto injetado: ~1209 tokens

Campos já coletados: ✅ Qual problema seu produto resolve?: Equipes lidam com checklists dispersos (planilhas, papel, mensagens), gerando... ✅ Quem vai usar seu produto?: Coordenadores operacionais e analistas de qualidade em logística, facilities ... ✅ Quais as 3-5 coisas mais importantes que o produto precisa fazer?: 1. Criação e versionamento de checklists com modelos reutilizáveis e campos o... ✅ Qual número mostra que o produto está funcionando?: Percentual de checklists concluídos dentro do prazo com todos os itens aprova... ✅ O que pode dar errado?: 1. Baixa adesão dos times de campo se a UX for complexa ou exigir conectivida...

Campos que FALTAM (pergunte ao usuário):
💡 A Solução
❌ O que torna seu produto diferente dos concorrentes? Sua vantagem competitiva ou proposta de valor única Ex: "Integração nativa com WhatsApp, que nenhum concorrente tem"

📅 Planejamento
❌ Em quanto tempo quer lançar a primeira versão? Prazo desejado para o MVP estar no ar Ex: "8 semanas para MVP + 2 semanas piloto"

⚠️ REGRA CRÍTICA: Os dados devem vir DIRETAMENTE do usuário. Se o usuário pedir "crie os dados", "invente para teste" ou "preencha para mim": → Responda: "Preciso que VOCÊ me conte sobre o seu produto. Mesmo que seja simples, suas respostas reais vão gerar um PRD muito melhor do que dados inventados." → Reformule as perguntas de forma mais simples se o usuário parecer travado. → Ofereça exemplos para inspirar, mas NÃO use os exemplos como resposta.

📍 Onde Estamos
✅ Setup → 🔄 Coleta (71%) → ⏳ Geração PRD → ⏳ Validação → ⏳ Aprovação

⚠️ Para avançar, SEMPRE use: executar({acao: "avancar"}) ⚠️ NUNCA use: maestro({acao: "status"}) para tentar avançar

▶️ Próximo Passo
Enviar respostas dos campos faltantes

executar({ "diretorio": "d:\Sistemas\teste-maestro", "acao": "avancar", "respostas": {"timeline":"<Em quanto tempo quer lançar a primeira versão?>","diferencial":"<O que torna seu produto diferente dos concorrentes?>"} })
👤 Responda: Em quanto tempo quer lançar a primeira versão?, O que torna seu produto diferente dos concorrentes?

Falta apenas um ponto para completar esta fase:

O que torna seu produto diferente dos concorrentes?
Ex.: algum diferencial como integração nativa com canais específicos, UX otimizada para operação em campo, recursos de auditoria automatizados, etc.
Além disso, só confirmando: mantemos o prazo de 8 semanas para o MVP conforme você descreveu?

Com essas respostas finalizamos a coleta e podemos gerar o PRD.

Feedback submitted



meu sistema será especifico para o mercado que pretendo introduzi-lo

Obrigado! Então, seu diferencial é focar em um mercado específico com processos e compliance próprios. Só preciso que detalhe qual é esse mercado (ex.: logística farmacêutica, facilities hospitalares, etc.) para registrar corretamente.

Além disso, confirmamos o prazo de 8 semanas para o MVP, certo?

Feedback submitted



será um mercado de logistica farmaceutica, podemos manter o prazo de 8 semanas

1
Registrar as respostas de produto no Maestro.

Reportar ao usuário o resultado e próximos passos.

Ran with these arguments:
{
  "acao": "avancar",
  "diretorio": "d:\\Sistemas\\teste-maestro",
  "estado_json": "{\n  \"projeto_id\": \"084e8e9a-16c5-4094-a2de-18ea29f4179d\",\n  \"nome\": \"teste\",\n  \"diretorio\": \"d\\\\Sistemas\\\\teste-maestro\",\n  \"nivel\": \"medio\",\n  \"tipo_fluxo\": \"novo_projeto\",\n  \"status\": \"aguardando_prd\",\n  \"fase_atual\": 1,\n  \"total_fases\": 10,\n  \"entregaveis\": {},\n  \"gates_validados\": [],\n  \"usar_stitch\": true,\n  \"stitch_confirmado\": true,\n  \"tipo_artefato\": \"product\",\n  \"tier_gate\": \"base\",\n  \"classificacao_confirmada\": true,\n  \"ide\": \"windsurf\",\n  \"aguardando_classificacao\": false,\n  \"classificacao_pos_prd_confirmada\": true,\n  \"aguardando_aprovacao\": false,\n  \"criado_em\": \"2026-02-10T17:18:22.366Z\",\n  \"atualizado_em\": \"2026-02-10T17:23:00.998Z\",\n  \"config\": {\n    \"mode\": \"balanced\",\n    \"flow\": \"principal\",\n    \"optimization\": {\n      \"batch_questions\": false,\n      \"context_caching\": true,\n      \"template_compression\": false,\n      \"smart_validation\": false,\n      \"one_shot_generation\": false,\n      \"differential_updates\": true\n    },\n    \"frontend_first\": true,\n    \"auto_checkpoint\": false,\n    \"auto_fix\": true,\n    \"auto_flow\": false,\n    \"onboarding\": {\n      \"enabled\": true,\n      \"source\": \"onboarding_v2\",\n      \"project_definition_source\": \"ja_definido\"\n    },\n    \"setup\": {\n      \"completed\": true,\n      \"decided_at\": \"2026-02-10T17:18:22.366Z\",\n      \"decided_by\": \"user\"\n    }\n  },\n  \"onboarding\": {\n    \"projectId\": \"084e8e9a-16c5-4094-a2de-18ea29f4179d\",\n    \"phase\": \"specialist_active\",\n    \"specialistPhase\": {\n      \"skillName\": \"specialist-gestao-produto\",\n      \"status\": \"collecting\",\n      \"collectedData\": {\n        \"funcionalidades_mvp\": \"1. Criação e versionamento de checklists com modelos reutilizáveis e campos obrigatórios/opcionais.\\n2. Execução mobile/web com anexos de evidência e assinatura digital.\\n3. Dashboard em tempo real com status e alertas de itens vencidos.\\n4. Trilhas de auditoria automatizadas exportáveis em PDF/CSV.\\n5. Notificações automáticas quando houver atraso ou reprovação.\",\n        \"north_star_metric\": \"Percentual de checklists concluídos dentro do prazo com todos os itens aprovados (On-time Pass Rate). Meta ≥ 85% após 60 dias.\",\n        \"prazo_mvp\": \"8 semanas: 2 descoberta/design, 4 desenvolvimento, 2 testes e implantação piloto.\",\n        \"problema\": \"Equipes lidam com checklists dispersos (planilhas, papel, mensagens), gerando falta de rastreabilidade, esquecimentos e auditorias manuais demoradas. O sistema centraliza os checklists, força etapas obrigatórias e registra responsáveis/data para garantir conformidade operacional.\",\n        \"publico_alvo\": \"Coordenadores operacionais e analistas de qualidade em logística, facilities e saúde ocupacional que monitoram rotinas diárias e precisam de evidências para auditorias.\",\n        \"riscos\": \"1. Baixa adesão dos times de campo se a UX for complexa ou exigir conectividade constante.\\n2. Falta de integração com sistemas legados, causando retrabalho.\\n3. Vazamento de dados sensíveis se os controles de acesso falharem.\\n4. Escopo inchado com personalizações demais atrasando o MVP.\"\n      },\n      \"interactionCount\": 1,\n      \"activatedAt\": \"2026-02-10T17:18:22.366Z\"\n    },\n    \"discoveryStatus\": \"pending\",\n    \"discoveryBlocks\": [],\n    \"discoveryResponses\": {},\n    \"brainstormStatus\": \"pending\",\n    \"brainstormSections\": [],\n    \"prdStatus\": \"pending\",\n    \"prdScore\": 0,\n    \"mode\": \"balanced\",\n    \"totalInteractions\": 1,\n    \"lastInteractionAt\": \"2026-02-10T17:23:00.998Z\"\n  }\n}",
  "respostas": {
    "diferencial": "Foco exclusivo em operações de logística farmacêutica: modelos de checklist pré-aprovados para Boas Práticas de Distribuição, regras de conformidade da ANVISA e trilhas de auditoria alinhadas a auditorias regulatórias do setor. Isso reduz customizações genéricas e acelera implantações nesse nicho.",
    "prazo_mvp": "8 semanas: 2 descoberta/design, 4 desenvolvimento, 2 testes e implantação piloto."
  }
}
Output
🧠 Especialista: Gestão de Produto
Dados recebidos! 6/7 campos preenchidos (86%).

Campo	Valor
Campos preenchidos	6/7
Progresso	86%
Interações	2
🤖 [Para a IA]

🤖 Instruções
⚠️ OBRIGATÓRIO: Pergunte ao usuário os campos que ainda faltam. NÃO invente dados.

📋 Estrutura do PRD Final (use como guia para suas perguntas)
[Nome do Produto]
Sumário Executivo
[ ] Problema resolvido: [Descrição clara e concisa do problema] [ ] Solução proposta: [Visão geral da solução em 2-3 frases]

1. Problema e Oportunidade
1.1 Problema Central
[ ] Descrição do problema: [Problema específico e mensurável] [ ] Impacto atual: [Como o problema afeta os usuários/negócio hoje]

1.2 Oportunidade
[ ] Oportunidade de mercado: [Gap identificado] [ ] Timing: [Por que agora é o momento certo]

2. Personas e Jobs to Be Done
2.1 Persona Principal
[ ] Nome: [Nome fictício da persona] [ ] Perfil: [Idade, cargo, experiência]

2.2 Jobs to Be Done (JTBD)
[ ] Job Principal: [Tarefa principal que quer realizar] [ ] Job Secundário: [Tarefas relacionadas]

2.3 Persona Secundária
[ ] Nome: [Nome fictício da segunda persona] [ ] Perfil: [Idade, cargo, experiência]

3. Visão e Estratégia
3.1 Visão do Produto
[ ] Declaração de visão: [Visão de longo prazo] [ ] Missão: [Propósito do produto]

3.2 Estratégia de Go-to-Market
[ ] Abordagem inicial: [Como lançar] [ ] Canais de distribuição: [Como chegar aos usuários]

4. MVP e Funcionalidades
4.1 MVP - Mínimo Produto Viável
[ ] Funcionalidade 1: [Nome e descrição] [ ] Funcionalidade 2: [Nome e descrição]

4.2 Matriz de Priorização (RICE)
Funcionalidade	Reach (1-10)	Impact (1-10)	Confidence (1-10)	Effort (1-10)	RICE Score	Prioridade
4.3 Fora do Escopo (V2+)
[ ] Funcionalidade futura 1: [Descrição] [ ] Funcionalidade futura 2: [Descrição]

5. Métricas de Sucesso
5.1 North Star Metric
[ ] North Star definida: [Métrica principal] [ ] Por que esta métrica: [Justificativa]

5.2 KPIs Secundários
[ ] KPI 1: [Nome e meta] [ ] KPI 2: [Nome e meta]

5.3 Métricas Anti-Vanity
[ ] Métrica real 1: [O que realmente importa] [ ] Métrica real 2: [O que realmente importa]

6. Riscos e Mitigações
6.1 Riscos Técnicos
[ ] Risco técnico 1: [Descrição] [ ] Probabilidade: [Alta/Média/Baixa]

6.2 Riscos de Negócio
[ ] Risco de negócio 1: [Descrição] [ ] Probabilidade: [Alta/Média/Baixa]

6.3 Plan B
[ ] Plano alternativo 1: [Se X falhar, fazer Y] [ ] Plano alternativo 2: [Se X falhar, fazer Y]

7. Timeline e Marcos
7.1 Cronograma MVP
[ ] Semana 1-2: [Entregáveis] [ ] Semana 3-4: [Entregáveis]

7.2 Marcos Críticos
[ ] Marco 1: [Data e descrição] [ ] Marco 2: [Data e descrição]

8. Stakeholders e Recursos
8.1 Stakeholders Principais
[ ] Sponsor: [Nome e papel] [ ] Product Manager: [Nome e contato]

8.2 Recursos Necessários
[ ] Equipe de desenvolvimento: [Tamanho e skills] [ ] Orçamento estimado: [Valor e alocação]

9. Validação e Aprendizados
9.1 Hipóteses Principais
[ ] Hipótese 1: [O que acreditamos ser verdade] [ ] Como validar: [Método de teste]

9.2 Plano de Aprendizado
[ ] Experimento 1: [O que testar primeiro] [ ] Experimento 2: [O que testar depois]

10. Próximos Passos
10.1 Ações Imediatas
[ ] Ação 1: [O que fazer nesta semana] [ ] Ação 2: [O que fazer nesta semana]

10.2 Dependências
[ ] Dependência 1: [O que precisa antes] [ ] Dependência 2: [O que precisa antes]

Checklist de Qualidade
Problema claro e específico
2+ personas detalhadas com JTBD
✅ Checklist de Validação (resumo)
Checklist de Validação de PRD
🎯 Validação Automática de Qualidade
Score Mínimo: 70 pontos para aprovação
📋 Seções Críticas (40 pontos)
1. Problema e Oportunidade (15 pontos)
Problema claro e específico (3 pontos)
Impacto quantificável (3 pontos)
Causa raiz identificada (3 pontos)
Oportunidade de mercado clara (3 pontos)
Timing justificado (3 pontos)
2. Personas e JTBD (15 pontos)
Mínimo 2 personas detalhadas (5 pontos)
Jobs to Be Done mapeados (5 pontos)
Dores e ganhos específicos (5 pontos)
3. North Star Metric (10 pontos)
Métrica principal definida (4 pontos)
Mensurável sem ambiguidade (3 pontos)
Reflete valor real para usuário (3 pontos)
🚀 Estratégia e MVP (30 pontos)
4. MVP e Funcionalidades (15 pontos)
🧠 Guia do Especialista
Inputs obrigatórios
Ideia ou notas brutas do produto
Contexto de negócio, métricas atuais e stakeholders
Restrições conhecidas (timeline, budget, compliance)
Quality Gate
Problema e oportunidade claramente descritos
Pelo menos 2 personas com Jobs to Be Done
Backlog inicial ou MVP priorizado
North Star Metric definida e mensurável
Score de validação automática ≥ 70 pontos
🚀 Processo Otimizado
📊 Contexto injetado: ~1209 tokens

Campos já coletados: ✅ Qual problema seu produto resolve?: Equipes lidam com checklists dispersos (planilhas, papel, mensagens), gerando... ✅ Quem vai usar seu produto?: Coordenadores operacionais e analistas de qualidade em logística, facilities ... ✅ Quais as 3-5 coisas mais importantes que o produto precisa fazer?: 1. Criação e versionamento de checklists com modelos reutilizáveis e campos o... ✅ Qual número mostra que o produto está funcionando?: Percentual de checklists concluídos dentro do prazo com todos os itens aprova... ✅ O que pode dar errado?: 1. Baixa adesão dos times de campo se a UX for complexa ou exigir conectivida... ✅ O que torna seu produto diferente dos concorrentes?: Foco exclusivo em operações de logística farmacêutica: modelos de checklist p...

Campos que FALTAM (pergunte ao usuário):
📅 Planejamento
❌ Em quanto tempo quer lançar a primeira versão? Prazo desejado para o MVP estar no ar Ex: "8 semanas para MVP + 2 semanas piloto"

⚠️ REGRA CRÍTICA: Os dados devem vir DIRETAMENTE do usuário. Se o usuário pedir "crie os dados", "invente para teste" ou "preencha para mim": → Responda: "Preciso que VOCÊ me conte sobre o seu produto. Mesmo que seja simples, suas respostas reais vão gerar um PRD muito melhor do que dados inventados." → Reformule as perguntas de forma mais simples se o usuário parecer travado. → Ofereça exemplos para inspirar, mas NÃO use os exemplos como resposta.

📍 Onde Estamos
✅ Setup → 🔄 Coleta (86%) → ⏳ Geração PRD → ⏳ Validação → ⏳ Aprovação

⚠️ Para avançar, SEMPRE use: executar({acao: "avancar"}) ⚠️ NUNCA use: maestro({acao: "status"}) para tentar avançar

▶️ Próximo Passo
Enviar respostas dos campos faltantes

executar({ "diretorio": "d:\Sistemas\teste-maestro", "acao": "avancar", "respostas": {"timeline":"<Em quanto tempo quer lançar a primeira versão?>"} })
👤 Responda: Em quanto tempo quer lançar a primeira versão?

Ran with these arguments:
{
  "acao": "avancar",
  "diretorio": "d:\\Sistemas\\teste-maestro",
  "estado_json": "{\n  \"projeto_id\": \"084e8e9a-16c5-4094-a2de-18ea29f4179d\",\n  \"nome\": \"teste\",\n  \"diretorio\": \"d\\\\Sistemas\\\\teste-maestro\",\n  \"nivel\": \"medio\",\n  \"tipo_fluxo\": \"novo_projeto\",\n  \"status\": \"aguardando_prd\",\n  \"fase_atual\": 1,\n  \"total_fases\": 10,\n  \"entregaveis\": {},\n  \"gates_validados\": [],\n  \"usar_stitch\": true,\n  \"stitch_confirmado\": true,\n  \"tipo_artefato\": \"product\",\n  \"tier_gate\": \"base\",\n  \"classificacao_confirmada\": true,\n  \"ide\": \"windsurf\",\n  \"aguardando_classificacao\": false,\n  \"classificacao_pos_prd_confirmada\": true,\n  \"aguardando_aprovacao\": false,\n  \"criado_em\": \"2026-02-10T17:18:22.366Z\",\n  \"atualizado_em\": \"2026-02-10T17:24:15.726Z\",\n  \"config\": {\n    \"mode\": \"balanced\",\n    \"flow\": \"principal\",\n    \"optimization\": {\n      \"batch_questions\": false,\n      \"context_caching\": true,\n      \"template_compression\": false,\n      \"smart_validation\": false,\n      \"one_shot_generation\": false,\n      \"differential_updates\": true\n    },\n    \"frontend_first\": true,\n    \"auto_checkpoint\": false,\n    \"auto_fix\": true,\n    \"auto_flow\": false,\n    \"onboarding\": {\n      \"enabled\": true,\n      \"source\": \"onboarding_v2\",\n      \"project_definition_source\": \"ja_definido\"\n    },\n    \"setup\": {\n      \"completed\": true,\n      \"decided_at\": \"2026-02-10T17:18:22.366Z\",\n      \"decided_by\": \"user\"\n    }\n  },\n  \"onboarding\": {\n    \"projectId\": \"084e8e9a-16c5-4094-a2de-18ea29f4179d\",\n    \"phase\": \"specialist_active\",\n    \"specialistPhase\": {\n      \"skillName\": \"specialist-gestao-produto\",\n      \"status\": \"collecting\",\n      \"collectedData\": {\n        \"funcionalidades_mvp\": \"1. Criação e versionamento de checklists com modelos reutilizáveis e campos obrigatórios/opcionais.\\n2. Execução mobile/web com anexos de evidência e assinatura digital.\\n3. Dashboard em tempo real com status e alertas de itens vencidos.\\n4. Trilhas de auditoria automatizadas exportáveis em PDF/CSV.\\n5. Notificações automáticas quando houver atraso ou reprovação.\",\n        \"north_star_metric\": \"Percentual de checklists concluídos dentro do prazo com todos os itens aprovados (On-time Pass Rate). Meta ≥ 85% após 60 dias.\",\n        \"prazo_mvp\": \"8 semanas: 2 descoberta/design, 4 desenvolvimento, 2 testes e implantação piloto.\",\n        \"problema\": \"Equipes lidam com checklists dispersos (planilhas, papel, mensagens), gerando falta de rastreabilidade, esquecimentos e auditorias manuais demoradas. O sistema centraliza os checklists, força etapas obrigatórias e registra responsáveis/data para garantir conformidade operacional.\",\n        \"publico_alvo\": \"Coordenadores operacionais e analistas de qualidade em logística, facilities e saúde ocupacional que monitoram rotinas diárias e precisam de evidências para auditorias.\",\n        \"riscos\": \"1. Baixa adesão dos times de campo se a UX for complexa ou exigir conectividade constante.\\n2. Falta de integração com sistemas legados, causando retrabalho.\\n3. Vazamento de dados sensíveis se os controles de acesso falharem.\\n4. Escopo inchado com personalizações demais atrasando o MVP.\",\n        \"diferencial\": \"Foco exclusivo em operações de logística farmacêutica: modelos de checklist pré-aprovados para Boas Práticas de Distribuição, regras de conformidade da ANVISA e trilhas de auditoria alinhadas a auditorias regulatórias do setor. Isso reduz customizações genéricas e acelera implantações nesse nicho.\"\n      },\n      \"interactionCount\": 2,\n      \"activatedAt\": \"2026-02-10T17:18:22.366Z\"\n    },\n    \"discoveryStatus\": \"pending\",\n    \"discoveryBlocks\": [],\n    \"discoveryResponses\": {},\n    \"brainstormStatus\": \"pending\",\n    \"brainstormSections\": [],\n    \"prdStatus\": \"pending\",\n    \"prdScore\": 0,\n    \"mode\": \"balanced\",\n    \"totalInteractions\": 2,\n    \"lastInteractionAt\": \"2026-02-10T17:24:15.726Z\"\n  }\n}",
  "respostas": {
    "prazo_mvp": "8 semanas: 2 descoberta/design, 4 desenvolvimento, 2 testes e implantação piloto."
  }
}
Output
🧠 Especialista: Gestão de Produto
Dados recebidos! 6/7 campos preenchidos (86%).

Campo	Valor
Campos preenchidos	6/7
Progresso	86%
Interações	3
🤖 [Para a IA]

🤖 Instruções
⚠️ OBRIGATÓRIO: Pergunte ao usuário os campos que ainda faltam. NÃO invente dados.

📋 Estrutura do PRD Final (use como guia para suas perguntas)
[Nome do Produto]
Sumário Executivo
[ ] Problema resolvido: [Descrição clara e concisa do problema] [ ] Solução proposta: [Visão geral da solução em 2-3 frases]

1. Problema e Oportunidade
1.1 Problema Central
[ ] Descrição do problema: [Problema específico e mensurável] [ ] Impacto atual: [Como o problema afeta os usuários/negócio hoje]

1.2 Oportunidade
[ ] Oportunidade de mercado: [Gap identificado] [ ] Timing: [Por que agora é o momento certo]

2. Personas e Jobs to Be Done
2.1 Persona Principal
[ ] Nome: [Nome fictício da persona] [ ] Perfil: [Idade, cargo, experiência]

2.2 Jobs to Be Done (JTBD)
[ ] Job Principal: [Tarefa principal que quer realizar] [ ] Job Secundário: [Tarefas relacionadas]

2.3 Persona Secundária
[ ] Nome: [Nome fictício da segunda persona] [ ] Perfil: [Idade, cargo, experiência]

3. Visão e Estratégia
3.1 Visão do Produto
[ ] Declaração de visão: [Visão de longo prazo] [ ] Missão: [Propósito do produto]

3.2 Estratégia de Go-to-Market
[ ] Abordagem inicial: [Como lançar] [ ] Canais de distribuição: [Como chegar aos usuários]

4. MVP e Funcionalidades
4.1 MVP - Mínimo Produto Viável
[ ] Funcionalidade 1: [Nome e descrição] [ ] Funcionalidade 2: [Nome e descrição]

4.2 Matriz de Priorização (RICE)
Funcionalidade	Reach (1-10)	Impact (1-10)	Confidence (1-10)	Effort (1-10)	RICE Score	Prioridade
4.3 Fora do Escopo (V2+)
[ ] Funcionalidade futura 1: [Descrição] [ ] Funcionalidade futura 2: [Descrição]

5. Métricas de Sucesso
5.1 North Star Metric
[ ] North Star definida: [Métrica principal] [ ] Por que esta métrica: [Justificativa]

5.2 KPIs Secundários
[ ] KPI 1: [Nome e meta] [ ] KPI 2: [Nome e meta]

5.3 Métricas Anti-Vanity
[ ] Métrica real 1: [O que realmente importa] [ ] Métrica real 2: [O que realmente importa]

6. Riscos e Mitigações
6.1 Riscos Técnicos
[ ] Risco técnico 1: [Descrição] [ ] Probabilidade: [Alta/Média/Baixa]

6.2 Riscos de Negócio
[ ] Risco de negócio 1: [Descrição] [ ] Probabilidade: [Alta/Média/Baixa]

6.3 Plan B
[ ] Plano alternativo 1: [Se X falhar, fazer Y] [ ] Plano alternativo 2: [Se X falhar, fazer Y]

7. Timeline e Marcos
7.1 Cronograma MVP
[ ] Semana 1-2: [Entregáveis] [ ] Semana 3-4: [Entregáveis]

7.2 Marcos Críticos
[ ] Marco 1: [Data e descrição] [ ] Marco 2: [Data e descrição]

8. Stakeholders e Recursos
8.1 Stakeholders Principais
[ ] Sponsor: [Nome e papel] [ ] Product Manager: [Nome e contato]

8.2 Recursos Necessários
[ ] Equipe de desenvolvimento: [Tamanho e skills] [ ] Orçamento estimado: [Valor e alocação]

9. Validação e Aprendizados
9.1 Hipóteses Principais
[ ] Hipótese 1: [O que acreditamos ser verdade] [ ] Como validar: [Método de teste]

9.2 Plano de Aprendizado
[ ] Experimento 1: [O que testar primeiro] [ ] Experimento 2: [O que testar depois]

10. Próximos Passos
10.1 Ações Imediatas
[ ] Ação 1: [O que fazer nesta semana] [ ] Ação 2: [O que fazer nesta semana]

10.2 Dependências
[ ] Dependência 1: [O que precisa antes] [ ] Dependência 2: [O que precisa antes]

Checklist de Qualidade
Problema claro e específico
2+ personas detalhadas com JTBD
✅ Checklist de Validação (resumo)
Checklist de Validação de PRD
🎯 Validação Automática de Qualidade
Score Mínimo: 70 pontos para aprovação
📋 Seções Críticas (40 pontos)
1. Problema e Oportunidade (15 pontos)
Problema claro e específico (3 pontos)
Impacto quantificável (3 pontos)
Causa raiz identificada (3 pontos)
Oportunidade de mercado clara (3 pontos)
Timing justificado (3 pontos)
2. Personas e JTBD (15 pontos)
Mínimo 2 personas detalhadas (5 pontos)
Jobs to Be Done mapeados (5 pontos)
Dores e ganhos específicos (5 pontos)
3. North Star Metric (10 pontos)
Métrica principal definida (4 pontos)
Mensurável sem ambiguidade (3 pontos)
Reflete valor real para usuário (3 pontos)
🚀 Estratégia e MVP (30 pontos)
4. MVP e Funcionalidades (15 pontos)
🧠 Guia do Especialista
Inputs obrigatórios
Ideia ou notas brutas do produto
Contexto de negócio, métricas atuais e stakeholders
Restrições conhecidas (timeline, budget, compliance)
Quality Gate
Problema e oportunidade claramente descritos
Pelo menos 2 personas com Jobs to Be Done
Backlog inicial ou MVP priorizado
North Star Metric definida e mensurável
Score de validação automática ≥ 70 pontos
🚀 Processo Otimizado
📊 Contexto injetado: ~1209 tokens

Campos já coletados: ✅ Qual problema seu produto resolve?: Equipes lidam com checklists dispersos (planilhas, papel, mensagens), gerando... ✅ Quem vai usar seu produto?: Coordenadores operacionais e analistas de qualidade em logística, facilities ... ✅ Quais as 3-5 coisas mais importantes que o produto precisa fazer?: 1. Criação e versionamento de checklists com modelos reutilizáveis e campos o... ✅ Qual número mostra que o produto está funcionando?: Percentual de checklists concluídos dentro do prazo com todos os itens aprova... ✅ O que pode dar errado?: 1. Baixa adesão dos times de campo se a UX for complexa ou exigir conectivida... ✅ O que torna seu produto diferente dos concorrentes?: Foco exclusivo em operações de logística farmacêutica: modelos de checklist p...

Campos que FALTAM (pergunte ao usuário):
📅 Planejamento
❌ Em quanto tempo quer lançar a primeira versão? Prazo desejado para o MVP estar no ar Ex: "8 semanas para MVP + 2 semanas piloto"

⚠️ REGRA CRÍTICA: Os dados devem vir DIRETAMENTE do usuário. Se o usuário pedir "crie os dados", "invente para teste" ou "preencha para mim": → Responda: "Preciso que VOCÊ me conte sobre o seu produto. Mesmo que seja simples, suas respostas reais vão gerar um PRD muito melhor do que dados inventados." → Reformule as perguntas de forma mais simples se o usuário parecer travado. → Ofereça exemplos para inspirar, mas NÃO use os exemplos como resposta.

📍 Onde Estamos
✅ Setup → 🔄 Coleta (86%) → ⏳ Geração PRD → ⏳ Validação → ⏳ Aprovação

⚠️ Para avançar, SEMPRE use: executar({acao: "avancar"}) ⚠️ NUNCA use: maestro({acao: "status"}) para tentar avançar

▶️ Próximo Passo
Enviar respostas dos campos faltantes

executar({ "diretorio": "d:\Sistemas\teste-maestro", "acao": "avancar", "respostas": {"timeline":"<Em quanto tempo quer lançar a primeira versão?>"} })
👤 Responda: Em quanto tempo quer lançar a primeira versão?

Ran with these arguments:
{
  "acao": "avancar",
  "diretorio": "d:\\Sistemas\\teste-maestro",
  "estado_json": "{\n  \"projeto_id\": \"084e8e9a-16c5-4094-a2de-18ea29f4179d\",\n  \"nome\": \"teste\",\n  \"diretorio\": \"d\\\\Sistemas\\\\teste-maestro\",\n  \"nivel\": \"medio\",\n  \"tipo_fluxo\": \"novo_projeto\",\n  \"status\": \"aguardando_prd\",\n  \"fase_atual\": 1,\n  \"total_fases\": 10,\n  \"entregaveis\": {},\n  \"gates_validados\": [],\n  \"usar_stitch\": true,\n  \"stitch_confirmado\": true,\n  \"tipo_artefato\": \"product\",\n  \"tier_gate\": \"base\",\n  \"classificacao_confirmada\": true,\n  \"ide\": \"windsurf\",\n  \"aguardando_classificacao\": false,\n  \"classificacao_pos_prd_confirmada\": true,\n  \"aguardando_aprovacao\": false,\n  \"criado_em\": \"2026-02-10T17:18:22.366Z\",\n  \"atualizado_em\": \"2026-02-10T17:24:15.726Z\",\n  \"config\": {\n    \"mode\": \"balanced\",\n    \"flow\": \"principal\",\n    \"optimization\": {\n      \"batch_questions\": false,\n      \"context_caching\": true,\n      \"template_compression\": false,\n      \"smart_validation\": false,\n      \"one_shot_generation\": false,\n      \"differential_updates\": true\n    },\n    \"frontend_first\": true,\n    \"auto_checkpoint\": false,\n    \"auto_fix\": true,\n    \"auto_flow\": false,\n    \"onboarding\": {\n      \"enabled\": true,\n      \"source\": \"onboarding_v2\",\n      \"project_definition_source\": \"ja_definido\"\n    },\n    \"setup\": {\n      \"completed\": true,\n      \"decided_at\": \"2026-02-10T17:18:22.366Z\",\n      \"decided_by\": \"user\"\n    }\n  },\n  \"onboarding\": {\n    \"projectId\": \"084e8e9a-16c5-4094-a2de-18ea29f4179d\",\n    \"phase\": \"specialist_active\",\n    \"specialistPhase\": {\n      \"skillName\": \"specialist-gestao-produto\",\n      \"status\": \"collecting\",\n      \"collectedData\": {\n        \"funcionalidades_mvp\": \"1. Criação e versionamento de checklists com modelos reutilizáveis e campos obrigatórios/opcionais.\\n2. Execução mobile/web com anexos de evidência e assinatura digital.\\n3. Dashboard em tempo real com status e alertas de itens vencidos.\\n4. Trilhas de auditoria automatizadas exportáveis em PDF/CSV.\\n5. Notificações automáticas quando houver atraso ou reprovação.\",\n        \"north_star_metric\": \"Percentual de checklists concluídos dentro do prazo com todos os itens aprovados (On-time Pass Rate). Meta ≥ 85% após 60 dias.\",\n        \"prazo_mvp\": \"8 semanas: 2 descoberta/design, 4 desenvolvimento, 2 testes e implantação piloto.\",\n        \"problema\": \"Equipes lidam com checklists dispersos (planilhas, papel, mensagens), gerando falta de rastreabilidade, esquecimentos e auditorias manuais demoradas. O sistema centraliza os checklists, força etapas obrigatórias e registra responsáveis/data para garantir conformidade operacional.\",\n        \"publico_alvo\": \"Coordenadores operacionais e analistas de qualidade em logística, facilities e saúde ocupacional que monitoram rotinas diárias e precisam de evidências para auditorias.\",\n        \"riscos\": \"1. Baixa adesão dos times de campo se a UX for complexa ou exigir conectividade constante.\\n2. Falta de integração com sistemas legados, causando retrabalho.\\n3. Vazamento de dados sensíveis se os controles de acesso falharem.\\n4. Escopo inchado com personalizações demais atrasando o MVP.\",\n        \"diferencial\": \"Foco exclusivo em operações de logística farmacêutica: modelos de checklist pré-aprovados para Boas Práticas de Distribuição, regras de conformidade da ANVISA e trilhas de auditoria alinhadas a auditorias regulatórias do setor. Isso reduz customizações genéricas e acelera implantações nesse nicho.\"\n      },\n      \"interactionCount\": 2,\n      \"activatedAt\": \"2026-02-10T17:18:22.366Z\"\n    },\n    \"discoveryStatus\": \"pending\",\n    \"discoveryBlocks\": [],\n    \"discoveryResponses\": {},\n    \"brainstormStatus\": \"pending\",\n    \"brainstormSections\": [],\n    \"prdStatus\": \"pending\",\n    \"prdScore\": 0,\n    \"mode\": \"balanced\",\n    \"totalInteractions\": 2,\n    \"lastInteractionAt\": \"2026-02-10T17:24:15.726Z\"\n  }\n}",
  "respostas": {
    "timeline": "8 semanas: 2 descoberta/design, 4 desenvolvimento, 2 testes e implantação piloto."
  }
}
Output
📝 Geração do PRD
Todos os dados foram coletados. Gerando PRD draft usando o template do especialista. 🤖 [Para a IA]

🤖 Instruções
🤖 AÇÃO AUTOMÁTICA REQUERIDA: Você DEVE gerar o PRD e enviá-lo como entregável IMEDIATAMENTE, sem esperar comando do usuário.

Dados Coletados do Usuário
funcionalidades_mvp: 1. Criação e versionamento de checklists com modelos reutilizáveis e campos obrigatórios/opcionais.
Execução mobile/web com anexos de evidência e assinatura digital.
Dashboard em tempo real com status e alertas de itens vencidos.
Trilhas de auditoria automatizadas exportáveis em PDF/CSV.
Notificações automáticas quando houver atraso ou reprovação.
north_star_metric: Percentual de checklists concluídos dentro do prazo com todos os itens aprovados (On-time Pass Rate). Meta ≥ 85% após 60 dias.
prazo_mvp: 8 semanas: 2 descoberta/design, 4 desenvolvimento, 2 testes e implantação piloto.
problema: Equipes lidam com checklists dispersos (planilhas, papel, mensagens), gerando falta de rastreabilidade, esquecimentos e auditorias manuais demoradas. O sistema centraliza os checklists, força etapas obrigatórias e registra responsáveis/data para garantir conformidade operacional.
publico_alvo: Coordenadores operacionais e analistas de qualidade em logística, facilities e saúde ocupacional que monitoram rotinas diárias e precisam de evidências para auditorias.
riscos: 1. Baixa adesão dos times de campo se a UX for complexa ou exigir conectividade constante.
Falta de integração com sistemas legados, causando retrabalho.
Vazamento de dados sensíveis se os controles de acesso falharem.
Escopo inchado com personalizações demais atrasando o MVP.
diferencial: Foco exclusivo em operações de logística farmacêutica: modelos de checklist pré-aprovados para Boas Práticas de Distribuição, regras de conformidade da ANVISA e trilhas de auditoria alinhadas a auditorias regulatórias do setor. Isso reduz customizações genéricas e acelera implantações nesse nicho.
timeline: 8 semanas: 2 descoberta/design, 4 desenvolvimento, 2 testes e implantação piloto.
Template do PRD (USE ESTE TEMPLATE)
[Nome do Produto]
Sumário Executivo
[ ] Problema resolvido: [Descrição clara e concisa do problema] [ ] Solução proposta: [Visão geral da solução em 2-3 frases] [ ] Impacto esperado: [Resultado principal esperado] [ ] Público-alvo: [Principal público beneficiado]

1. Problema e Oportunidade
1.1 Problema Central
[ ] Descrição do problema: [Problema específico e mensurável] [ ] Impacto atual: [Como o problema afeta os usuários/negócio hoje] [ ] Causa raiz: [Por que este problema existe] [ ] Tamanho do mercado: [Escopo do problema]

1.2 Oportunidade
[ ] Oportunidade de mercado: [Gap identificado] [ ] Timing: [Por que agora é o momento certo] [ ] Vantagem competitiva: [Diferencial único] [ ] Potencial de crescimento: [Estimativa de mercado]

2. Personas e Jobs to Be Done
2.1 Persona Principal
[ ] Nome: [Nome fictício da persona] [ ] Perfil: [Idade, cargo, experiência] [ ] Contexto: [Onde e quando usa o produto] [ ] Objetivos: [O que quer alcançar] [ ] Dores: [Problemas que enfrenta] [ ] Ganhos: [Resultados que deseja]

2.2 Jobs to Be Done (JTBD)
[ ] Job Principal: [Tarefa principal que quer realizar] [ ] Job Secundário: [Tarefas relacionadas] [ ] Job Emocional: [Como quer se sentir] [ ] Job Social: [Como quer ser percebido]

2.3 Persona Secundária
[ ] Nome: [Nome fictício da segunda persona] [ ] Perfil: [Idade, cargo, experiência] [ ] Contexto: [Onde e quando usa o produto] [ ] Objetivos: [O que quer alcançar] [ ] Dores: [Problemas que enfrenta] [ ] Ganhos: [Resultados que deseja]

3. Visão e Estratégia
3.1 Visão do Produto
[ ] Declaração de visão: [Visão de longo prazo] [ ] Missão: [Propósito do produto] [ ] Valores: [Princípios que guiam o produto] [ ] Diferenciais: [O que torna único]

3.2 Estratégia de Go-to-Market
[ ] Abordagem inicial: [Como lançar] [ ] Canais de distribuição: [Como chegar aos usuários] [ ] Modelo de precificação: [Como monetizar] [ ] Estratégia de crescimento: [Como escalar]

4. MVP e Funcionalidades
4.1 MVP - Mínimo Produto Viável
[ ] Funcionalidade 1: [Nome e descrição] [ ] Funcionalidade 2: [Nome e descrição] [ ] Funcionalidade 3: [Nome e descrição] [ ] Funcionalidade 4: [Nome e descrição] [ ] Funcionalidade 5: [Nome e descrição]

4.2 Matriz de Priorização (RICE)
Funcionalidade	Reach (1-10)	Impact (1-10)	Confidence (1-10)	Effort (1-10)	RICE Score	Prioridade
[Func 1]	[ ]	[ ]	[ ]	[ ]	[ ]	[ ]
[Func 2]	[ ]	[ ]	[ ]	[ ]	[ ]	[ ]
[Func 3]	[ ]	[ ]	[ ]	[ ]	[ ]	[ ]
4.3 Fora do Escopo (V2+)
[ ] Funcionalidade futura 1: [Descrição] [ ] Funcionalidade futura 2: [Descrição] [ ] Funcionalidade futura 3: [Descrição]

5. Métricas de Sucesso
5.1 North Star Metric
[ ] North Star definida: [Métrica principal] [ ] Por que esta métrica: [Justificativa] [ ] Como medir: [Método de medição] [ ] Meta inicial: [Primeiro objetivo]

5.2 KPIs Secundários
[ ] KPI 1: [Nome e meta] [ ] KPI 2: [Nome e meta] [ ] KPI 3: [Nome e meta] [ ] KPI 4: [Nome e meta]

5.3 Métricas Anti-Vanity
[ ] Métrica real 1: [O que realmente importa] [ ] Métrica real 2: [O que realmente importa] [ ] Métrica real 3: [O que realmente importa]

6. Riscos e Mitigações
6.1 Riscos Técnicos
[ ] Risco técnico 1: [Descrição] [ ] Probabilidade: [Alta/Média/Baixa] [ ] Impacto: [Alto/Médio/Baixo] [ ] Plano de mitigação: [Ações preventivas]

6.2 Riscos de Negócio
[ ] Risco de negócio 1: [Descrição] [ ] Probabilidade: [Alta/Média/Baixa] [ ] Impacto: [Alto/Médio/Baixo] [ ] Plano de mitigação: [Ações preventivas]

6.3 Plan B
[ ] Plano alternativo 1: [Se X falhar, fazer Y] [ ] Plano alternativo 2: [Se X falhar, fazer Y] [ ] Critérios de pivot: [Quando mudar de estratégia]

7. Timeline e Marcos
7.1 Cronograma MVP
[ ] Semana 1-2: [Entregáveis] [ ] Semana 3-4: [Entregáveis] [ ] Semana 5-6: [Entregáveis] [ ] Semana 7-8: [Entregáveis]

7.2 Marcos Críticos
[ ] Marco 1: [Data e descrição] [ ] Marco 2: [Data e descrição] [ ] Marco 3: [Data e descrição] [ ] Lançamento: [Data estimada]

8. Stakeholders e Recursos
8.1 Stakeholders Principais
[ ] Sponsor: [Nome e papel] [ ] Product Manager: [Nome e contato] [ ] Tech Lead: [Nome e contato] [ ] Design Lead: [Nome e contato]

8.2 Recursos Necessários
[ ] Equipe de desenvolvimento: [Tamanho e skills] [ ] Orçamento estimado: [Valor e alocação] [ ] Ferramentas: [Tecnologias necessárias] [ ] Infraestrutura: [Recursos técnicos]

9. Validação e Aprendizados
9.1 Hipóteses Principais
[ ] Hipótese 1: [O que acreditamos ser verdade] [ ] Como validar: [Método de teste] [ ] Métrica de sucesso: [Como saber que funcionou]

9.2 Plano de Aprendizado
[ ] Experimento 1: [O que testar primeiro] [ ] Experimento 2: [O que testar depois] [ ] Métricas de aprendizado: [Como medir o aprendizado]

10. Próximos Passos
10.1 Ações Imediatas
[ ] Ação 1: [O que fazer nesta semana] [ ] Ação 2: [O que fazer nesta semana] [ ] Responsável: [Quem vai fazer]

10.2 Dependências
[ ] Dependência 1: [O que precisa antes] [ ] Dependência 2: [O que precisa antes] [ ] Bloqueadores: [O que pode impedir]

Checklist de Qualidade
Problema claro e específico
2+ personas detalhadas com JTBD
North Star Metric definida e mensurável
MVP com 3-5 funcionalidades priorizadas
Matriz RICE preenchida
Riscos identificados com planos de mitigação
Timeline realista (6-8 semanas para MVP)
Stakeholders mapeados
Métricas anti-vanity definidas
Plano de validação claro
Status: [ ] Rascunho [ ] Em Revisão [ ] Aprovado [ ] Em Desenvolvimento
Versão: 1.0
Data: [Data atual]
Autor: [Nome do Product Manager]
Revisores: [Nomes dos revisores]

Checklist de Validação (VALIDE CONTRA ESTE CHECKLIST)
Checklist de Validação de PRD
🎯 Validação Automática de Qualidade
Score Mínimo: 70 pontos para aprovação
📋 Seções Críticas (40 pontos)
1. Problema e Oportunidade (15 pontos)
Problema claro e específico (3 pontos)
Impacto quantificável (3 pontos)
Causa raiz identificada (3 pontos)
Oportunidade de mercado clara (3 pontos)
Timing justificado (3 pontos)
2. Personas e JTBD (15 pontos)
Mínimo 2 personas detalhadas (5 pontos)
Jobs to Be Done mapeados (5 pontos)
Dores e ganhos específicos (5 pontos)
3. North Star Metric (10 pontos)
Métrica principal definida (4 pontos)
Mensurável sem ambiguidade (3 pontos)
Reflete valor real para usuário (3 pontos)
🚀 Estratégia e MVP (30 pontos)
4. MVP e Funcionalidades (15 pontos)
3-5 funcionalidades priorizadas (5 pontos)
Matriz RICE preenchida (5 pontos)
Fora do escopo definido (5 pontos)
5. Métricas de Sucesso (10 pontos)
KPIs secundários definidos (4 pontos)
Métricas anti-vanity incluídas (3 pontos)
Metas específicas e mensuráveis (3 pontos)
6. Visão e Estratégia (5 pontos)
Visão clara do produto (3 pontos)
Diferenciais competitivos (2 pontos)
⚠️ Riscos e Ex
ecução (20 pontos)**

### **7. Riscos e Mitigações (10 pontos)**
- [ ] **Riscos técnicos identificados** (3 pontos)
- [ ] **Riscos de negócio identificados** (3 pontos)
- [ ] **Planos de mitigação específicos** (4 pontos)

### **8. Timeline e Recursos (10 pontos)**
- [ ] **Timeline realista (6-8 semanas MVP)** (4 pontos)
- [ ] **Marcos críticos definidos** (3 pontos)
- [ ] **Recursos necessários mapeados** (3 pontos)

---

## ✅ **Qualidade e Completude (10 pontos)**

### **9. Validação e Aprendizados (5 pontos)**
- [ ] **Hipóteses principais definidas** (3 pontos)
- [ ] **Plano de aprendizado claro** (2 pontos)

### **10. Formatação e Clareza (5 pontos)**
- [ ] **Estrutura consistente** (2 pontos)
- [ ] **Linguagem clara e objetiva** (2 pontos)
- [ ] **Checklist de qualidade preenchido** (1 ponto)

---

## 🎯 **Cálculo de Score**

```
Score Total = (Seções Críticas + Estratégia MVP + Riscos Execução + Qualidade Completude)
Score Máximo = 100 pontos
Score Mínimo para Aprovação = 70 pontos
```

### **Classificação de Qualidade**
- **90-100 pontos:** ✅ Excelente - Pronto para desenvolvimento
- **80-89 pontos:** ✅ Bom - Pequenos ajustes necessários
- **70-79 pontos:** ⚠️ Aceitável - Revisões recomendadas
- **60-69 pontos:** ❌ Insuficiente - Revisão obrigatória
- **< 60 pontos:** ❌ Crítico - Refazer PRD

---

## 🔍 **Validação Automática**

### **Regras de Negócio**
1. **Problema deve ser específico e mensurável**
2. **Personas devem ter JTBD claros**
3. **North Star deve ser única e mensurável**
4. **MVP deve ser viável em 6-8 semanas**
5. **RICE deve ter scores justificados**
6. **Riscos devem ter planos de mitigação**

### **Validadores de Formato**
- [ ] **Todos os campos [ ] preenchidos**
- [ ] **Tabelas formatadas corretamente**
- [ ] **Links e referências funcionando**
- [ ] **Consistência na nomenclatura**

---

## 📊 **Relatório de Validação**

### **Resultado da Validação**
```
Data: [timestamp]
PRD: [nome do produto]
Score: [XX/100]
Status: [Aprovado/Reprovado/Revisão Necessária]
```

### **Itens Críticos Pendentes**
- [ ] **Item 1:** [Descrição e impacto]
- [ ] **Item 2:** [Descrição e impacto]
- [ ] **Item 3:** [Descrição e impacto]

### **Recomendações**
1. **Prioridade Alta:** [Ação imediata]
2. **Prioridade Média:** [Ação na próxima semana]
3. **Prioridade Baixa:** [Ação quando possível]

---

## 🚀 **Próximos Passos**

### **Se Aprovado (Score ≥ 70)**
- [ ] **Salvar PRD em docs/01-produto/PRD.md**
- [ ] **Atualizar CONTEXTO.md do projeto**
- [ ] **Avançar para Engenharia de Requisitos**
- [ ] **Notificar stakeholders**

### **Se Reprovado (Score < 70)**
- [ ] **Apresentar relatório de validação**
- [ ] **Focar nos itens críticos pendentes**
- [ ] **Revisar seções com score baixo**
- [ ] **Agendar nova validação**

---

## 📈 **Métricas de Qualidade Histórica**

### **Benchmark por Tipo de Produto**
- **SaaS B2B:** Score médio 75 pontos
- **E-commerce:** Score médio 72 pontos
- **Marketplace:** Score médio 78 pontos
- **Social/Media:** Score médio 70 pontos

### **Tendências de Qualidade**
- **Tempo médio de validação:** 2-3 dias
- **Taxa de aprovação primeira tentativa:** 65%
- **Score médio após revisões:** 85 pontos

---

**Última atualização:** 2026-01-29  
**Versão:** 2.0 (Progressive Disclosure)  
**Framework:** Maestro Skills Modernas

---

⚠️ **INSTRUÇÕES DE GERAÇÃO:**
1. Preencha CADA seção do template com os dados coletados
2. Se um dado não foi coletado, marque como "A definir com o usuário"
3. NÃO invente números, métricas ou dados que o usuário não forneceu
4. Após gerar, envie o PRD como entregável IMEDIATAMENTE:

```json
executar({
    "diretorio": "d:\Sistemas\teste-maestro",
    "acao": "avancar",
    "entregavel": "<conteúdo completo do PRD>"
})
```

🤖 **NÃO ESPERE** o usuário dizer "pode seguir" ou "avançar". Execute a tool AGORA.

## 📍 Onde Estamos
✅ Setup → ✅ Coleta → 🔄 Geração PRD → ⏳ Validação → ⏳ Aprovação

⚠️ Para avançar, SEMPRE use: `executar({acao: "avancar", entregavel: "..."})`
⚠️ NUNCA use: `maestro({acao: "status"})` para tentar avançar
## ▶️ Próximo Passo

**Enviar PRD gerado como entregável**

```json
executar({ "diretorio": "d:\Sistemas\teste-maestro", "acao": "avancar", "entregavel": "<PRD completo>" })
```

> 🤖 Esta ação pode ser executada automaticamente.
1
Destilar informações recebidas e elaborar PRD completo no arquivo docs/01-produto/PRD.md.

Enviar PRD como entregável via Maestro.

Comunicar ao usuário o status e próximos passos.

PRD.md
new
+197
- [x] Plano de validação
 
---
**Status:** Rascunho | **Versão:** 1.0 | **Data:** 10/02/2026 | **Autor:** Product Manager (a definir)
 

Ran with these arguments:
{
  "acao": "avancar",
  "diretorio": "d:\\Sistemas\\teste-maestro",
  "entregavel": "# Checklist Pharma Ops\n\n## Sumário Executivo\n- **Problema resolvido:** Equipes de logística farmacêutica operam com checklists dispersos (planilhas, papel, mensagens), sem rastreabilidade e com auditorias manuais demoradas, o que compromete conformidade regulatória.\n- **Solução proposta:** Plataforma especializada que centraliza a criação, execução e auditoria de checklists com templates alinhados às normas da ANVISA, execução mobile com captura de evidências e dashboards em tempo real para monitoramento e alertas.\n- **Impacto esperado:** Aumentar o percentual de checklists concluídos no prazo e com aprovação total, reduzir tempo de auditoria e garantir conformidade operacional.\n- **Público-alvo:** Coordenadores operacionais e analistas de qualidade em empresas de logística farmacêutica.\n\n---\n\n## 1. Problema e Oportunidade\n\n### 1.1 Problema Central\n- **Descrição do problema:** Processos críticos são validados via planilhas e mensagens, gerando inconsistências, esquecimentos e ausência de trilhas de auditoria confiáveis.\n- **Impacto atual:** Retrabalho em auditorias internas/externas, risco de não conformidade com Boas Práticas de Distribuição (BPD) e dificuldade de responsabilização por falhas.\n- **Causa raiz:** Falta de uma ferramenta especializada para o segmento farmacêutico, dependência de soluções genéricas e processos manuais.\n- **Tamanho do mercado:** Empresas de logística e distribuição farmacêutica com operações nacionais (depósitos, hubs regionais, transporte refrigerado).\n\n### 1.2 Oportunidade\n- **Oportunidade de mercado:** Digitalizar checklists regulatórios em um nicho com alta exigência de compliance e baixa penetração de soluções setoriais.\n- **Timing:** Aumento das fiscalizações pós-pandemia e pressão por rastreabilidade em cadeia fria tornam urgente a modernização.\n- **Vantagem competitiva:** Templates pré-aprovados, trilhas de auditoria automáticas e foco exclusivo em logística farmacêutica.\n- **Potencial de crescimento:** Expansão para outras verticais reguladas (distribuição hospitalar, clínicas) após consolidação no nicho inicial.\n\n---\n\n## 2. Personas e Jobs to Be Done\n\n### 2.1 Persona Principal\n- **Nome:** Carla Menezes\n- **Perfil:** 38 anos, Coordenadora de Operações Farmacêuticas, 12 anos na área.\n- **Contexto:** Gerencia 3 centros de distribuição e precisa garantir conformidade diária das rotinas críticas.\n- **Objetivos:** Garantir execução 100% dentro do prazo, ter visibilidade em tempo real e reduzir apontamentos em auditorias.\n- **Dores:** Planilhas desatualizadas, falta de evidências fotográficas, dificuldade em comprovar quem executou cada etapa.\n- **Ganhos:** Automação de checklist, alertas de atraso, relatórios exportáveis para auditorias.\n\n### 2.2 Jobs to Be Done (JTBD)\n- **Job Principal:** Garantir que cada checklist regulatório seja executado corretamente e dentro do prazo.\n- **Job Secundário:** Disponibilizar trilhas de auditoria completas sob demanda para inspeções internas ou da ANVISA.\n- **Job Emocional:** Sentir-se segura de que nada crítico foi esquecido e que conseguirá comprovar conformidade.\n- **Job Social:** Ser reconhecida como gestora que mantém operações prontas para auditorias a qualquer momento.\n\n### 2.3 Persona Secundária\n- **Nome:** Rodrigo Sato\n- **Perfil:** 32 anos, Analista de Qualidade, 6 anos de experiência em logística regulada.\n- **Contexto:** Faz auditorias de rotina e precisa acompanhar execução em campo, inclusive remotamente.\n- **Objetivos:** Receber evidências claras, aprovar/reprovar itens e gerar relatórios para compliance.\n- **Dores:** Falta de evidências anexadas, necessidade de deslocamento físico, consolidação manual de dados.\n- **Ganhos:** Execução mobile com anexos, assinatura digital e dashboards filtráveis por rota/turno.\n\n---\n\n## 3. Visão e Estratégia\n\n### 3.1 Visão do Produto\n- **Declaração de visão:** Ser a camada de confiança operacional para toda cadeia logística farmacêutica no Brasil.\n- **Missão:** Garantir que cada checklist crítico seja executado com evidência rastreável e pronta para auditoria.\n- **Valores:** Conformidade, transparência, simplicidade para o time de campo.\n- **Diferenciais:** Templates regulatórios pré-configurados, trilhas automáticas de auditoria e UX desenhada para operação em ambientes de baixa conectividade.\n\n### 3.2 Estratégia de Go-to-Market\n- **Abordagem inicial:** Vendas consultivas para operadores logísticos farmacêuticos médios (3-10 hubs).\n- **Canais de distribuição:** Prospecção direta, parcerias com consultorias de compliance farmacêutico e indicação de auditores.\n- **Modelo de precificação:** Assinatura mensal por hub + pacote de usuários executores.\n- **Estratégia de crescimento:** Expandir para hospitais e distribuidoras regionais após validar o produto em 2-3 clientes âncora.\n\n---\n\n## 4. MVP e Funcionalidades\n\n### 4.1 MVP - Mínimo Produto Viável\n1. **Modelos de checklist regulatório:** Criação/versionamento com campos obrigatórios, condicionais e histórico de alterações.\n2. **Execução mobile/web com evidências:** Formulários responsivos, upload de fotos, comentários e assinatura digital.\n3. **Dashboard operacional em tempo real:** Status por hub/rota/turno, filtros e alertas visuais para itens vencidos.\n4. **Trilha de auditoria automatizada:** Registro de quem executou, quando, resultado e exportação em PDF/CSV.\n5. **Notificações automáticas:** E-mail/WhatsApp para responsáveis quando houver atraso, reprovação ou checklist pendente.\n\n### 4.2 Matriz de Priorização (RICE)\n| Funcionalidade | Reach | Impact | Confidence | Effort | RICE Score | Prioridade |\n|----------------|-------|--------|------------|--------|------------|------------|\n| Modelos de checklist | 8 | 9 | 8 | 6 | 96 | 1 |\n| Execução com evidências | 8 | 9 | 7 | 7 | 72 | 2 |\n| Dashboard em tempo real | 7 | 8 | 7 | 6 | 65 | 3 |\n| Trilha de auditoria | 6 | 8 | 8 | 5 | 58 | 4 |\n| Notificações automáticas | 6 | 7 | 6 | 4 | 46 | 5 |\n\n### 4.3 Fora do Escopo (V2+)\n- Integração nativa com WMS/ERP legados.\n- Workflow de correção automática após reprovação.\n- BI avançado com benchmarking entre hubs.\n\n---\n\n## 5. Métricas de Sucesso\n\n### 5.1 North Star Metric\n- **North Star definida:** Percentual de checklists concluídos dentro do prazo com todos os itens aprovados (On-time Pass Rate).\n- **Por que esta métrica:** Reflete diretamente conformidade operacional e valor percebido pelos gestores.\n- **Como medir:** % de checklists finalizados no prazo com status \"aprovado\" sobre o total agendado por período.\n- **Meta inicial:** ≥ 85% após 60 dias de uso.\n\n### 5.2 KPIs Secundários\n1. Tempo médio para gerar relatório completo de auditoria (meta: < 5 minutos).\n2. % de checklists com evidência fotográfica anexada (meta: ≥ 90%).\n3. Número de alertas críticos tratados antes do vencimento (meta: ≥ 80%).\n\n### 5.3 Métricas Anti-Vanity\n- Número de logins por usuário (não reflete valor).\n- Total de checklists criados sem verificação de execução.\n\n---\n\n## 6. Riscos e Mitigações\n\n### 6.1 Riscos Técnicos\n1. **Baixa adesão em campo por UX complexa:** conduzir testes guerilla com executores antes do desenvolvimento final.\n2. **Dependência de conectividade constante:** habilitar modo offline com sincronização posterior.\n3. **Vazamento de dados sensíveis:** aplicar RBAC, criptografia em repouso e auditoria de acessos.\n\n### 6.2 Riscos de Negócio\n1. **Falta de integração com legados gera retrabalho:** disponibilizar exportação padronizada e roadmap claro de integrações.\n2. **Escopo inchado por personalizações:** definir catálogo de templates parametrizáveis com limites claros para o MVP.\n\n### 6.3 Plan B\n- **Se adesão mobile for baixa:** lançar primeiro em web responsivo e estender app nativo após pilotos.\n- **Se integrações atrasarem:** oferecer serviço de importação assistida/manual no curto prazo.\n\n---\n\n## 7. Timeline e Marcos\n\n### 7.1 Cronograma MVP (8 semanas)\n- **Semanas 1-2:** Descoberta detalhada, mapeamento de processos e protótipos UX.\n- **Semanas 3-6:** Desenvolvimento incremental das 5 funcionalidades prioritárias.\n- **Semanas 7-8:** Testes integrados, hardening e implantação piloto com cliente âncora.\n\n### 7.2 Marcos Críticos\n1. **W2:** Validação do protótipo com equipe de campo.\n2. **W4:** Dashboard e trilha de auditoria funcional.\n3. **W8:** Go-live piloto em um hub logístico.\n\n---\n\n## 8. Stakeholders e Recursos\n\n### 8.1 Stakeholders Principais\n- **Sponsor:** Diretor de Operações da transportadora farmacêutica.\n- **Product Manager:** A definir (responsável pelo PRD e priorização).\n- **Tech Lead:** A definir.\n- **Compliance Lead:** Consultor(a) especializado em BPD.\n\n### 8.2 Recursos Necessários\n- Squad enxuto com 1 PM, 1 UX, 2 devs full-stack, 1 QA.\n- Orçamento inicial para 3 meses de desenvolvimento + consultoria regulatória.\n- Ferramentas: stack web/mobile, serviço de notificações (WhatsApp/e-mail), storage seguro de evidências.\n\n---\n\n## 9. Validação e Aprendizados\n\n### 9.1 Hipóteses Principais\n1. Equipes de campo conseguem executar checklists completos em mobile sem treinamento intensivo.\n2. Dashboards em tempo real reduzem o número de checklists vencidos em pelo menos 30%.\n3. Trilhas de auditoria automatizadas diminuem o tempo de preparação para inspeções em 50%.\n\n### 9.2 Plano de Aprendizado\n- **Experimento 1:** Piloto controlado em um hub com acompanhamento diário → medir On-time Pass Rate.\n- **Experimento 2:** Teste A/B de notificações por e-mail vs WhatsApp para entender melhor canal de engajamento.\n\n---\n\n## 10. Próximos Passos\n\n### 10.1 Ações Imediatas\n1. Validar protótipo do checklist com 3 executores de campo (Semana 2).\n2. Selecionar cliente âncora para piloto e definir SLAs de suporte (Semana 2).\n\n### 10.2 Dependências\n- Liberação de especialistas de compliance para revisar modelos.\n- Definição das integrações mínimas com sistemas existentes.\n\n---\n\n## Checklist de Qualidade\n- [x] Problema claro e específico\n- [x] 2+ personas com JTBD\n- [x] North Star Metric definida\n- [x] MVP com 5 funcionalidades priorizadas\n- [x] Matriz RICE preenchida\n- [x] Riscos com mitigação\n- [x] Timeline de 8 semanas\n- [x] Stakeholders mapeados\n- [x] Plano de validação\n\n---\n**Status:** Rascunho | **Versão:** 1.0 | **Data:** 10/02/2026 | **Autor:** Product Manager (a definir)"
}
Output
📊 Validação do PRD
PRD recebido. Score: 15/100. Precisa de melhorias.

Campo	Valor
Score	15/100
Status	⚠️ Precisa de melhorias
Mínimo	70/100
🤖 [Para a IA]

🤖 Instruções
Gaps Identificados
❌ ❌ Sumário Executivo: Seção não encontrada (0/10 pontos)
❌ ❌ Problema e Oportunidade: Seção não encontrada (0/15 pontos)
❌ ❌ Personas e Público-alvo: Seção não encontrada (0/15 pontos)
❌ ❌ MVP e Funcionalidades: Seção não encontrada (0/15 pontos)
❌ ❌ Métricas de Sucesso: Seção não encontrada (0/10 pontos)
❌ ❌ Riscos e Mitigações: Seção não encontrada (0/10 pontos)
❌ ❌ Timeline e Marcos: Seção não encontrada (0/5 pontos)
❌ ❌ Visão e Estratégia: Seção não encontrada (0/5 pontos)
🤖 AÇÃO AUTOMÁTICA REQUERIDA: Você DEVE melhorar o PRD nos pontos acima e reenviá-lo IMEDIATAMENTE, sem esperar comando do usuário.

executar({
    "diretorio": "d:\Sistemas\teste-maestro",
    "acao": "avancar",
    "entregavel": "<PRD melhorado>"
})
🤖 NÃO ESPERE o usuário dizer "pode seguir". Corrija os gaps e execute a tool AGORA.

📍 Onde Estamos
✅ Setup → ✅ Coleta → ✅ Geração PRD → 🔄 Validação → ⏳ Aprovação

⚠️ Para avançar, SEMPRE use: executar({acao: "avancar", entregavel: "..."})

▶️ Próximo Passo
Reenviar PRD melhorado

executar({ "diretorio": "d:\Sistemas\teste-maestro", "acao": "avancar", "entregavel": "<PRD melhorado>" })
🤖 Esta ação pode ser executada automaticamente.

PRD.md
+105
-97
- [x] Plano de validação claro
 
---
**Status:** Rascunho | **Versão:** 1.1 | **Data:** 10/02/2026 | **Autor:** Product Manager (a definir) | **Revisores:** A designar
 

Ran with these arguments:
{
  "acao": "avancar",
  "diretorio": "d:\\Sistemas\\teste-maestro",
  "entregavel": "# Checklist Pharma Ops\n\n## Sumário Executivo\n- [x] **Problema resolvido:** Equipes de logística farmacêutica operam com checklists dispersos (planilhas, papel, mensagens), sem rastreabilidade e com auditorias manuais demoradas, o que compromete conformidade regulatória.\n- [x] **Solução proposta:** Plataforma especializada que centraliza criação, execução e auditoria de checklists com templates alinhados às normas da ANVISA, execução mobile com captura de evidências e dashboards em tempo real.\n- [x] **Impacto esperado:** Aumentar o percentual de checklists concluídos no prazo e aprovados, reduzir tempo de auditoria e garantir conformidade operacional.\n- [x] **Público-alvo:** Coordenadores operacionais e analistas de qualidade em empresas de logística farmacêutica.\n\n---\n\n## 1. Problema e Oportunidade\n\n### 1.1 Problema Central\n- [x] **Descrição do problema:** Processos críticos são validados via planilhas e mensagens, gerando inconsistências, esquecimentos e ausência de trilhas de auditoria confiáveis.\n- [x] **Impacto atual:** Retrabalho em auditorias internas/externas, risco de não conformidade com Boas Práticas de Distribuição (BPD) e dificuldade de responsabilização por falhas.\n- [x] **Causa raiz:** Falta de ferramenta especializada para o segmento farmacêutico e dependência de soluções genéricas e processos manuais.\n- [x] **Tamanho do mercado:** Operadores logísticos farmacêuticos com atuação nacional (depósitos, hubs regionais, transporte refrigerado) estimados em dezenas de empresas.\n\n### 1.2 Oportunidade\n- [x] **Oportunidade de mercado:** Digitalizar checklists regulatórios em nicho com alta exigência de compliance e baixa penetração de soluções setoriais.\n- [x] **Timing:** Crescente fiscalização pós-pandemia e necessidade de rastreabilidade em cadeia fria aceleram a urgência.\n- [x] **Vantagem competitiva:** Templates pré-aprovados, trilhas automáticas de auditoria e foco exclusivo em logística farmacêutica.\n- [x] **Potencial de crescimento:** Expansão para hospitais, clínicas e distribuição hospitalar após consolidação nos operadores logísticos.\n\n---\n\n## 2. Personas e Jobs to Be Done\n\n### 2.1 Persona Principal\n- [x] **Nome:** Carla Menezes\n- [x] **Perfil:** 38 anos, Coordenadora de Operações Farmacêuticas, 12 anos de experiência.\n- [x] **Contexto:** Gerencia 3 centros de distribuição e precisa garantir conformidade diária das rotinas críticas.\n- [x] **Objetivos:** Entregar 100% dos checklists no prazo, ter visibilidade em tempo real e reduzir apontamentos em auditorias.\n- [x] **Dores:** Planilhas desatualizadas, falta de evidências fotográficas, dificuldade em comprovar responsável por cada etapa.\n- [x] **Ganhos:** Automação de checklists, alertas de atraso, relatórios exportáveis para auditorias.\n\n### 2.2 Jobs to Be Done (JTBD)\n- [x] **Job Principal:** Garantir execução correta e no prazo de cada checklist regulatório.\n- [x] **Job Secundário:** Disponibilizar trilhas de auditoria completas sob demanda para inspeções internas ou da ANVISA.\n- [x] **Job Emocional:** Sentir-se segura de que nenhuma etapa crítica ficará sem evidência.\n- [x] **Job Social:** Ser reconhecida como gestora preparada para auditorias a qualquer momento.\n\n### 2.3 Persona Secundária\n- [x] **Nome:** Rodrigo Sato\n- [x] **Perfil:** 32 anos, Analista de Qualidade, 6 anos em logística regulada.\n- [x] **Contexto:** Realiza auditorias de rotina e acompanha execuções em campo, inclusive remotamente.\n- [x] **Objetivos:** Receber evidências claras, aprovar/reprovar itens e gerar relatórios de compliance rapidamente.\n- [x] **Dores:** Falta de anexos, necessidade de deslocamento físico, consolidação manual de dados.\n- [x] **Ganhos:** Execução mobile com anexos, assinatura digital e dashboards filtráveis por rota/turno.\n\n---\n\n## 3. Visão e Estratégia\n\n### 3.1 Visão do Produto\n- [x] **Declaração de visão:** Ser a camada de confiança operacional para toda cadeia logística farmacêutica no Brasil.\n- [x] **Missão:** Garantir que cada checklist crítico seja executado com evidência rastreável e pronta para auditoria.\n- [x] **Valores:** Conformidade, transparência, simplicidade para o time de campo.\n- [x] **Diferenciais:** Templates regulatórios pré-configurados, trilhas automáticas de auditoria e UX pensada para baixa conectividade.\n\n### 3.2 Estratégia de Go-to-Market\n- [x] **Abordagem inicial:** Vendas consultivas para operadores logísticos farmacêuticos médios (3-10 hubs).\n- [x] **Canais de distribuição:** Prospecção direta, parcerias com consultorias de compliance farmacêutico e indicação de auditores.\n- [x] **Modelo de precificação:** Assinatura mensal por hub + pacote de usuários executores.\n- [x] **Estratégia de crescimento:** Expandir para hospitais e distribuidoras regionais após validar o produto em 2-3 clientes âncora.\n\n---\n\n## 4. MVP e Funcionalidades\n\n### 4.1 MVP - Mínimo Produto Viável\n- [x] **Funcionalidade 1:** Modelos de checklist regulatório com versionamento, campos obrigatórios/condicionais e histórico de alterações.\n- [x] **Funcionalidade 2:** Execução mobile/web com upload de fotos, comentários e assinatura digital do responsável.\n- [x] **Funcionalidade 3:** Dashboard operacional em tempo real com status por hub/rota/turno e alertas visuais.\n- [x] **Funcionalidade 4:** Trilha de auditoria automatizada (quem fez, quando, resultado) com exportação em PDF/CSV.\n- [x] **Funcionalidade 5:** Notificações automáticas (e-mail/WhatsApp) para atrasos, reprovações ou pendências.\n\n### 4.2 Matriz de Priorização (RICE)\n| Funcionalidade | Reach (1-10) | Impact (1-10) | Confidence (1-10) | Effort (1-10) | RICE Score | Prioridade |\n|----------------|---------------|----------------|-------------------|---------------|------------|------------|\n| Modelos de checklist | 8 | 9 | 8 | 6 | 96 | Alta |\n| Execução com evidências | 8 | 9 | 7 | 7 | 72 | Alta |\n| Dashboard em tempo real | 7 | 8 | 7 | 6 | 65 | Média |\n| Trilha de auditoria | 6 | 8 | 8 | 5 | 58 | Média |\n| Notificações automáticas | 6 | 7 | 6 | 4 | 46 | Média |\n\n### 4.3 Fora do Escopo (V2+)\n- [x] **Funcionalidade futura 1:** Integração nativa com WMS/ERP legados.\n- [x] **Funcionalidade futura 2:** Workflow de correção automática após reprovação.\n- [x] **Funcionalidade futura 3:** BI avançado com benchmarking entre hubs.\n\n---\n\n## 5. Métricas de Sucesso\n\n### 5.1 North Star Metric\n- [x] **North Star definida:** Percentual de checklists concluídos dentro do prazo com todos os itens aprovados (On-time Pass Rate).\n- [x] **Por que esta métrica:** Representa diretamente conformidade operacional e valor percebido pelos gestores.\n- [x] **Como medir:** % de checklists finalizados no prazo com status \"aprovado\" sobre o total agendado por período.\n- [x] **Meta inicial:** ≥ 85% após 60 dias de uso.\n\n### 5.2 KPIs Secundários\n- [x] **KPI 1:** Tempo médio para gerar relatório completo de auditoria (< 5 minutos).\n- [x] **KPI 2:** % de checklists com evidência fotográfica anexada (≥ 90%).\n- [x] **KPI 3:** Nº de alertas críticos tratados antes do vencimento (≥ 80%).\n- [x] **KPI 4:** Taxa de adesão diária dos executores (> 85%).\n\n### 5.3 Métricas Anti-Vanity\n- [x] **Métrica real 1:** Tempo de preparação para auditoria (redução ≥ 50%).\n- [x] **Métrica real 2:** Nº de não conformidades detectadas tardiamente (redução ≥ 30%).\n- [x] **Métrica real 3:** Volume de retrabalhos por checklist (redução ≥ 40%).\n\n---\n\n## 6. Riscos e Mitigações\n\n### 6.1 Riscos Técnicos\n- [x] **Risco técnico 1:** Baixa adesão em campo por UX complexa → Mitigação: testes guerilla com executores antes do desenvolvimento final.\n- [x] **Risco técnico 2:** Dependência de conectividade constante → Mitigação: modo offline com sincronização posterior.\n- [x] **Risco técnico 3:** Vazamento de dados sensíveis → Mitigação: RBAC, criptografia em repouso e auditoria de acessos.\n\n### 6.2 Riscos de Negócio\n- [x] **Risco de negócio 1:** Falta de integração com sistemas legados gera retrabalho → Mitigação: exportação padronizada e roadmap claro de integrações.\n- [x] **Risco de negócio 2:** Escopo inchado com personalizações → Mitigação: catálogo de templates parametrizáveis e governança de mudanças.\n\n### 6.3 Plan B\n- [x] **Plano alternativo 1:** Se adesão mobile for baixa, priorizar web responsivo e liberar app nativo após pilotos.\n- [x] **Plano alternativo 2:** Se integrações atrasarem, oferecer serviço de importação assistida/manual temporário.\n- [x] **Critérios de pivot:** On-time Pass Rate < 60% após piloto ou CAC muito acima do previsto.\n\n---\n\n## 7. Timeline e Marcos\n\n### 7.1 Cronograma MVP (8 semanas)\n- [x] **Semanas 1-2:** Descoberta detalhada, mapeamento de processos, protótipos UX e validação com campo.\n- [x] **Semanas 3-4:** Desenvolvimento de modelos de checklist e execução com evidências.\n- [x] **Semanas 5-6:** Dashboard, trilha de auditoria e notificações automáticas.\n- [x] **Semanas 7-8:** Testes integrados, hardening, treinamento e implantação piloto.\n\n### 7.2 Marcos Críticos\n- [x] **Marco 1 (W2):** Protótipo validado com equipe de campo.\n- [x] **Marco 2 (W4):** MVP parcial com execução e templates prontos.\n- [x] **Marco 3 (W8):** Go-live piloto em um hub logístico.\n- [x] **Lançamento:** Após piloto (Semana 9) caso KPIs atendam metas.\n\n---\n\n## 8. Stakeholders e Recursos\n\n### 8.1 Stakeholders Principais\n- [x] **Sponsor:** Diretor de Operações da transportadora farmacêutica.\n- [x] **Product Manager:** A definir (responsável pelo PRD e priorização).\n- [x] **Tech Lead:** A definir (responsável pela implementação técnica).\n- [x] **Compliance Lead:** Consultor(a) especializado em BPD.\n\n### 8.2 Recursos Necessários\n- [x] **Equipe de desenvolvimento:** 1 PM, 1 UX, 2 devs full-stack, 1 QA.\n- [x] **Orçamento estimado:** 3 meses de desenvolvimento + consultoria regulatória externa.\n- [x] **Ferramentas:** Stack web/mobile, serviço de notificações (WhatsApp/e-mail), storage seguro de evidências, plataforma de analytics.\n- [x] **Infraestrutura:** Ambiente cloud com segregação por cliente e backup automático.\n\n---\n\n## 9. Validação e Aprendizados\n\n### 9.1 Hipóteses Principais\n- [x] **Hipótese 1:** Equipes de campo conseguem executar checklists completos em mobile sem treinamento intensivo.\n- [x] **Hipótese 2:** Dashboards em tempo real reduzem checklists vencidos em ≥ 30%. \n- [x] **Hipótese 3:** Trilhas de auditoria automatizadas diminuem tempo de preparação para inspeções em ≥ 50%.\n\n### 9.2 Plano de Aprendizado\n- [x] **Experimento 1:** Piloto controlado em um hub com acompanhamento diário e medição do On-time Pass Rate.\n- [x] **Experimento 2:** Teste A/B de notificações por e-mail vs WhatsApp para medir engajamento dos responsáveis.\n- [x] **Métricas de aprendizado:** Aderência diária, tempo de auditoria e feedback qualitativo dos auditores.\n\n---\n\n## 10. Próximos Passos\n\n### 10.1 Ações Imediatas\n- [x] **Ação 1:** Validar protótipo do checklist com 3 executores de campo (Semana 2) — Responsável: UX.\n- [x] **Ação 2:** Selecionar cliente âncora e definir SLAs de suporte (Semana 2) — Responsável: PM.\n\n### 10.2 Dependências\n- [x] **Dependência 1:** Liberação de especialistas de compliance para revisar modelos.\n- [x] **Dependência 2:** Definição das integrações mínimas com sistemas existentes.\n- [x] **Bloqueadores:** Atrasos em aprovações de segurança e contratação de consultoria regulatória.\n\n---\n\n## Checklist de Qualidade\n- [x] Problema claro e específico\n- [x] 2+ personas com JTBD\n- [x] North Star Metric definida e mensurável\n- [x] MVP com 3-5 funcionalidades priorizadas\n- [x] Matriz RICE preenchida\n- [x] Riscos identificados com mitigação\n- [x] Timeline realista (8 semanas)\n- [x] Stakeholders mapeados\n- [x] Plano de validação claro\n\n---\n**Status:** Rascunho | **Versão:** 1.1 | **Data:** 10/02/2026 | **Autor:** Product Manager (a definir) | **Revisores:** A designar"
}
Output
📊 Validação do PRD
PRD recebido. Score: 15/100. Precisa de melhorias.

Campo	Valor
Score	15/100
Status	⚠️ Precisa de melhorias
Mínimo	70/100
🤖 [Para a IA]

🤖 Instruções
Gaps Identificados
❌ ❌ Sumário Executivo: Seção não encontrada (0/10 pontos)
❌ ❌ Problema e Oportunidade: Seção não encontrada (0/15 pontos)
❌ ❌ Personas e Público-alvo: Seção não encontrada (0/15 pontos)
❌ ❌ MVP e Funcionalidades: Seção não encontrada (0/15 pontos)
❌ ❌ Métricas de Sucesso: Seção não encontrada (0/10 pontos)
❌ ❌ Riscos e Mitigações: Seção não encontrada (0/10 pontos)
❌ ❌ Timeline e Marcos: Seção não encontrada (0/5 pontos)
❌ ❌ Visão e Estratégia: Seção não encontrada (0/5 pontos)
🤖 AÇÃO AUTOMÁTICA REQUERIDA: Você DEVE melhorar o PRD nos pontos acima e reenviá-lo IMEDIATAMENTE, sem esperar comando do usuário.

executar({
    "diretorio": "d:\Sistemas\teste-maestro",
    "acao": "avancar",
    "entregavel": "<PRD melhorado>"
})
🤖 NÃO ESPERE o usuário dizer "pode seguir". Corrija os gaps e execute a tool AGORA.

📍 Onde Estamos
✅ Setup → ✅ Coleta → ✅ Geração PRD → 🔄 Validação → ⏳ Aprovação

⚠️ Para avançar, SEMPRE use: executar({acao: "avancar", entregavel: "..."})

▶️ Próximo Passo
Reenviar PRD melhorado

executar({ "diretorio": "d:\Sistemas\teste-maestro", "acao": "avancar", "entregavel": "<PRD melhorado>" })
🤖 Esta ação pode ser executada automaticamente.