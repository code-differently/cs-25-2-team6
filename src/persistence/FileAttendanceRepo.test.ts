import { FileAttendanceRepo } from "./FileAttendanceRepo";
import { AttendanceRecord } from "../domains/AttendanceRecords";
import { AttendanceStatus } from "../domains/AttendanceStatus";
import * as fs from "fs";
import * as path from "path";

const testFile = path.join(__dirname, "test_attendance.json");

beforeEach(() => {
  fs.writeFileSync(testFile, JSON.stringify([]));
});

//User Story 1 Tests
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

//User Story 2 Tests
test("findAttendanceByDate filters records correctly", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record1 = new AttendanceRecord({
    studentId: "3",
    dateISO: "2025-09-20",
    status: AttendanceStatus.PRESENT
  });
  const record2 = new AttendanceRecord({
    studentId: "4",
    dateISO: "2025-09-21",
    status: AttendanceStatus.ABSENT
  });
  repo.saveAttendance(record1);
  repo.saveAttendance(record2);

  const filtered = repo.findAttendanceByDate("2025-09-20");
  expect(filtered.length).toBe(1);
  expect(filtered[0].studentId).toBe("3");
});

test("findAttendanceByStatus filters records correctly", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record1 = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.LATE
  });
  const record2 = new AttendanceRecord({
    studentId: "2",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT
  });
  repo.saveAttendance(record1);
  repo.saveAttendance(record2);

  const lateRecords = repo.findAttendanceByStatus(AttendanceStatus.LATE);
  expect(lateRecords.length).toBe(1);
  expect(lateRecords[0].status).toBe(AttendanceStatus.LATE);
});

test("getLateListByDate returns only late records", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record1 = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.LATE
  });
  const record2 = new AttendanceRecord({
    studentId: "2",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT
  });
  repo.saveAttendance(record1);
  repo.saveAttendance(record2);

  const lateList = repo.getLateListByDate("2025-09-18");
  expect(lateList.length).toBe(1);
  expect(lateList[0].late).toBe(true);
});

test("getEarlyDismissalListByDate returns only early dismissal records", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record1 = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT,
    earlyDismissal: true
  });
  const record2 = new AttendanceRecord({
    studentId: "2",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT
  });
  repo.saveAttendance(record1);
  repo.saveAttendance(record2);

  const earlyList = repo.getEarlyDismissalListByDate("2025-09-18");
  expect(earlyList.length).toBe(1);
  expect(earlyList[0].earlyDismissal).toBe(true);
});

test("getLateListByStudent returns late records for specific student", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record1 = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.LATE
  });
  const record2 = new AttendanceRecord({
    studentId: "2",
    dateISO: "2025-09-18",
    status: AttendanceStatus.LATE
  });
  repo.saveAttendance(record1);
  repo.saveAttendance(record2);

  const studentLateList = repo.getLateListByStudent("1");
  expect(studentLateList.length).toBe(1);
  expect(studentLateList[0].studentId).toBe("1");
});

test("getEarlyDismissalListByStudent returns early dismissal records for specific student", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record1 = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT,
    earlyDismissal: true
  });
  const record2 = new AttendanceRecord({
    studentId: "2",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT,
    earlyDismissal: true
  });
  repo.saveAttendance(record1);
  repo.saveAttendance(record2);

  const studentEarlyList = repo.getEarlyDismissalListByStudent("1");
  expect(studentEarlyList.length).toBe(1);
  expect(studentEarlyList[0].studentId).toBe("1");
});


