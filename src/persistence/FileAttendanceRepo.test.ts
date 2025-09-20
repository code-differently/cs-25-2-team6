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

// Edge Cases

test("allAttendance returns empty array when no records exist", () => {
  const repo = new FileAttendanceRepo(testFile);
  const all = repo.allAttendance();
  expect(all).toEqual([]);
  expect(all.length).toBe(0);
});

test("findAttendanceBy returns undefined when no matching record exists", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT
  });
  repo.saveAttendance(record);

  const notFound = repo.findAttendanceBy("999", "2025-09-18");
  expect(notFound).toBeUndefined();

  const notFoundDate = repo.findAttendanceBy("1", "2025-01-01");
  expect(notFoundDate).toBeUndefined();
});

test("findAttendanceByDate returns empty array when no records match date", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT
  });
  repo.saveAttendance(record);

  const empty = repo.findAttendanceByDate("2025-01-01");
  expect(empty).toEqual([]);
  expect(empty.length).toBe(0);
});

test("findAttendanceByStatus returns empty array when no records match status", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT
  });
  repo.saveAttendance(record);

  const empty = repo.findAttendanceByStatus(AttendanceStatus.EXCUSED);
  expect(empty).toEqual([]);
  expect(empty.length).toBe(0);
});

test("getLateListByDate returns empty array when no late records exist for date", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT
  });
  repo.saveAttendance(record);

  const noLate = repo.getLateListByDate("2025-09-18");
  expect(noLate).toEqual([]);

  const noRecords = repo.getLateListByDate("2025-01-01");
  expect(noRecords).toEqual([]);
});

test("getEarlyDismissalListByDate returns empty array when no early dismissal records exist", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT
  });
  repo.saveAttendance(record);

  const noEarly = repo.getEarlyDismissalListByDate("2025-09-18");
  expect(noEarly).toEqual([]);

  const noRecords = repo.getEarlyDismissalListByDate("2025-01-01");
  expect(noRecords).toEqual([]);
});

test("getLateListByStudent returns empty array when student has no late records", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT
  });
  repo.saveAttendance(record);

  const noLate = repo.getLateListByStudent("1");
  expect(noLate).toEqual([]);

  const noStudent = repo.getLateListByStudent("999");
  expect(noStudent).toEqual([]);
});

test("getEarlyDismissalListByStudent returns empty array when student has no early dismissal records", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT
  });
  repo.saveAttendance(record);

  const noEarly = repo.getEarlyDismissalListByStudent("1");
  expect(noEarly).toEqual([]);

  const noStudent = repo.getEarlyDismissalListByStudent("999");
  expect(noStudent).toEqual([]);
});

test("saveAttendance handles multiple records with different attendance statuses", () => {
  const repo = new FileAttendanceRepo(testFile);
  const presentRecord = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT
  });
  const lateRecord = new AttendanceRecord({
    studentId: "2",
    dateISO: "2025-09-18",
    status: AttendanceStatus.LATE
  });
  const absentRecord = new AttendanceRecord({
    studentId: "3",
    dateISO: "2025-09-18",
    status: AttendanceStatus.ABSENT
  });
  const excusedRecord = new AttendanceRecord({
    studentId: "4",
    dateISO: "2025-09-18",
    status: AttendanceStatus.EXCUSED
  });

  repo.saveAttendance(presentRecord);
  repo.saveAttendance(lateRecord);
  repo.saveAttendance(absentRecord);
  repo.saveAttendance(excusedRecord);

  const all = repo.allAttendance();
  expect(all.length).toBe(4);

  const present = all.find(r => r.studentId === "1");
  expect(present?.status).toBe(AttendanceStatus.PRESENT);
  expect(present?.late).toBe(false);
  expect(present?.onTime).toBe(true);

  const late = all.find(r => r.studentId === "2");
  expect(late?.status).toBe(AttendanceStatus.LATE);
  expect(late?.late).toBe(true);
  expect(late?.onTime).toBe(false);

  const absent = all.find(r => r.studentId === "3");
  expect(absent?.status).toBe(AttendanceStatus.ABSENT);
  expect(absent?.late).toBe(false);
  expect(absent?.onTime).toBe(false);

  const excused = all.find(r => r.studentId === "4");
  expect(excused?.status).toBe(AttendanceStatus.EXCUSED);
  expect(excused?.excused).toBe(true);
  expect(excused?.late).toBe(false);
  expect(excused?.onTime).toBe(false);
});

test("findAttendanceByStatus works correctly for all attendance statuses", () => {
  const repo = new FileAttendanceRepo(testFile);
  const records = [
    new AttendanceRecord({ studentId: "1", dateISO: "2025-09-18", status: AttendanceStatus.PRESENT }),
    new AttendanceRecord({ studentId: "2", dateISO: "2025-09-18", status: AttendanceStatus.LATE }),
    new AttendanceRecord({ studentId: "3", dateISO: "2025-09-18", status: AttendanceStatus.ABSENT }),
    new AttendanceRecord({ studentId: "4", dateISO: "2025-09-18", status: AttendanceStatus.EXCUSED }),
    new AttendanceRecord({ studentId: "5", dateISO: "2025-09-19", status: AttendanceStatus.PRESENT }),
    new AttendanceRecord({ studentId: "6", dateISO: "2025-09-19", status: AttendanceStatus.LATE })
  ];

  records.forEach(record => repo.saveAttendance(record));

  const presentRecords = repo.findAttendanceByStatus(AttendanceStatus.PRESENT);
  expect(presentRecords.length).toBe(2);
  expect(presentRecords.every(r => r.status === AttendanceStatus.PRESENT)).toBe(true);

  const lateRecords = repo.findAttendanceByStatus(AttendanceStatus.LATE);
  expect(lateRecords.length).toBe(2);
  expect(lateRecords.every(r => r.status === AttendanceStatus.LATE)).toBe(true);

  const absentRecords = repo.findAttendanceByStatus(AttendanceStatus.ABSENT);
  expect(absentRecords.length).toBe(1);
  expect(absentRecords[0].status).toBe(AttendanceStatus.ABSENT);

  const excusedRecords = repo.findAttendanceByStatus(AttendanceStatus.EXCUSED);
  expect(excusedRecords.length).toBe(1);
  expect(excusedRecords[0].status).toBe(AttendanceStatus.EXCUSED);
});

test("getLateListByDate properly filters late records vs present records", () => {
  const repo = new FileAttendanceRepo(testFile);
  const lateRecord = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.LATE
  });
  const presentButLateRecord = new AttendanceRecord({
    studentId: "2",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT,
    late: true
  });
  const onTimeRecord = new AttendanceRecord({
    studentId: "3",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT
  });

  repo.saveAttendance(lateRecord);
  repo.saveAttendance(presentButLateRecord);
  repo.saveAttendance(onTimeRecord);

  const lateList = repo.getLateListByDate("2025-09-18");
  expect(lateList.length).toBe(2);
  expect(lateList.every(r => r.late === true)).toBe(true);
  expect(lateList.some(r => r.studentId === "1")).toBe(true);
  expect(lateList.some(r => r.studentId === "2")).toBe(true);
});

test("getEarlyDismissalListByDate properly filters early dismissal records", () => {
  const repo = new FileAttendanceRepo(testFile);
  const presentEarlyRecord = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT,
    earlyDismissal: true
  });
  const lateEarlyRecord = new AttendanceRecord({
    studentId: "2",
    dateISO: "2025-09-18",
    status: AttendanceStatus.LATE,
    earlyDismissal: true
  });
  const regularRecord = new AttendanceRecord({
    studentId: "3",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT
  });

  repo.saveAttendance(presentEarlyRecord);
  repo.saveAttendance(lateEarlyRecord);
  repo.saveAttendance(regularRecord);

  const earlyList = repo.getEarlyDismissalListByDate("2025-09-18");
  expect(earlyList.length).toBe(2);
  expect(earlyList.every(r => r.earlyDismissal === true)).toBe(true);
  expect(earlyList.some(r => r.studentId === "1")).toBe(true);
  expect(earlyList.some(r => r.studentId === "2")).toBe(true);
});

test("multiple records for same student across different dates", () => {
  const repo = new FileAttendanceRepo(testFile);
  const records = [
    new AttendanceRecord({ studentId: "1", dateISO: "2025-09-18", status: AttendanceStatus.PRESENT }),
    new AttendanceRecord({ studentId: "1", dateISO: "2025-09-19", status: AttendanceStatus.LATE }),
    new AttendanceRecord({ studentId: "1", dateISO: "2025-09-20", status: AttendanceStatus.ABSENT }),
    new AttendanceRecord({ studentId: "2", dateISO: "2025-09-18", status: AttendanceStatus.LATE })
  ];

  records.forEach(record => repo.saveAttendance(record));

  const all = repo.allAttendance();
  expect(all.length).toBe(4);

  const student1Records = all.filter(r => r.studentId === "1");
  expect(student1Records.length).toBe(3);

  const lateRecordsStudent1 = repo.getLateListByStudent("1");
  expect(lateRecordsStudent1.length).toBe(1);
  expect(lateRecordsStudent1[0].dateISO).toBe("2025-09-19");

  const sept18Records = repo.findAttendanceByDate("2025-09-18");
  expect(sept18Records.length).toBe(2);
});

test("complex filtering combinations work correctly", () => {
  const repo = new FileAttendanceRepo(testFile);
  
  const records = [
    new AttendanceRecord({ studentId: "1", dateISO: "2025-09-18", status: AttendanceStatus.PRESENT, earlyDismissal: true }),
    new AttendanceRecord({ studentId: "1", dateISO: "2025-09-19", status: AttendanceStatus.LATE, earlyDismissal: true }),
    new AttendanceRecord({ studentId: "2", dateISO: "2025-09-18", status: AttendanceStatus.LATE }),
    new AttendanceRecord({ studentId: "2", dateISO: "2025-09-19", status: AttendanceStatus.PRESENT, earlyDismissal: true }),
    new AttendanceRecord({ studentId: "3", dateISO: "2025-09-18", status: AttendanceStatus.ABSENT })
  ];

  records.forEach(record => repo.saveAttendance(record));

  const lateAndEarlyStudent1 = repo.getLateListByStudent("1").filter(r => r.earlyDismissal);
  expect(lateAndEarlyStudent1.length).toBe(1);
  expect(lateAndEarlyStudent1[0].dateISO).toBe("2025-09-19");

  const earlyDismissalSept18 = repo.getEarlyDismissalListByDate("2025-09-18");
  expect(earlyDismissalSept18.length).toBe(1);
  expect(earlyDismissalSept18[0].studentId).toBe("1");

  const lateRecordsSept18 = repo.getLateListByDate("2025-09-18");
  expect(lateRecordsSept18.length).toBe(1);
  expect(lateRecordsSept18[0].studentId).toBe("2");
});

test("repo handles file persistence correctly", () => {
  const repo = new FileAttendanceRepo(testFile);
  const record1 = new AttendanceRecord({
    studentId: "1",
    dateISO: "2025-09-18",
    status: AttendanceStatus.PRESENT
  });
  
  repo.saveAttendance(record1);

  const newRepoInstance = new FileAttendanceRepo(testFile);
  const retrievedRecords = newRepoInstance.allAttendance();
  
  expect(retrievedRecords.length).toBe(1);
  expect(retrievedRecords[0].studentId).toBe("1");
  expect(retrievedRecords[0].status).toBe(AttendanceStatus.PRESENT);
});

test("findByStudentAndDateRange returns only records within the range and in ascending order", () => {
  const repo = new FileAttendanceRepo(testFile);
  const records = [
    new AttendanceRecord({ studentId: "1", dateISO: "2025-09-15", status: AttendanceStatus.PRESENT }),
    new AttendanceRecord({ studentId: "1", dateISO: "2025-09-18", status: AttendanceStatus.LATE }),
    new AttendanceRecord({ studentId: "1", dateISO: "2025-09-22", status: AttendanceStatus.ABSENT }),
    new AttendanceRecord({ studentId: "2", dateISO: "2025-09-19", status: AttendanceStatus.PRESENT })
  ];

  records.forEach(record => repo.saveAttendance(record));

  const result = repo.findByStudentAndDateRange("1", "2025-09-16", "2025-09-20");
  expect(result.length).toBe(1);
  expect(result[0].dateISO).toBe("2025-09-18");
});

test("findAllByStudent returns all records in deterministic order", () => {
  const repo = new FileAttendanceRepo(testFile);
  const records = [
    new AttendanceRecord({ studentId: "1", dateISO: "2025-09-20", status: AttendanceStatus.PRESENT }),
    new AttendanceRecord({ studentId: "1", dateISO: "2025-09-18", status: AttendanceStatus.LATE }),
    new AttendanceRecord({ studentId: "2", dateISO: "2025-09-19", status: AttendanceStatus.ABSENT })
  ];

  records.forEach(record => repo.saveAttendance(record));

  const result = repo.findAllByStudent("1");
  expect(result.length).toBe(2);
  expect(result[0].dateISO).toBe("2025-09-18");
  expect(result[1].dateISO).toBe("2025-09-20");
});


