import { ScheduledDayOff } from './ScheduledDayOff';
import { DayOffReason } from './DayOffReason';

describe('ScheduledDayOff', () => {
  it('can be constructed with date and reason; fields are present', () => {
    const dayOff: ScheduledDayOff = {
      dateISO: '2025-11-27',
      reason: DayOffReason.HOLIDAY,
      scope: 'ALL_STUDENTS'
    };
    expect(dayOff.dateISO).toBe('2025-11-27');
    expect(dayOff.reason).toBe(DayOffReason.HOLIDAY);
    expect(dayOff.scope).toBe('ALL_STUDENTS');
  });
});
