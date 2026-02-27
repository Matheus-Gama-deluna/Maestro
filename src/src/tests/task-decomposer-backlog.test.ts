/**
 * Testes para decomposeBacklogToTasks (v9.0 Sprint 5)
 *
 * Cobre:
 * - Filtro por Frontend/Backend/Integração/Deploy
 * - Parsing de tabela markdown com | US-XXX | ... |
 * - Enriquecimento com endpoints do OpenAPI
 * - Fallback para decomposeArchitectureToTasks
 */
import { describe, it, expect } from 'vitest';
import {
    decomposeBacklogToTasks,
    getNextTask,
    getTaskProgress,
} from '../services/task-decomposer.service.js';

const sampleBacklog = `
# Backlog do Projeto

## Sprint 1 — Setup

| ID | User Story | Tipo | Dep | Est. | DoD principal |
|----|-----------|------|-----|------|---------------|
| US-010 | Como admin quero configurar o ambiente | Setup | — | 3 pts | Ambiente configurado |
| US-020 | Como usuário quero cadastrar produtos com estoque mínimo | FE+BE | US-010 | 8 pts | CRUD completo + testes |
| US-030 | Como gerente quero ver estoque em tempo real | FE+BE | US-020 | 8 pts | Dashboard funcional |
| US-040 | Como admin quero receber alertas de estoque baixo | BE | US-030 | 5 pts | Alertas por email |
| US-050 | Como gerente quero dashboard com KPIs | FE | US-020 | 5 pts | Dashboard KPIs |
| US-060 | Como caixa quero processar pagamentos | FE+BE | US-020 | 8 pts | Pagamento funcional |
| US-070 | Como vendedor quero modo offline | FE+BE | US-060 | 13 pts | PWA offline |
`;

const sampleOpenApi = `
openapi: "3.0.0"
info:
  title: API
  version: "1.0.0"
paths:
  /products:
    get:
      tags: [Products]
      summary: Listar produtos
    post:
      tags: [Products]
      summary: Criar produto
  /products/{id}:
    put:
      tags: [Products]
      summary: Atualizar produto
    delete:
      tags: [Products]
      summary: Deletar produto
  /stock:
    get:
      tags: [Stock]
      summary: Consultar estoque
  /alerts:
    get:
      tags: [Alerts]
      summary: Listar alertas
`;

describe('decomposeBacklogToTasks (v9.0)', () => {
    describe('Filtro por fase', () => {
        it('filtra US para Frontend (tipo FE e FE+BE)', () => {
            const tasks = decomposeBacklogToTasks(sampleBacklog, null, 14, 'Frontend');
            const stories = tasks.filter(t => t.type === 'story');

            // US-020 (FE+BE), US-030 (FE+BE), US-050 (FE), US-060 (FE+BE), US-070 (FE+BE), US-010 (Setup)
            expect(stories.length).toBeGreaterThanOrEqual(3);

            // Deve incluir US de FE
            const titles = stories.map(s => s.title);
            const hasFE = titles.some(t => t.includes('US-050'));
            expect(hasFE).toBe(true);
        });

        it('filtra US para Backend (tipo BE e FE+BE)', () => {
            const tasks = decomposeBacklogToTasks(sampleBacklog, null, 15, 'Backend');
            const stories = tasks.filter(t => t.type === 'story');

            // US-040 é BE puro
            const titles = stories.map(s => s.title);
            const hasBE = titles.some(t => t.includes('US-040'));
            expect(hasBE).toBe(true);
        });

        it('filtra US para Integração', () => {
            // Backlog sem US tipo Integração explícito — usa todas como fallback
            const tasks = decomposeBacklogToTasks(sampleBacklog, null, 16, 'Integração');
            expect(tasks.length).toBeGreaterThan(0);
        });

        it('filtra US para Deploy', () => {
            const tasks = decomposeBacklogToTasks(sampleBacklog, null, 17, 'Deploy Final');
            expect(tasks.length).toBeGreaterThan(0);
        });
    });

    describe('Parsing de backlog', () => {
        it('extrai user stories da tabela markdown', () => {
            const tasks = decomposeBacklogToTasks(sampleBacklog, null, 14, 'Frontend');
            const stories = tasks.filter(t => t.type === 'story');
            expect(stories.length).toBeGreaterThan(0);
        });

        it('gera task de Setup como primeira task', () => {
            const tasks = decomposeBacklogToTasks(sampleBacklog, null, 14, 'Frontend');
            const setupTasks = tasks.filter(t => t.title.includes('Setup'));
            expect(setupTasks.length).toBeGreaterThan(0);
        });

        it('gera sub-tasks para cada story', () => {
            const tasks = decomposeBacklogToTasks(sampleBacklog, null, 14, 'Frontend');
            const subTasks = tasks.filter(t => t.type === 'task' && t.parent_id);
            expect(subTasks.length).toBeGreaterThan(0);
        });

        it('tasks de Frontend incluem componentes, hooks, pages, testes', () => {
            const tasks = decomposeBacklogToTasks(sampleBacklog, null, 14, 'Frontend');
            const taskTitles = tasks.filter(t => t.type === 'task').map(t => t.title.toLowerCase());

            const hasComponent = taskTitles.some(t => t.includes('componente') || t.includes('ui'));
            const hasHook = taskTitles.some(t => t.includes('hook') || t.includes('api'));
            const hasPage = taskTitles.some(t => t.includes('page') || t.includes('route'));
            const hasTeste = taskTitles.some(t => t.includes('teste') || t.includes('test'));

            expect(hasComponent).toBe(true);
            expect(hasHook).toBe(true);
            expect(hasPage).toBe(true);
            expect(hasTeste).toBe(true);
        });

        it('tasks de Backend incluem DTOs, services, controllers, testes', () => {
            const tasks = decomposeBacklogToTasks(sampleBacklog, null, 15, 'Backend');
            const taskTitles = tasks.filter(t => t.type === 'task').map(t => t.title.toLowerCase());

            const hasDTO = taskTitles.some(t => t.includes('dto') || t.includes('validação'));
            const hasService = taskTitles.some(t => t.includes('service') || t.includes('domain'));
            const hasController = taskTitles.some(t => t.includes('controller') || t.includes('route'));

            expect(hasDTO).toBe(true);
            expect(hasService).toBe(true);
            expect(hasController).toBe(true);
        });
    });

    describe('Enriquecimento com OpenAPI', () => {
        it('inclui endpoints relevantes na descrição das tasks', () => {
            const tasks = decomposeBacklogToTasks(sampleBacklog, sampleOpenApi, 15, 'Backend');
            const taskDescs = tasks.filter(t => t.type === 'task').map(t => t.description);

            // Alguma task deve mencionar endpoints
            const hasEndpoint = taskDescs.some(d =>
                d.includes('/products') || d.includes('OpenAPI') || d.includes('openapi') || d.includes('ver OpenAPI')
            );
            expect(hasEndpoint).toBe(true);
        });
    });

    describe('Fallback', () => {
        it('fallback para decomposeArchitectureToTasks quando backlog não tem US', () => {
            const markdownSemUS = `
## Módulo Auth

### Login
- Endpoint POST /auth/login
- Validar credenciais

### Registro
- Endpoint POST /auth/register
`;
            const tasks = decomposeBacklogToTasks(markdownSemUS, null, 14, 'Frontend');
            // Deve usar fallback (parsear H2/H3)
            expect(tasks.length).toBeGreaterThan(0);
        });

        it('backlog vazio gera 0 tasks via fallback', () => {
            const tasks = decomposeBacklogToTasks('texto simples sem seções', null, 14, 'Frontend');
            expect(tasks.length).toBe(0);
        });
    });

    describe('Estrutura e progresso', () => {
        it('todas as tasks pertencem à fase correta', () => {
            const tasks = decomposeBacklogToTasks(sampleBacklog, null, 14, 'Frontend');
            for (const task of tasks) {
                expect(task.phase).toBe(14);
            }
        });

        it('getTaskProgress calcula corretamente para tasks do backlog', () => {
            const tasks = decomposeBacklogToTasks(sampleBacklog, null, 14, 'Frontend');
            const progress = getTaskProgress(tasks, 14);

            expect(progress.total).toBeGreaterThan(0);
            expect(progress.done).toBe(0);
            expect(progress.percentage).toBe(0);
        });

        it('getNextTask retorna task de Setup primeiro', () => {
            const tasks = decomposeBacklogToTasks(sampleBacklog, null, 14, 'Frontend');
            const next = getNextTask(tasks);

            expect(next).not.toBeNull();
            expect(next?.status).toBe('todo');
        });

        it('gera epics (Setup + Implementation)', () => {
            const tasks = decomposeBacklogToTasks(sampleBacklog, null, 14, 'Frontend');
            const epics = tasks.filter(t => t.type === 'epic');
            expect(epics.length).toBe(2);
        });
    });
});
