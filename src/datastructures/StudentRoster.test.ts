import { StudentRoster } from './StudentRoster';
import { StudentNotFoundError } from '../exceptions/StudentNotFoundError';

describe('StudentRoster', () => {
    let roster: StudentRoster;

    beforeEach(() => {
        roster = new StudentRoster();
    });

    describe('addStudent', () => {
        it('should add a student successfully with valid data', () => {
            roster.addStudent('001', 'John', 'Doe', 'john.doe@email.com');
            
            expect(roster.hasStudent('001')).toBe(true);
            expect(roster.getStudentCount()).toBe(1);
        });

        it('should add a student without email', () => {
            roster.addStudent('002', 'Jane', 'Smith');
            
            const student = roster.getStudentById('002');
            expect(student.firstName).toBe('Jane');
            expect(student.lastName).toBe('Smith');
            expect(student.email).toBeUndefined();
        });

        it('should throw error when adding student with duplicate ID', () => {
            roster.addStudent('001', 'John', 'Doe');
            
            expect(() => {
                roster.addStudent('001', 'Jane', 'Smith');
            }).toThrow('Student with ID 001 already exists in roster');
        });

        it('should throw error when first name is empty or whitespace only', () => {
            expect(() => {
                roster.addStudent('001', '', 'Doe');
            }).toThrow('First name and last name cannot be empty');

            expect(() => {
                roster.addStudent('002', '   ', 'Doe');
            }).toThrow('First name and last name cannot be empty');
        });

        it('should throw error when last name is empty or whitespace only', () => {
            expect(() => {
                roster.addStudent('001', 'John', '');
            }).toThrow('First name and last name cannot be empty');

            expect(() => {
                roster.addStudent('002', 'John', '   ');
            }).toThrow('First name and last name cannot be empty');
        });

        it('should trim whitespace from names when adding', () => {
            roster.addStudent('001', '  John  ', '  Doe  ');
            
            const student = roster.getStudentById('001');
            expect(student.firstName).toBe('John');
            expect(student.lastName).toBe('Doe');
        });
    });

    describe('removeStudent', () => {
        beforeEach(() => {
            roster.addStudent('001', 'John', 'Doe');
        });

        it('should remove an existing student successfully', () => {
            expect(roster.hasStudent('001')).toBe(true);
            
            roster.removeStudent('001');
            
            expect(roster.hasStudent('001')).toBe(false);
            expect(roster.getStudentCount()).toBe(0);
        });

        it('should throw StudentNotFoundError when removing non-existent student', () => {
            expect(() => {
                roster.removeStudent('999');
            }).toThrow(StudentNotFoundError);
        });
    });

    describe('getStudentById', () => {
        beforeEach(() => {
            roster.addStudent('001', 'John', 'Doe', 'john.doe@email.com');
        });

        it('should return student information for valid ID', () => {
            const student = roster.getStudentById('001');
            
            expect(student.firstName).toBe('John');
            expect(student.lastName).toBe('Doe');
            expect(student.email).toBe('john.doe@email.com');
        });

        it('should return a copy of student data (not reference)', () => {
            const student = roster.getStudentById('001');
            student.firstName = 'Modified';
            
            const originalStudent = roster.getStudentById('001');
            expect(originalStudent.firstName).toBe('John');
        });

        it('should throw StudentNotFoundError for non-existent student ID', () => {
            expect(() => {
                roster.getStudentById('999');
            }).toThrow(StudentNotFoundError);
        });
    });

    describe('updateStudent', () => {
        beforeEach(() => {
            roster.addStudent('001', 'John', 'Doe', 'john.doe@email.com');
        });

        it('should update student firstName successfully', () => {
            roster.updateStudent('001', { firstName: 'Jonathan' });
            
            const student = roster.getStudentById('001');
            expect(student.firstName).toBe('Jonathan');
            expect(student.lastName).toBe('Doe');
            expect(student.email).toBe('john.doe@email.com');
        });

        it('should update student lastName successfully', () => {
            roster.updateStudent('001', { lastName: 'Smith' });
            
            const student = roster.getStudentById('001');
            expect(student.firstName).toBe('John');
            expect(student.lastName).toBe('Smith');
        });

        it('should update student email successfully', () => {
            roster.updateStudent('001', { email: 'jonathan.smith@email.com' });
            
            const student = roster.getStudentById('001');
            expect(student.email).toBe('jonathan.smith@email.com');
        });

        it('should update multiple fields at once', () => {
            roster.updateStudent('001', { 
                firstName: 'Jonathan', 
                lastName: 'Smith',
                email: 'jonathan.smith@email.com'
            });
            
            const student = roster.getStudentById('001');
            expect(student.firstName).toBe('Jonathan');
            expect(student.lastName).toBe('Smith');
            expect(student.email).toBe('jonathan.smith@email.com');
        });

        it('should throw StudentNotFoundError when updating non-existent student', () => {
            expect(() => {
                roster.updateStudent('999', { firstName: 'Test' });
            }).toThrow(StudentNotFoundError);
        });

        it('should throw error when updating firstName to empty string', () => {
            expect(() => {
                roster.updateStudent('001', { firstName: '' });
            }).toThrow('First name cannot be empty');

            expect(() => {
                roster.updateStudent('001', { firstName: '   ' });
            }).toThrow('First name cannot be empty');
        });

        it('should throw error when updating lastName to empty string', () => {
            expect(() => {
                roster.updateStudent('001', { lastName: '' });
            }).toThrow('Last name cannot be empty');

            expect(() => {
                roster.updateStudent('001', { lastName: '   ' });
            }).toThrow('Last name cannot be empty');
        });

        it('should trim whitespace when updating names', () => {
            roster.updateStudent('001', { 
                firstName: '  Jonathan  ', 
                lastName: '  Smith  '
            });
            
            const student = roster.getStudentById('001');
            expect(student.firstName).toBe('Jonathan');
            expect(student.lastName).toBe('Smith');
        });
    });

    describe('findStudentIdByName', () => {
        beforeEach(() => {
            roster.addStudent('001', 'John', 'Doe');
            roster.addStudent('002', 'Jane', 'Smith');
            roster.addStudent('003', 'John', 'Smith'); // Same first name, different last
        });

        it('should find student ID by exact name match', () => {
            const studentId = roster.findStudentIdByName('John', 'Doe');
            expect(studentId).toBe('001');
        });

        it('should return null for non-existent name combination', () => {
            const studentId = roster.findStudentIdByName('Nonexistent', 'Student');
            expect(studentId).toBe(null);
        });

        it('should be case sensitive', () => {
            const studentId = roster.findStudentIdByName('john', 'doe'); // lowercase
            expect(studentId).toBe(null);
        });

        it('should distinguish between students with same first name', () => {
            const johnDoeId = roster.findStudentIdByName('John', 'Doe');
            const johnSmithId = roster.findStudentIdByName('John', 'Smith');
            
            expect(johnDoeId).toBe('001');
            expect(johnSmithId).toBe('003');
            expect(johnDoeId).not.toBe(johnSmithId);
        });
    });

    describe('edge cases and error coverage', () => {
        it('should handle empty roster operations', () => {
            expect(roster.getStudentCount()).toBe(0);
            expect(roster.getAllStudents()).toEqual([]);
            expect(roster.hasStudent('any')).toBe(false);
            expect(roster.findStudentIdByName('Any', 'Name')).toBe(null);
        });

        it('should handle special characters in names', () => {
            roster.addStudent('001', 'José', "O'Connor");
            
            const student = roster.getStudentById('001');
            expect(student.firstName).toBe('José');
            expect(student.lastName).toBe("O'Connor");
            
            const foundId = roster.findStudentIdByName('José', "O'Connor");
            expect(foundId).toBe('001');
        });

        it('should handle unicode characters in names', () => {
            roster.addStudent('001', 'Алексей', 'Петров');
            
            const student = roster.getStudentById('001');
            expect(student.firstName).toBe('Алексей');
            expect(student.lastName).toBe('Петров');
        });

        it('should handle very long names', () => {
            const longFirstName = 'A'.repeat(100);
            const longLastName = 'B'.repeat(100);
            
            roster.addStudent('001', longFirstName, longLastName);
            
            const student = roster.getStudentById('001');
            expect(student.firstName).toBe(longFirstName);
            expect(student.lastName).toBe(longLastName);
        });

        it('should handle clear operation', () => {
            roster.addStudent('001', 'John', 'Doe');
            roster.addStudent('002', 'Jane', 'Smith');
            
            expect(roster.getStudentCount()).toBe(2);
            
            roster.clear();
            
            expect(roster.getStudentCount()).toBe(0);
            expect(roster.getAllStudents()).toEqual([]);
            expect(roster.hasStudent('001')).toBe(false);
        });

        it('should handle multiple remove operations', () => {
            roster.addStudent('001', 'John', 'Doe');
            roster.addStudent('002', 'Jane', 'Smith');
            
            roster.removeStudent('001');
            expect(() => {
                roster.removeStudent('001'); // Attempting to remove again
            }).toThrow(StudentNotFoundError);
        });

        it('should maintain data integrity after failed operations', () => {
            roster.addStudent('001', 'John', 'Doe');
            
            // Attempt invalid operations
            try {
                roster.addStudent('001', 'Jane', 'Smith'); // Duplicate ID
            } catch (error) {
                // Expected to fail
            }
            
            try {
                roster.updateStudent('001', { firstName: '' }); // Empty name
            } catch (error) {
                // Expected to fail
            }
            
            // Original data should be intact
            const student = roster.getStudentById('001');
            expect(student.firstName).toBe('John');
            expect(student.lastName).toBe('Doe');
            expect(roster.getStudentCount()).toBe(1);
        });
    });

    describe('getAllStudents', () => {
        it('should return empty array for empty roster', () => {
            expect(roster.getAllStudents()).toEqual([]);
        });

        it('should return all students with their IDs', () => {
            roster.addStudent('001', 'John', 'Doe', 'john@email.com');
            roster.addStudent('002', 'Jane', 'Smith');
            
            const allStudents = roster.getAllStudents();
            
            expect(allStudents).toHaveLength(2);
            expect(allStudents).toEqual(
                expect.arrayContaining([
                    { id: '001', firstName: 'John', lastName: 'Doe', email: 'john@email.com' },
                    { id: '002', firstName: 'Jane', lastName: 'Smith', email: undefined }
                ])
            );
        });
    });
});