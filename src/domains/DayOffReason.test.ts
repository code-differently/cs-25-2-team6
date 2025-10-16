import { DayOffReason } from './DayOffReason';

describe('DayOffReason', () => {
  it('contains exactly the expected values', () => {
    expect(Object.values(DayOffReason).sort()).toEqual(
      ['HOLIDAY', 'PROF_DEV', 'REPORT_CARD', 'OTHER'].sort()
    );
  });
});
