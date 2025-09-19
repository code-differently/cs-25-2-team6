import { FileStudentRepo, Student } from "./FileStudentRepo";
import * as fs from "fs";
import * as path from "path";

const testFile = path.join(__dirname, "test_students.json");

beforeEach(() => {
  fs.writeFileSync(testFile, JSON.stringify([]));
});

test("saves student and is retrievable via findStudentIdByName", () => {
  const repo = new FileStudentRepo(testFile);
  const student: Student = { id: "1", firstName: "Alice", lastName: "Smith" };
  repo.saveStudent(student);

  const id = repo.findStudentIdByName("Alice", "Smith");
  expect(id).toBe("1");
});

test("returns undefined when name not found", () => {
  const repo = new FileStudentRepo(testFile);
  const id = repo.findStudentIdByName("Bob", "Jones");
  expect(id).toBeUndefined();
});
