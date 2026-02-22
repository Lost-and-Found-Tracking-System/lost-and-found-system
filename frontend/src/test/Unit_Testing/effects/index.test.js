import { describe, it, expect } from 'vitest';
import * as Effects from '../../../effects';
import * as PremiumEffects from '../../../effects/PremiumEffects';
import * as AdvancedEffects from '../../../effects/AdvancedEffects';

describe('Effects Index', () => {
    it('exports all PremiumEffects', () => {
        Object.keys(PremiumEffects).forEach(key => {
            if (key !== 'default') {
                expect(Effects[key]).toBeDefined();
            }
        });
    });

    it('exports all AdvancedEffects', () => {
        Object.keys(AdvancedEffects).forEach(key => {
            if (key !== 'default') {
                expect(Effects[key]).toBeDefined();
            }
        });
    });
});
