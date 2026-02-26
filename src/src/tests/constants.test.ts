// src/src/tests/constants.test.ts
import { describe, it, expect } from 'vitest';
import { MAESTRO_VERSION } from '../constants.js';

describe('constants', () => {
    it('MAESTRO_VERSION deve ser "5.5.3"', () => {
        expect(MAESTRO_VERSION).toBe('5.5.3');
    });

    it('MAESTRO_VERSION deve seguir formato semver X.Y.Z', () => {
        expect(MAESTRO_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
});
