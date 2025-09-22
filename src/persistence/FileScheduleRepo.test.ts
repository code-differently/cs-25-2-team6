import * as fs from "fs";
import * as path from "path";
import { ScheduledDayOff, ScheduledDayOffReason } from "../domains/ScheduledDayOff";
import { FileScheduleRepo } from "./FileScheduleRepo";

const testFile = path.join(__dirname, "test_scheduled_days_off.json");

beforeEach(() => {
  fs.writeFileSync(testFile, JSON.stringify([]));
});

//User Story 4 Tests
test("save then read hasDayOff if true", () => {
    const repo = new FileScheduleRepo(testFile);
    const entry = {
        dateISO: "2023-10-10",
        reason: ScheduledDayOffReason.HOLIDAY,
        scope: 'ALL_STUDENTS' as const
      };
      repo.saveDayOff(entry);

      const hasDayOff = repo.hasDayOff("2023-10-10");
        expect(hasDayOff).toBe(true);
});

test("overwriting existing day off is idempotent", () => {
    const repo = new FileScheduleRepo(testFile);
    const holidayEntry = {
        dateISO: "2023-10-10",
        reason: ScheduledDayOffReason.HOLIDAY,
        scope: 'ALL_STUDENTS' as const
      };
      repo.saveDayOff(holidayEntry);
      repo.saveDayOff(holidayEntry); // Save the same entry again

      const allDaysOff = repo.allDaysOff();
      expect(allDaysOff).toHaveLength(1);
      expect(allDaysOff[0]).toEqual(holidayEntry);
});

test("list of days off returns only dates within specified range", () => {
    const repo = new FileScheduleRepo(testFile);
    const entries = [
        { dateISO: "2023-10-10", reason: ScheduledDayOffReason.HOLIDAY, scope: 'ALL_STUDENTS' as const },
        { dateISO: "2023-11-15", reason: ScheduledDayOffReason.PROFESSIONAL_DEVELOPMENT, scope: 'ALL_STUDENTS' as const },
        { dateISO: "2023-12-20", reason: ScheduledDayOffReason.HOLIDAY, scope: 'ALL_STUDENTS' as const }
      ];
      entries.forEach(entry => repo.saveDayOff(entry));

      const result = repo.listDaysOffInRange("2023-11-01", "2023-12-31");
      expect(result.length).toBe(2);
      expect(result[0].dateISO).toBe("2023-11-15");
      expect(result[1].dateISO).toBe("2023-12-20");
    });