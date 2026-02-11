/**
 * Retorna perguntas técnicas que o especialista deve fazer no início de sua fase
 * Sprint 2: Distribuir perguntas técnicas aos especialistas
 */
function getSpecialistQuestions(fase: number, nivel: string): string {
    if (fase === 2) {
        // Especialista de Requisitos
        return `
## 📋 Coleta de Requisitos Técnicos

Como Especialista de Requisitos, preciso entender alguns aspectos técnicos para criar um documento completo:

### 1. Volume e Escala
- Quantos usuários simultâneos você espera?
- Quantas transações/operações por dia?
- Crescimento esperado nos próximos 6 meses?

### 2. Integrações Externas
- Precisa integrar com quais sistemas/APIs?
- Exemplos: pagamento (Stripe, PagSeguro), email (SendGrid), SMS, etc.
- Autenticação social? (Google, Facebook, etc.)

### 3. Segurança e Compliance
- Precisa seguir LGPD? (dados de brasileiros)
- Dados sensíveis? (cartão, saúde, financeiro)
- Outros requisitos? (PCI-DSS, HIPAA, SOC2)

### 4. Performance
- Tempo de resposta esperado? (ex: < 200ms)
- Disponibilidade necessária? (ex: 99.9%)
- Horários de pico de uso?

> 💡 Responda de forma natural, não precisa seguir a ordem exata. Após suas respostas, vou criar o documento de requisitos.
`;
    }

    if (fase === 4) {
        // Especialista de Arquitetura
        return `
## 🏗️ Decisões de Arquitetura

Como Especialista de Arquitetura, preciso entender suas preferências e restrições:

### 1. Stack Tecnológica
- **Frontend:** Tem preferência? (React, Vue, Angular, Next.js)
- **Backend:** Qual linguagem/framework? (Node.js, Python, PHP, Java)
- **Database:** Qual banco de dados? (PostgreSQL, MySQL, MongoDB)
- Alguma restrição ou tecnologia que o time já domina?

### 2. Time e Infraestrutura
- Quem vai desenvolver? (senioridade: júnior, pleno, sênior)
- Onde vai hospedar? (AWS, Azure, Vercel, Heroku, VPS)
- Orçamento mensal de infraestrutura?

### 3. Padrões Arquiteturais
- Monolito ou microserviços?
- Multi-tenant necessário?
- Precisa de cache? CDN?

> 💡 Se não tiver preferência, posso sugerir a melhor stack baseado nos requisitos já definidos.
`;
    }

    return '';
}
