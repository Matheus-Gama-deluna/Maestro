---
description: Workflow para mapear a estrutura do projeto e manter o Knowledge Graph atualizado
---

# 🗺️ Workflow de Mapeamento - /atualizar-mapa

> Mantenha o arquivo `.maestro/mapa.md` atualizado para que a IA tenha "consciência situacional" do projeto sem precisar escanear todos os arquivos repetidamente.

## 1. Escaneamento do Projeto

*   **Ação:** Liste arquivos e pastas principais em `src/`, `docs/`, `tests/` (ignore `node_modules`, `dist`).
*   **Ação:** Identifique componentes chave:
    *   **Entidades:** Estruturas de dados, Models, Schemas.
    *   **Endpoints:** Rotas de API (Controllers, Routes).
    *   **Serviços:** Lógica de negócio.
    *   **Frontend:** Páginas e Componentes reutilizáveis.

## 2. Atualização do Mapa

*   **Ação:** Crie ou Reescreva `.maestro/mapa.md` com o seguinte formato:

```markdown
# 🗺️ Mapa do Projeto

## 🏗️ Estrutura de Pastas
- `src/`
  - `controllers/` - Controladores da API
  - `models/` - Entidades do Banco
  ...

## 📦 Entidades de Domínio
| Entidade | Arquivo Principal | Descrição |
| :--- | :--- | :--- |
| `Usuario` | `src/models/User.ts` | Dados de acesso e perfil |
...

## 🔌 Endpoints de API
| Método | Rota | Controller |
| :--- | :--- | :--- |
| `GET` | `/users` | `UserController.list` |
...

## 🧩 Componentes Chave (Frontend)
- `Button` (`src/components/ui/Button.tsx`)
...

## 📚 Dependências Externas (Principais)
- `express` (Web Framework)
- `typeorm` (Database)
...
```

## 3. Conclusão

*   **Ação:** Informe ao usuário que o mapa foi atualizado.
*   **Dica:** Sugira usar isso antes de grandes refatorações ou onboardings.
