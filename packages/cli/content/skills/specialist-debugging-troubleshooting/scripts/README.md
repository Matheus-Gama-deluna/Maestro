# Scripts MCP de Referência - Debugging e Troubleshooting

Este diretório contém **funções de referência** para implementação no MCP.

> **IMPORTANTE**: Estes scripts são **APENAS REFERÊNCIA** e **NÃO SÃO EXECUTÁVEIS** localmente.
> Toda a lógica deve ser implementada no MCP externo.

## 📋 Funções Disponíveis

### 1. `init_debugging.py`
Inicializa bug report estruturado com template padrão.

**Responsabilidade do MCP:**
- Criar diretório `docs/bugs/`
- Gerar bug report a partir do template
- Salvar arquivo `docs/bugs/BUG-XXX.md`
- Retornar caminho do arquivo criado

### 2. `validate_fix.py`
Valida qualidade do processo de debugging.

**Responsabilidade do MCP:**
- Ler bug report
- Aplicar checklist de validação (100 pontos)
- Calcular score por fase (Reproduce, Isolate, Understand, Fix)
- Gerar feedback detalhado
- Retornar score e status

### 3. `process_postmortem.py`
Processa post-mortem e lessons learned.

**Responsabilidade do MCP:**
- Ler bug report validado
- Gerar post-mortem a partir do template
- Extrair lessons learned
- Criar action items
- Salvar documentação completa

## 🔧 Implementação no MCP

Consulte `MCP_INTEGRATION.md` para detalhes completos de implementação.

### Exemplo de Chamada
```python
# No MCP
result = await mcp.call_function("initialize_bug_report", {
    "bug_id": "BUG-001",
    "severity": "alta",
    "description": "Login falha com erro 401"
})
```

## 📚 Documentação

- **Guia de Integração:** `../MCP_INTEGRATION.md`
- **Templates:** `../resources/templates/`
- **Exemplos:** `../resources/examples/`
- **Validação:** `../resources/checklists/`

---

**Versão:** 1.0  
**Status:** Referência (Não Executável)  
**Implementação:** MCP Externo
