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

test("finds students by last name", () => {
  const repo = new FileStudentRepo(testFile);
  const student1: Student = { id: "1", firstName: "Alice", lastName: "Smith" };
  const student2: Student = { id: "2", firstName: "Bob", lastName: "Smith" };
  const student3: Student = { id: "3", firstName: "Carol", lastName: "Jones" };
  
  repo.saveStudent(student1);
  repo.saveStudent(student2);
  repo.saveStudent(student3);

  const smithStudents = repo.findStudentsByLastName("Smith");
  expect(smithStudents.length).toBe(2);
  expect(smithStudents.every(student => student.lastName === "Smith")).toBe(true);
});

test("allStudents returns students in a deterministic order", () => {
  const repo = new FileStudentRepo(testFile);
  const student1: Student = { id: "1", firstName: "Alice", lastName: "Smith" };
  const student2: Student = { id: "2", firstName: "Bob", lastName: "Smith" };
  const student3: Student = { id: "3", firstName: "Carol", lastName: "Jones" };
  
  repo.saveStudent(student1);
  repo.saveStudent(student2);
  repo.saveStudent(student3);

  const firstCall = repo.allStudents();
  const secondCall = repo.allStudents();

  expect(firstCall).toEqual(secondCall);
  expect(firstCall.length).toBe(3);
});

