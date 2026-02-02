# Checklist de Validação - Desenvolvimento Backend

**Score Mínimo:** 75/100 pontos

---

## Arquitetura (25 pontos)

- [ ] **[10 pts]** Clean Architecture implementada
- [ ] **[8 pts]** SOLID principles seguidos
- [ ] **[7 pts]** Dependency Injection configurada

## Implementação (30 pontos)

- [ ] **[10 pts]** Endpoints conforme contrato
- [ ] **[8 pts]** Lógica de negócio implementada
- [ ] **[7 pts]** Validação de entrada (DTOs)
- [ ] **[5 pts]** Error handling robusto

## Frontend-First (Obrigatório)

- [ ] **Contrato API validado** - CONT-XXX aprovado antes do BE
- [ ] **Mocks existentes** - handlers/servidor mock gerados do contrato

## Testes (25 pontos)

- [ ] **[10 pts]** Testes unitários (>80% coverage)
- [ ] **[8 pts]** Testes de integração passando
- [ ] **[7 pts]** Edge cases cobertos

## Segurança (20 pontos)

- [ ] **[6 pts]** Autenticação implementada
- [ ] **[5 pts]** Autorização por roles
- [ ] **[5 pts]** Sanitização de entrada
- [ ] **[4 pts]** SQL injection prevenido

---

**Thresholds:**
- **>= 85:** ✅ Excelente
- **75-84:** ✅ Bom
- **70-74:** ⚠️ Aceitável
- **< 70:** ❌ Bloqueado
