import { defaultTimestamp } from './base.entity';

describe('base.entity.spec.ts', () => {
  it('return defaultTimestamp', () => {
    expect(defaultTimestamp()).toBe('CURRENT_TIMESTAMP');
  });
});
