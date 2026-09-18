import { describe, it, expect } from 'vitest';
import { baseTier } from './useEntitlement';

describe('baseTier', () => {
  it('strips billing variants, so annual and founding plans keep their tier', () => {
    expect(baseTier('agency')).toBe('agency');
    expect(baseTier('agency_annual')).toBe('agency');
    expect(baseTier('pro_founding')).toBe('pro');
    expect(baseTier('solo_annual')).toBe('solo');
  });

  it('treats anything else as free', () => {
    expect(baseTier(null)).toBe('free');
    expect(baseTier(undefined)).toBe('free');
    expect(baseTier('')).toBe('free');
    expect(baseTier('agencyplus')).toBe('free');
    expect(baseTier('ltd_agency')).toBe('free');
  });
});
