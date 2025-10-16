// Minimal stub for ScheduleRepo and DayOffReason to unblock imports and tests
export type DayOffReason = 'HOLIDAY' | 'PROFESSIONAL_DEVELOPMENT' | 'REPORT_CARD_CONFERENCES' | 'OTHER';

export class ScheduleRepo {
  private plannedDays: { dateISO: string; reason: DayOffReason; scope: string }[] = [];

  savePlannedDayOff({ dateISO, reason, scope }: { dateISO: string; reason: DayOffReason; scope: string }) {
    this.plannedDays.push({ dateISO, reason, scope });
  }

  isPlannedDayOff(dateISO: string): boolean {
    return this.plannedDays.some(d => d.dateISO === dateISO);
  }
}
