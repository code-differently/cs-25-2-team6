import { Timeframe } from './Timeframe';

describe('Timeframe', () => {
  it('should contain all required timeframe values', () => {
    expect(Timeframe.DAILY).toBe('DAILY');
    expect(Timeframe.WEEKLY).toBe('WEEKLY');
    expect(Timeframe.MONTHLY).toBe('MONTHLY');
  });

  it('should have exactly 3 timeframe options', () => {
    const allValues = Object.values(Timeframe);
    expect(allValues).toHaveLength(3);
    expect(allValues).toContain('DAILY');
    expect(allValues).toContain('WEEKLY');
    expect(allValues).toContain('MONTHLY');
  });

  it('should be usable in type checking and comparisons', () => {
    const selectedTimeframe: Timeframe = Timeframe.WEEKLY;
    expect(selectedTimeframe).toBe('WEEKLY');
    
    // Verify enum can be used in switch statements
    function getTimeframePeriod(timeframe: Timeframe): string {
      switch (timeframe) {
        case Timeframe.DAILY:
          return 'day';
        case Timeframe.WEEKLY:
          return 'week';
        case Timeframe.MONTHLY:
          return 'month';
      }
    }
    
    expect(getTimeframePeriod(Timeframe.DAILY)).toBe('day');
    expect(getTimeframePeriod(Timeframe.WEEKLY)).toBe('week');
    expect(getTimeframePeriod(Timeframe.MONTHLY)).toBe('month');
  });
});
