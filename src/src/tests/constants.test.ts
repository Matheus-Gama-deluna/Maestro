// src/src/tests/constants.test.ts
import { describe, it, expect } from 'vitest';
import { MAESTRO_VERSION } from '../constants.js';

describe('constants', () => {
    it('MAESTRO_VERSION deve ser "8.0.0"', () => {
        expect(MAESTRO_VERSION).toBe('8.0.0');
    });

    it('MAESTRO_VERSION deve seguir formato semver X.Y.Z', () => {
        expect(MAESTRO_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
});
