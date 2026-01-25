# 🧠 Regras de Classificação de Complexidade

> Este arquivo define a lógica para analisar o **PRD (Produto)** e calcular automaticamente a complexidade do projeto.

---

## 1. Tabela de Pontuação

**Instrução:** Leia o conteúdo do `docs/01-produto/PRD.md` e some os pontos baseados nos critérios abaixo.

| Critério | O que buscar (Regex/Keywords) | Pontos |
| :--- | :--- | :--- |
| **1. Entidades de Domínio** | Conte substantivos únicos relevantes (ex: Usuário, Pedido, Produto).<br>- `> 15 entidades`: **+3**<br>- `> 8 entidades`: **+2**<br>- `Até 8`: **+1** | `___` |
| **2. Integrações Externas** | Palavras-chave: `API`, `integração`, `webhook`, `pagamento`, `stripe`, `auth0`, `firebase`.<br>- Se encontrar qualquer uma: **+3** | `___` |
| **3. Requisitos de Segurança** | Palavras-chave: `LGPD`, `GDPR`, `criptografia`, `JWT`, `permissões`, `roles`.<br>- Se encontrar qualquer uma: **+3** | `___` |
| **4. Escala e Performance** | Palavras-chave: `milhares`, `milhões`, `alta disponibilidade`, `concorrência`, `cluster`.<br>- Se encontrar qualquer uma: **+3** | `___` |
| **5. Multi-tenancy / B2B** | Palavras-chave: `multi-tenant`, `workspace`, `organização`, `saas`.<br>- Se encontrar qualquer uma: **+2** | `___` |
| **6. Cronograma Estimado** | Verifique seções de tempo.<br>- `> 6 meses`: **+3**<br>- `> 2 meses`: **+2**<br>- `Curto prazo`: **+1** | `___` |
| **7. Regras de Negócio** | Frequência de palavras: `regra`, `validação`, `fluxo`, `condição`.<br>- `Alta densidade`: **+3**<br>- `Média densidade`: **+2** | `___` |

---

## 2. Tabela de Decisão (Nível)

**Instrução:** Use a soma total dos pontos para definir o nível e o fluxo do projeto.

| Pontuação Total | Nível Definido | Total de Fases do Fluxo |
| :--- | :--- | :--- |
| **0 a 8 pontos** | **🥉 Simples** | **7 Fases** (Produto → Requisitos → UX → Arq → Backlog → Front → Back) |
| **9 a 15 pontos** | **🥈 Médio** | **13 Fases** (Adiciona: Modelo, Banco, Segurança, Contrato, Testes, Integração) |
| **16+ pontos** | **🥇 Complexo** | **17 Fases** (Adiciona: Arq. Avançada, Performance, Observabilidade, Deploy Final) |

---

## 3. Ação Pós-Classificação (Apenas Fase 1)

Se você acabou de concluir a Fase 1 (Produto):
1.  **Calcule** a pontuação.
2.  **Determine** o nível.
3.  **Atualize** o arquivo `.maestro/estado.json` com:
    *   `"nivel": "simples" | "medio" | "complexo"`
    *   `"total_fases": 7 | 11 | 15`
    *   `"pontuacao_complexidade": {numero}`
