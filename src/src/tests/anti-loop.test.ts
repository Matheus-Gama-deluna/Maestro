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
