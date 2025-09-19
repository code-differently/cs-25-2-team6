import { FileAttendanceRepo } from "./FileAttendanceRepo";
import { AttendanceRecord } from "../domains/AttendanceRecords";
import { AttendanceStatus } from "../domains/AttendanceStatus";
import * as fs from "fs";
import * as path from "path";

const testFile = path.join(__dirname, "test_attendance.json");

beforeEach(() => {
  fs.writeFileSync(testFile, JSON.stringify([]));
});

test("saves attendance and is retrievable via allAttendance", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT
  });
  repo.saveAttendance(record);

  const all = repo.allAttendance();
  expect(all.length).toBe(1);
  expect(all[0].status).toBe(AttendanceStatus.PRESENT);
});

test("findAttendanceBy returns expected record", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record = new AttendanceRecord({
    studentId: "2",
    dateISO: "2025-09-19",
    status: AttendanceStatus.PRESENT
  });
  repo.saveAttendance(record);

  const found = repo.findAttendanceBy("2", "2025-09-19");
  expect(found?.status).toBe(AttendanceStatus.PRESENT);
});
