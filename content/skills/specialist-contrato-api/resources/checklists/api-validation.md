# Checklist de Validação - Contrato de API

**Score Mínimo:** 75/100 pontos

---

## Schema OpenAPI (30 pontos)

- [ ] **[10 pts]** OpenAPI 3.0 válido (sem erros de lint)
- [ ] **[8 pts]** Todos os endpoints documentados
- [ ] **[6 pts]** Request/Response schemas definidos
- [ ] **[4 pts]** Códigos de erro (400, 401, 404, 500)
- [ ] **[2 pts]** Versionamento semântico

## Types e DTOs (25 pontos)

- [ ] **[10 pts]** Types TypeScript gerados sem erros
- [ ] **[8 pts]** DTOs backend com validações
- [ ] **[7 pts]** Enums e interfaces reutilizáveis

## Mocks (20 pontos)

- [ ] **[8 pts]** Mock server configurado
- [ ] **[7 pts]** Dados de exemplo realistas
- [ ] **[5 pts]** Response time < 100ms

## Documentação (15 pontos)

- [ ] **[8 pts]** Swagger UI funcionando
- [ ] **[4 pts]** Exemplos de uso
- [ ] **[3 pts]** Guia de versionamento

## Backward Compatibility (10 pontos)

- [ ] **[6 pts]** Breaking changes documentados
- [ ] **[4 pts]** Estratégia de migração definida

---

**Thresholds:**
- **>= 85:** ✅ Excelente
- **75-84:** ✅ Bom
- **70-74:** ⚠️ Aceitável (aprovação manual)
- **< 70:** ❌ Bloqueado
