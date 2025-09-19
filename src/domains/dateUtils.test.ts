import { isDateISO } from './dateUtils';

describe('isDateISO', () => {
  it('should return true for valid ISO date', () => {
    expect(isDateISO('2025-09-18')).toBe(true);
    expect(isDateISO('2025-01-01')).toBe(true);
  });

  it('should return false for invalid date', () => {
    expect(isDateISO('2025-13-01')).toBe(false);
    expect(isDateISO('2025-09-31')).toBe(false);
    expect(isDateISO('18-09-2025')).toBe(false);
    expect(isDateISO('')).toBe(false);
  });
});
