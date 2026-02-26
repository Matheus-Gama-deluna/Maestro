// src/src/tests/anti-loop.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

describe('Anti-loop por diretório', () => {
    const MAX = 3;
    let loopStates: Map<string, { hash: string; count: number }>;

    function checkAntiLoop(dir: string, hash: string): boolean {
        const state = loopStates.get(dir) || { hash: '', count: 0 };
        if (state.hash === hash) {
            state.count++;
            if (state.count >= MAX) {
                loopStates.delete(dir);
                return true;
            }
        } else {
            state.hash = hash;
            state.count = 1;
        }
        loopStates.set(dir, state);
        return false;
    }

    beforeEach(() => {
        loopStates = new Map();
    });

    it('detecta loop após 3 chamadas idênticas no mesmo diretório', () => {
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(false); // 1ª
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(false); // 2ª
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(true);  // 3ª → LOOP
    });

    it('NÃO detecta loop entre diretórios diferentes', () => {
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(false);
        expect(checkAntiLoop('/projeto-b', 'hash1')).toBe(false);
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(false); // 2ª no A
        expect(checkAntiLoop('/projeto-b', 'hash1')).toBe(false); // 2ª no B
    });

    it('reseta contador quando hash muda', () => {
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(false);
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(false);
        expect(checkAntiLoop('/projeto-a', 'hash2')).toBe(false); // hash mudou → reset
        expect(checkAntiLoop('/projeto-a', 'hash2')).toBe(false); // 2ª do hash2
        expect(checkAntiLoop('/projeto-a', 'hash2')).toBe(true);  // 3ª do hash2 → LOOP
    });

    it('remove entrada do map após detectar loop (reset automático)', () => {
        checkAntiLoop('/projeto-a', 'hash1');
        checkAntiLoop('/projeto-a', 'hash1');
        checkAntiLoop('/projeto-a', 'hash1'); // LOOP detectado → remove entrada
        expect(loopStates.has('/projeto-a')).toBe(false);
    });

    it('permite nova sequência após loop ser detectado e resetado', () => {
        // Aciona loop
        checkAntiLoop('/projeto-a', 'hash1');
        checkAntiLoop('/projeto-a', 'hash1');
        checkAntiLoop('/projeto-a', 'hash1'); // LOOP — reseta
        // Nova sequência deve funcionar normalmente
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(false); // reinicia contagem
        expect(checkAntiLoop('/projeto-a', 'hash1')).toBe(false);
    });
});

// Regressão: entregáveis com conteúdos diferentes NÃO devem disparar loop
// Bug original: computeCallHash usava !!entregavel (bool), então 3 entregáveis
// diferentes todos com conteúdo eram tratados como chamada idêntica.
describe('computeCallHash — entregáveis com conteúdo diferente', () => {
    function simularHash(entregavelLen: number, snippet: string, fase: number, aguardando: boolean): string {
        const key = `${fase}|false|${aguardando}|${aguardando}|ativo|none|${entregavelLen}|${snippet}|{}`;
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            const chr = key.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return String(hash);
    }

    it('entregáveis com tamanhos diferentes geram hashes diferentes', () => {
        const h1 = simularHash(500, '# Arquitetura\n\nConteudo curto', 6, true);
        const h2 = simularHash(5000, '# Arquitetura\n\nConteudo muito mais longo com detalhes extras', 6, true);
        expect(h1).not.toBe(h2);
    });

    it('entregáveis com mesmo tamanho mas início diferente geram hashes diferentes', () => {
        const snippet1 = '# Arquitetura v1 - primeira versão do documento';
        const snippet2 = '# Arquitetura v2 - segunda versão com mais seções';
        const h1 = simularHash(1000, snippet1, 6, true);
        const h2 = simularHash(1000, snippet2, 6, true);
        expect(h1).not.toBe(h2);
    });

    it('mesmo estado sem entregável gera hash igual (loop legítimo)', () => {
        const h1 = simularHash(0, '', 6, true);
        const h2 = simularHash(0, '', 6, true);
        expect(h1).toBe(h2);
    });
});
