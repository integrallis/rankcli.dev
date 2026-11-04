import { describe, it, expect } from 'vitest';
import { referralLink } from './ReferralCard';

describe('the referral link', () => {
  it('points at the homepage with the code as ref', () => {
    expect(referralLink('a1b2c3d4')).toBe('https://rankcli.dev/?ref=a1b2c3d4');
  });
});
