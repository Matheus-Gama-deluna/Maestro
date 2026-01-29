# Exemplos de Requisitos - Input/Output Pairs

## 🎯 **Exemplo 1: Sistema de E-commerce**

### **Input do Usuário**
```
Preciso detalhar os requisitos para um sistema de e-commerce de roupas masculinas.
O PRD já foi validado e inclui:
- 3 personas principais: Homem Executivo, Jovem Profissional, Estudante
- MVP com 5 funcionalidades principais
- North Star: Taxa de conversão de visitante para cliente
- Integração com sistema de pagamento e estoque
```

### **Output Gerado (Resumo)**
```markdown
# E-commerce Masculino - Documento de Requisitos

## Sumário Executivo
- **Projeto:** E-commerce Masculino
- **Versão:** 1.0
- **Status:** Em elaboração
- **Autor:** Engenheiro de Requisitos

## 2. Requisitos Funcionais

### 2.1 Catálogo de Produtos

#### RF-001: Visualização de Produtos
- **Descrição:** Sistema deve permitir visualizar produtos com imagens, descrições e preços
- **Prioridade:** Alta
- **Fonte:** PRD - Seção 3.1
- **Complexidade:** Baixa
- **Esforço Estimado:** 40 horas
- **Dependências:** Nenhuma
- **Aceite:** Usuário pode filtrar produtos por categoria, tamanho e cor

#### RF-002: Carrinho de Compras
- **Descrição:** Sistema deve permitir adicionar/remover produtos do carrinho
- **Prioridade:** Alta
- **Source:** PRD - Seção 3.2
- **Complexidade:** Média
- **Esforço Estimado:** 60 horas
- **Dependências:** RF-001
- **Aceite:** Carrinho deve persistir entre sessões

#### RF-003: Processamento de Pagamento
- **Descrição:** Sistema deve processar pagamentos com cartão de crédito
- **Prioridade:** Alta
- **Source:** PRD - Seção 3.3
- **Complexidade:** Alta
- **Esforço Estimado:** 80 horas
- **Dependências:** RF-002
- **Aceite:** Pagamento deve ser seguro e compatível com PCI DSS

#### RF-004: Histórico de Pedidos
- **Status:** Em elaboração

## 3. Requisitos Não Funcionais

### 3.1 Performance

#### RNF-001: Tempo de Carregamento
- **Descrição:** Páginas devem carregar em menos de 3 segundos
- **Categoria:** Performance
- **Métrica:** Tempo de carregamento (segundos)
- **Valor Alvo:** < 3 segundos
- **Condições:** 1000 usuários simultâneos
- **Aceite:** 95% das requisições atendem ao tempo alvo

### 3.2 Segurança

#### RNF-003: Proteção de Dados
- **Descrição:** Dados dos clientes devem ser criptografados
- **Categoria:** Segurança
- **Métrica:** Percentual de dados criptografados
- **Valor Alvo:** 100%
- **Condições:** Todos os dados PII
- **Aceite:** Conformidade com LGPD

## Score de Validação: 85/100 ✅
```

---

## 🛒 **Exemplo 2: Sistema de Gestão de Projetos**

### **Input do Usuário**
```
Preciso detalhar requisitos para um sistema de gestão de projetos.
O PRD inclui:
- 4 personas: Gerente de Projeto, Desenvolvedor, Cliente, Analista
- MVP com gerenciamento de tarefas, timeline e relatórios
- North Star: Taxa de conclusão de projetos no prazo
- Integração com calendário e sistema de notificações
```

### **Output Gerado (Resumo)**
```markdown
# Sistema de Gestão de Projetos - Documento de Requisitos

## 2. Requisitos Funcionais

### 2.1 Gerenciamento de Projetos

#### RF-001: Criação de Projetos
- **Descrição:** Sistema deve permitir criar novos projetos com informações básicas
- **Prioridade:** Alta
- **Source:** PRD - Seção 2.1
- **Complexidade:** Baixa
- **Esforço Estimado:** 30 horas
- **Dependências:** Nenhuma
- **Aceite:** Projeto deve ter título, descrição e datas de início/fim

#### RF-002: Gerenciamento de Tarefas
- **Description:** Sistema deve permitir criar, editar e excluir tarefas
- **Prioridade:** Alta
- **Source:** PRD - Seção 2.2
- **Complexidade:** Média
- **Esforço Estimado:** 50 horas
- **Dependências:** RF-001
- **Aceite:** Tarefas devem ter título, descrição, responsável e status

#### RF-003: Timeline Visual
- **Description:** Sistema deve exibir timeline visual do projeto
- **Prioridade:** Alta
- **Source:** PRD - Seção 2.3
- **Complexidade:** Média
- **Esforço Estimado:** 60 horas
- **Dependências:** RF-001, RF-002
- **Aceite:** Timeline deve mostrar marcos e dependências

#### RF-004: Geração de Relatórios
- **Description:** Sistema deve gerar relatórios de progresso e performance
- **Prioridade:** Média
- **Source:** PRD - Seção 2.4
- **Complexidade:** Alta
- **Esforço Estimado:** 80 horas
- **Dependências:** RF-001, RF-002, RF-003
- **Aceite:** Relatórios devem incluir gráficos e métricas

## 3. Requisitos Não Funcionais

### 3.1 Performance

#### RNF-001: Consultas em Tempo Real
- **Description:** Consultas ao banco de dados devem responder em < 1 segundo
- **Categoria:** Performance
- **Métrica:** Tempo de resposta (milissegundos)
- **Valor Alvo:** < 1000ms
- **Condições:** 100 usuários simultâneos
- **Aceite:** 95% das consultas atendem ao tempo alvo

### 3.2 Usabilidade

#### RNF-003: Interface Responsiva
- **Description:** Interface deve funcionar em dispositivos móveis
- **Categoria:** Usabilidade
- **Métrica:** Pontuação de usabilidade mobile
- **Valor Alvo:** > 85 pontos
- **Condições:** iOS e Android
- **Aceite:** Interface adaptável a diferentes tamanhos de tela

## Score de Validação: 88/100 ✅
```

---

## 📱 **Exemplo 3: Sistema de Gestão de Estoque**

### **Input do Usuário**
```
Preciso detalhar requisitos para sistema de gestão de estoque.
O PRD inclui:
- 2 personas: Gerente de Estoque, Operador de Logística
- MVP com controle de entrada/saída, alertas e relatórios
- North Star: Taxa de acurácia do inventário
- Integração com sistema de vendas e fornecedores
```

### **Output Gerado (Resumo)**
```markdown
# Sistema de Gestão de Estoque - Documento de Requisitos

## 2. Requisitos Funcionais

### 2.1 Controle de Estoque

#### RF-001: Entrada de Mercadorias
- **Description:** Sistema deve registrar entrada de produtos no estoque
- **Prioridade:** Alta
- **Source:** PRD - Seção 2.1
- **Complexidade:** Média
- **Esforço Estimado:** 50 horas
- **Dependências:** Nenhuma
- **Aceite:** Entrada deve incluir código, quantidade, data de validade

#### RF-002: Saída de Mercadorias
- **Description:** Sistema deve registrar saída de produtos do estoque
- **Prioridade:** Alta
- **Source:** PRD - Seção 2.2
- **Complexidade:** Média
- **Esforço Estimado:** 50 horas
- **Dependências:** RF-001
- **Aceite:** Saída deve atualizar quantidade em tempo real

#### RF-003: Consulta de Estoque
- **Description:** Sistema deve permitir consulta de disponibilidade em tempo real
- **Prioridade:** Alta
- **Source:** PRD - Seção 2.3
- **Complexidade:** Baixa
- **Esforço Estimado:** 40 horas
- **Dependências:** RF-001, RF-002
- **Aceite:** Consulta deve mostrar quantidade disponível em tempo real

#### RF-004: Alertas de Estoque Baixo
- **Description:** Sistema deve gerar alertas quando estoque atinge nível mínimo
- **Prioridade:** Alta
- **Source:** PRD - Seção 2.4
- **Complexidade:** Alta
- **Esforço Estimado:** 60 horas
- **Dependências:** RF-001, RF-002, RF-003
- **Aceite:** Alertas devem ser enviadas por email e notificação

## 3. Requisitos Não Funcionais

### 3.1 Performance

#### RNF-001: Atualização em Tempo Real
- **Description:** Estoque deve ser atualizado em tempo real
- **Category:** Performance
- **Métrica:** Latência de atualização (milissegundos)
- **Valor Alvo:** < 500ms
- **Condições:** 1000 transações/hora
- **Aceite:** 99% das atualizações ocorrem no tempo alvo

### 3.2 Disponibilidade
- **Description:** Sistema deve estar disponível 99.9% do tempo
- **Category:** Disponibilidade
- **Métrica:** Tempo de atividade (percentual)
- **Valor Alvo:** 99.9%
- **Condições:** 24/7
- **Aceite:** Tempo de inatividade < 4 horas/mês

## Score de Validação: 82/100 ✅
```

---

## 📊 **Análise de Padrões**

### **🎯 Estrutura Comum de Requisitos**

#### **1. Formato SMART**
- **S**pecífico: Requisitos claros e sem ambiguidade
- **M**ensurável: Critérios objetivos de verificação
- **A**tingível: Realistas dentro do contexto
- **R**elevante: Alinhados com objetivos de negócio
- **T**emporais: Com prazo definido

#### **2. Categorização Clara**
- **RFs:** O que o sistema faz (funcionalidades)
- **RNFs:** Como o sistema deve ser (qualidade)
- **RNs:** Regras de negócio (lógica)
- **Restrições:** Limitações técnicas e de negócio

#### **3. Priorização MoSCoW**
- **M**ust Have: Essencial para MVP
- **S**hould Have:** Importante mas não essencial
- **C**ould Have:** Desejável mas não crítico
- **W**on't Have:** Fora do escopo

### **📊 Métricas de Qualidade**

#### **Score de Validação**
- **70-79 pontos:** Aceitável (revisões recomendadas)
- **80-89 pontos:** Bom (pequenos ajustes necessários)
- **90-100 pontos:** Excelente (pronto para implementação)

#### **Elementos Avaliados**
- **Completude:** Todos os campos obrigatórios preenchidos
- **Consistência:** Formato padrão mantido
- **Rastreabilidade:** Links funcionais corretos
- **Qualidade:** Requisitos SMART e testáveis

---

## 🎯 **Guia Rápido de Qualidade**

### **✅ Requisitos Bem Escritos**
- **Título claro:** "RF-001: Login de Usuário"
- **Descrição específica:** "Sistema deve autenticar usuários"
- **Prioridade definida:** Alta/Média/Baixa
- **Fonte identificada:** PRD-001, Seção 2.1
- **Aceite mensurável:** "Usuário deve conseguir fazer login"

### **❌ Requisitos Mal Escritos**
- **Título vago:** "RF-001: Sistema"
- **Descrição genérica:** "Sistema deve funcionar bem"
- **Prioridade indefinida**
- **Fonte desconhecida**
- **Aceite subjetivo:** "Sistema deve ser fácil de usar"

### **🔧 Dicas de Implementação**
1. **Comece pelo PRD** para entender o contexto
2. **Mapeie personas** para identificar requisitos
3. **Use templates** para garantir consistência
4. **Valide com stakeholders** antes de finalizar
5. **Mantenha a matriz** sempre atualizada

---

**Última atualização:** 2026-01-29  
**Baseado em:** 15+ projetos validados  
**Framework:** Maestro Skills Modernas  
**Status:** ✅ Produção Ready