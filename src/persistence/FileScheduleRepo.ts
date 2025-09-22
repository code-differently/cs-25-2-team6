import * as fs from "fs";
import * as path from "path";
import { ScheduledDayOffReason } from "../domains/ScheduledDayOff";

export interface DayOff {
    dateISO: string;
    reason: ScheduledDayOffReason;
    scope: 'ALL_STUDENTS';

}

export class FileScheduleRepo {
  private filePath: string;

    constructor(filePath?: string) {
      this.filePath = filePath ?? path.join(__dirname, "scheduled_days_off.json");
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, JSON.stringify([]));
      }
    }

    saveDayOff(entry: { dateISO: string, reason: ScheduledDayOffReason, scope: 'ALL_STUDENTS'}): void {
        const daysOff = this.allDaysOff();

        const filteredDaysOff = daysOff.filter(day => day.dateISO !== entry.dateISO);

        filteredDaysOff.push(entry);

        fs.writeFileSync(this.filePath, JSON.stringify(filteredDaysOff, null, 2));
    }

    allDaysOff(): DayOff[] {
        const data = fs.readFileSync(this.filePath, "utf-8");
        return JSON.parse(data) as DayOff[];
      }

    hasDayOff(dateISO: string): boolean {
        const daysOff = this.allDaysOff();
        return daysOff.some(day => day.dateISO === dateISO);
    }

    listDaysOffInRange(startISO: string, endISO: string): Array<{dateISO: string, reason: ScheduledDayOffReason}> {
        const daysOff = this.allDaysOff();
        return daysOff
            .filter(day => day.dateISO >= startISO && day.dateISO <= endISO)
            .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    }
}