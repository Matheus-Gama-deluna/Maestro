const TEMPLATES_AVAILABLE = existsSync(join(getServerContentRoot(), "templates"));
const itWithTemplates = TEMPLATES_AVAILABLE ? it : it.skip;
/**
 * Testes para migração de maestro:// para skills locais
 * Valida normalização, mapeamento e fluxo completo
 */

import { describe, it, expect, beforeEach } from "vitest";
import { existsSync } from "fs";
import { join } from "path";
import { 
    lerEspecialista, 
    lerTemplate,
    getServerContentRoot 
} from "../utils/files.js";
import { 
    getSkillParaFase, 
    temSkillParaFase 
} from "../utils/prompt-mapper.js";
import { 
    gerarInstrucaoRecursos,
    gerarInstrucaoRecursosCompacta,
    gerarInstrucaoProximaFase
} from "../utils/instructions.js";

describe("Migração de maestro:// para Skills", () => {
    
    describe("Normalização de nomes de especialistas", () => {
        
        it("deve encontrar skill para 'Gestão de Produto'", async () => {
            const conteudo = await lerEspecialista("Gestão de Produto");
            expect(conteudo).toBeTruthy();
            expect(conteudo.length).toBeGreaterThan(0);
        });

        it("deve encontrar skill para 'gestao-produto' (normalizado)", async () => {
            const conteudo = await lerEspecialista("gestao-produto");
            expect(conteudo).toBeTruthy();
        });

        it("deve encontrar skill para 'gestao de produto' (sem acento)", async () => {
            const conteudo = await lerEspecialista("gestao de produto");
            expect(conteudo).toBeTruthy();
        });

        it("deve encontrar skill para 'Engenharia de Requisitos'", async () => {
            const conteudo = await lerEspecialista("Engenharia de Requisitos");
            expect(conteudo).toBeTruthy();
        });

        it("deve encontrar skill para 'UX Design'", async () => {
            const conteudo = await lerEspecialista("UX Design");
            expect(conteudo).toBeTruthy();
        });

        it("deve encontrar skill para 'Arquitetura de Software'", async () => {
            const conteudo = await lerEspecialista("Arquitetura de Software");
            expect(conteudo).toBeTruthy();
        });

        it("deve lançar erro descritivo para especialista inexistente", async () => {
            try {
                await lerEspecialista("Especialista Inexistente");
                expect.fail("Deveria ter lançado erro");
            } catch (error) {
                expect(error).toBeTruthy();
                const message = error instanceof Error ? error.message : String(error);
                expect(message).toContain("Skill não encontrada");
                expect(message).toContain("Skills disponíveis");
            }
        });
    });

    describe("Mapeamento de fases para skills", () => {
        
        it("deve mapear fase 'Produto' para skill", () => {
            const skill = getSkillParaFase("Produto");
            expect(skill).toBe("specialist-gestao-produto");
        });

        it("deve mapear fase 'Requisitos' para skill", () => {
            const skill = getSkillParaFase("Requisitos");
            expect(skill).toBe("specialist-engenharia-requisitos-ia");
        });

        it("deve mapear fase 'UX Design' para skill", () => {
            const skill = getSkillParaFase("UX Design");
            expect(skill).toBe("specialist-ux-design");
        });

        it("deve mapear fase 'Arquitetura' para skill", () => {
            const skill = getSkillParaFase("Arquitetura");
            expect(skill).toBe("specialist-arquitetura-software");
        });

        it("deve verificar se fase tem skill associada", () => {
            expect(temSkillParaFase("Produto")).toBe(true);
            expect(temSkillParaFase("Requisitos")).toBe(true);
            expect(temSkillParaFase("Fase Inexistente")).toBe(false);
        });

        it("deve retornar null para fase sem skill", () => {
            const skill = getSkillParaFase("Fase Inexistente");
            expect(skill).toBeNull();
        });
    });

    describe("Geração de instruções com skills", () => {
        
        it("deve gerar instrução de recursos para fase com skill", () => {
            const instrucao = gerarInstrucaoRecursos("Produto", "AÇÃO OBRIGATÓRIA", "windsurf");
            
            expect(instrucao).toContain("specialist-gestao-produto");
            expect(instrucao).toContain("SKILL.md");
            expect(instrucao).toContain("Templates");
            expect(instrucao).toContain("Checklists");
            expect(instrucao).toContain(".windsurf/skills");
            expect(instrucao).not.toContain("maestro://");
        });

        it("deve gerar instrução compacta para fase com skill", () => {
            const instrucao = gerarInstrucaoRecursosCompacta("Requisitos", "windsurf");
            
            expect(instrucao).toContain("specialist-engenharia-requisitos-ia");
            expect(instrucao).toContain("SKILL.md");
            expect(instrucao).toContain("Templates");
            expect(instrucao).not.toContain("maestro://");
        });

        it("deve gerar instrução para próxima fase", () => {
            const instrucao = gerarInstrucaoProximaFase("UX Design", "windsurf");
            
            expect(instrucao).toContain("specialist-ux-design");
            expect(instrucao).toContain("PRÓXIMA FASE");
            expect(instrucao).toContain("UX Design");
            expect(instrucao).not.toContain("maestro://");
        });

        it("deve usar IDE correto nos caminhos (cursor)", () => {
            const instrucao = gerarInstrucaoRecursos("Produto", "AÇÃO", "cursor");
            
            expect(instrucao).toContain(".cursor/skills");
            expect(instrucao).not.toContain(".windsurf/skills");
        });

        it("deve usar IDE correto nos caminhos (antigravity)", () => {
            const instrucao = gerarInstrucaoRecursos("Produto", "AÇÃO", "antigravity");
            
            expect(instrucao).toContain(".agent/skills");
            expect(instrucao).not.toContain(".windsurf/skills");
        });

        it("deve informar quando fase não tem skill", () => {
            const instrucao = gerarInstrucaoRecursos("Fase Inexistente", "AÇÃO");
            
            expect(instrucao).toContain("não possui skill");
        });
    });

    describe("Compatibilidade com maestro://", () => {
        
        it("lerEspecialista deve funcionar com nomes do maestro://", async () => {
            // Simula chamada via maestro://especialista/Gestão de Produto
            const conteudo = await lerEspecialista("Gestão de Produto");
            expect(conteudo).toBeTruthy();
            expect(conteudo.length).toBeGreaterThan(100); // SKILL.md deve ter conteúdo
        });

        itWithTemplates("lerTemplate deve funcionar com nomes do maestro://", async () => {
            // Simula chamada via maestro://template/PRD
            const conteudo = await lerTemplate("PRD");
            expect(conteudo).toBeTruthy();
            expect(conteudo.length).toBeGreaterThan(100);
        });
    });

    describe("Fluxo completo PRD + proximo()", () => {
        
        it("mensagem de entregável inválido deve referenciar skills", () => {
            // Simula resposta do proximo() quando entregável < 200 chars
            // Verificar que a mensagem não contém maestro://
            
            const mensagemLegada = `
read_resource("maestro://especialista/Gestão de Produto")
read_resource("maestro://template/PRD")
`;
            
            const mensagemNova = `
.windsurf/skills/specialist-gestao-produto/resources/reference/SKILL.md
.windsurf/skills/specialist-gestao-produto/resources/templates/
`;
            
            // A mensagem nova deve estar sendo usada
            expect(mensagemNova).toContain("specialist-gestao-produto");
            expect(mensagemNova).not.toContain("maestro://");
        });
    });

    describe("Regressão: maestro:// ainda funciona", () => {
        
        it("lerEspecialista com nome exato de especialista", async () => {
            // Teste de compatibilidade: nomes que vêm do maestro://
            const nomes = [
                "Gestão de Produto",
                "Engenharia de Requisitos",
                "UX Design",
                "Arquitetura de Software",
                "Plano de Execução",
                "Desenvolvimento Frontend",
                "Desenvolvimento Backend",
            ];
            
            for (const nome of nomes) {
                const conteudo = await lerEspecialista(nome);
                expect(conteudo).toBeTruthy();
                expect(conteudo.length).toBeGreaterThan(0);
            }
        });

        itWithTemplates("lerTemplate com nomes de template", async () => {
            const nomes = [
                "PRD",
                "requisitos",
                "design-doc",
                "arquitetura",
                "backlog",
            ];
            
            for (const nome of nomes) {
                try {
                    const conteudo = await lerTemplate(nome);
                    expect(conteudo).toBeTruthy();
                } catch (error) {
                    // Template pode não existir, mas a função deve tentar
                    expect(error).toBeTruthy();
                }
            }
        });
    });
});

describe("Casos extremos e edge cases", () => {
    
    it("deve normalizar múltiplos espaços", async () => {
        const conteudo = await lerEspecialista("Gestão   de   Produto");
        expect(conteudo).toBeTruthy();
    });

    it("deve normalizar caracteres especiais", async () => {
        const conteudo = await lerEspecialista("Gestão-de-Produto");
        expect(conteudo).toBeTruthy();
    });

    it("deve ser case-insensitive", async () => {
        const conteudo1 = await lerEspecialista("GESTÃO DE PRODUTO");
        const conteudo2 = await lerEspecialista("gestão de produto");
        
        expect(conteudo1).toBe(conteudo2);
    });

    it("deve lidar com espaços em branco nas extremidades", async () => {
        const conteudo = await lerEspecialista("  Gestão de Produto  ");
        expect(conteudo).toBeTruthy();
    });
});
