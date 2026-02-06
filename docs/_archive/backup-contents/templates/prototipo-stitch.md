# Template: Registro de Protótipos Stitch

## Metadados
| Campo | Valor |
|-------|-------|
| Projeto | [NOME DO PROJETO] |
| Data | [DATA] |
| Responsável | [NOME] |
| Status | 🔄 Em progresso / ✅ Validado / ❌ Descartado |

---

## Protótipos Criados

### Tela 1: [Nome da Tela]

**Prompt Usado:**
```
[Cole o prompt que usou no Stitch]
```

**Resultado:**
- [ ] Gerado com sucesso
- [ ] Aprovado por stakeholders
- [ ] Código exportado

**Iterações:**
| Versão | Mudança | Resultado |
|--------|---------|-----------|
| v1 | Prompt inicial | [OK/Ajustar] |
| v2 | [Ajuste feito] | [OK/Ajustar] |

**Código Exportado:** `docs/03-ux/stitch-output/tela-1.html`

**Observações:**
- [Notas sobre o que funcionou/não funcionou]
- [Decisões tomadas]

---

### Tela 2: [Nome da Tela]

**Prompt Usado:**
```
[Cole o prompt que usou no Stitch]
```

**Resultado:**
- [ ] Gerado com sucesso
- [ ] Aprovado por stakeholders
- [ ] Código exportado

**Código Exportado:** `docs/03-ux/stitch-output/tela-2.html`

**Observações:**
- [Notas]

---

## Componentes Identificados

Após análise dos protótipos, os seguintes componentes reutilizáveis foram identificados:

| Componente | Aparece Em | Prioridade |
|------------|------------|------------|
| Navbar | Todas as telas | Alta |
| Card | Dashboard, Listagem | Alta |
| Button | Todas as telas | Alta |
| Form Input | Cadastro, Edição | Alta |
| [Outros] | [Telas] | [Alta/Média/Baixa] |

---

## Mapeamento UI → Domínio

| Elemento de UI | Entidade/Campo | Requisito |
|----------------|----------------|-----------|
| Campo "Nome" | Cliente.nome | RF001 |
| Card de agendamento | Agendamento | RF003 |
| [Outros] | [Entidade.campo] | [RFxxx] |

---

## Decisões de Design

### Tema Visual
- **Modo:** Light / Dark
- **Cor primária:** #[HEX]
- **Cor secundária:** #[HEX]
- **Fonte:** [Nome da fonte]

### Padrões de UI
- Cards com sombra sutil e bordas arredondadas
- Botões com hover state
- [Outros padrões observados]

---

## Próximos Passos

- [ ] Exportar todos os códigos para `docs/03-ux/stitch-output/`
- [ ] Exportar assets para `docs/03-ux/stitch-output/assets/`
- [ ] Analisar código com IA para extrair componentes
- [ ] Atualizar CONTEXTO.md com decisões visuais
- [ ] Prosseguir para Modelagem de Domínio

---

## Arquivos Relacionados

- Design Doc (base para prompts): `docs/03-ux/design-doc.md`
- Prompts usados: `docs/03-ux/stitch-prompts.md`
- Código exportado: `docs/03-ux/stitch-output/`

---

## 🔗 Integração com Frontend

### Para Desenvolvimento Frontend

Os arquivos exportados serão usados na fase de Frontend:

| Arquivo | Destino Sugerido | Tipo |
|---------|------------------|------|
| `*.html` | `src/components/` | Referência estrutural |
| `assets/*.png` | `public/images/` | Assets estáticos |
| `assets/*.svg` | `src/assets/icons/` | Ícones vetoriais |

### Instruções para o Desenvolvedor Frontend

Na fase de Frontend, a IA deve:

1. **Verificar** se existe `docs/03-ux/stitch-output/`
2. **Ler todos os HTML** exportados
3. **Extrair componentes** identificados neste documento
4. **Copiar assets** para a estrutura correta do projeto
5. **Adaptar markup** para a stack definida (React, Vue, etc.)

