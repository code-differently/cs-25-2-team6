import { AttendanceService } from './AttendanceService';
import { StudentNotFoundError } from '../exceptions/StudentNotFoundError';

describe('AttendanceService', () => {
    let attendanceService: AttendanceService;

    beforeEach(() => {
        
        attendanceService = new AttendanceService();
    });

    describe('markAttendanceByName', () => {
        it('should throw StudentNotFoundError when student is not found by name', () => {
            const firstName = 'NonExistent';
            const lastName = 'Student';

            expect(() => {
                attendanceService.markAttendanceByName(firstName, lastName);
            }).toThrow(StudentNotFoundError);
        });

        it('should throw StudentNotFoundError with correct student name in message', () => {
            const firstName = 'John';
            const lastName = 'Doe';

            expect(() => {
                attendanceService.markAttendanceByName(firstName, lastName);
            }).toThrow(`Student not found: ${firstName} ${lastName}`);
        });

        it('should throw StudentNotFoundError that contains the correct firstName and lastName properties', () => {
            const firstName = 'Jane';
            const lastName = 'Smith';

            try {
                attendanceService.markAttendanceByName(firstName, lastName);
                fail('Expected StudentNotFoundError to be thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(StudentNotFoundError);
                const studentError = error as StudentNotFoundError;
                expect(studentError.firstName).toBe(firstName);
                expect(studentError.lastName).toBe(lastName);
                expect(studentError.getFullName()).toBe(`${firstName} ${lastName}`);
            }
        });

        it('should handle empty string names gracefully when throwing error', () => {
            expect(() => {
                attendanceService.markAttendanceByName('', '');
            }).toThrow(StudentNotFoundError);

            expect(() => {
                attendanceService.markAttendanceByName('', '');
            }).toThrow('Student not found:  ');
        });

        it('should handle special characters in names when throwing error', () => {
            const firstName = 'José';
            const lastName = "O'Connor";

            expect(() => {
                attendanceService.markAttendanceByName(firstName, lastName);
            }).toThrow(StudentNotFoundError);

            expect(() => {
                attendanceService.markAttendanceByName(firstName, lastName);
            }).toThrow(`Student not found: ${firstName} ${lastName}`);
        });

        it('should successfully mark attendance when student exists', () => {
            // Register a student first
            attendanceService.registerStudent('John', 'Doe', 'STU001');
            
            // Mock console.log to capture output
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            // This should not throw an error
            expect(() => {
                attendanceService.markAttendanceByName('John', 'Doe');
            }).not.toThrow();
            
            // Verify the console output
            expect(consoleSpy).toHaveBeenCalledWith('Marking attendance for student STU001');
            
            consoleSpy.mockRestore();
        });

        it('should mark attendance for student with special characters in name', () => {
            attendanceService.registerStudent('José', "O'Connor", 'STU002');
            
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            expect(() => {
                attendanceService.markAttendanceByName('José', "O'Connor");
            }).not.toThrow();
            
            expect(consoleSpy).toHaveBeenCalledWith('Marking attendance for student STU002');
            consoleSpy.mockRestore();
        });
    });

    describe('error handling edge cases', () => {
        it('should throw StudentNotFoundError for partial name matches', () => {
            
            expect(() => {
                attendanceService.markAttendanceByName('J', 'Doe');
            }).toThrow(StudentNotFoundError);
        });

        it('should be case sensitive when searching for names', () => {
            
            expect(() => {
                attendanceService.markAttendanceByName('john', 'doe'); 
            }).toThrow(StudentNotFoundError);
        });

        it('should handle whitespace in names appropriately', () => {
            expect(() => {
                attendanceService.markAttendanceByName(' John ', ' Doe '); 
            }).toThrow(StudentNotFoundError);
        });
    });

    describe('registerStudent', () => {
        it('should register a student successfully', () => {
            attendanceService.registerStudent('Alice', 'Johnson', 'STU001');
            
            expect(attendanceService.getStudentCount()).toBe(1);
            
            // Verify the student can be found by marking attendance
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            attendanceService.markAttendanceByName('Alice', 'Johnson');
            expect(consoleSpy).toHaveBeenCalledWith('Marking attendance for student STU001');
            consoleSpy.mockRestore();
        });

        it('should register multiple students with different names', () => {
            attendanceService.registerStudent('John', 'Doe', 'STU001');
            attendanceService.registerStudent('Jane', 'Smith', 'STU002');
            attendanceService.registerStudent('Bob', 'Wilson', 'STU003');
            
            expect(attendanceService.getStudentCount()).toBe(3);
        });

        it('should handle students with same first name but different last names', () => {
            attendanceService.registerStudent('John', 'Doe', 'STU001');
            attendanceService.registerStudent('John', 'Smith', 'STU002');
            
            expect(attendanceService.getStudentCount()).toBe(2);
            
            // Both should be findable by their full names
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            attendanceService.markAttendanceByName('John', 'Doe');
            expect(consoleSpy).toHaveBeenCalledWith('Marking attendance for student STU001');
            
            attendanceService.markAttendanceByName('John', 'Smith');
            expect(consoleSpy).toHaveBeenCalledWith('Marking attendance for student STU002');
            
            consoleSpy.mockRestore();
        });

        it('should allow overwriting a student with the same name', () => {
            attendanceService.registerStudent('John', 'Doe', 'STU001');
            attendanceService.registerStudent('John', 'Doe', 'STU002'); // Same name, different ID
            
            expect(attendanceService.getStudentCount()).toBe(1); // Should still be 1
            
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            attendanceService.markAttendanceByName('John', 'Doe');
            expect(consoleSpy).toHaveBeenCalledWith('Marking attendance for student STU002'); // Should use the latest ID
            consoleSpy.mockRestore();
        });

        it('should handle special characters in names and IDs', () => {
            attendanceService.registerStudent('María', 'García-López', 'STU-001');
            
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            attendanceService.markAttendanceByName('María', 'García-López');
            expect(consoleSpy).toHaveBeenCalledWith('Marking attendance for student STU-001');
            consoleSpy.mockRestore();
        });

        it('should handle empty strings in names and IDs', () => {
            // Register student with empty names but non-empty ID
            attendanceService.registerStudent('', '', 'EMPTY_NAME_STUDENT');
            
            expect(attendanceService.getStudentCount()).toBe(1);
            
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            // The service should find the student with empty names since it was registered
            expect(() => {
                attendanceService.markAttendanceByName('', '');
            }).not.toThrow();
            
            expect(consoleSpy).toHaveBeenCalledWith('Marking attendance for student EMPTY_NAME_STUDENT');
            consoleSpy.mockRestore();
        });

        it('should handle empty student ID (edge case)', () => {
            // When registering with empty ID, the behavior is that it won't be found
            // because empty string is falsy in the attendance check
            attendanceService.registerStudent('Test', 'User', '');
            
            expect(attendanceService.getStudentCount()).toBe(1);
            
            // This should throw because empty ID is treated as "not found"
            expect(() => {
                attendanceService.markAttendanceByName('Test', 'User');
            }).toThrow(StudentNotFoundError);
        });
    });

    describe('getStudentCount', () => {
        it('should return 0 for empty service', () => {
            expect(attendanceService.getStudentCount()).toBe(0);
        });

        it('should return correct count after registering students', () => {
            expect(attendanceService.getStudentCount()).toBe(0);
            
            attendanceService.registerStudent('Student', 'One', 'STU001');
            expect(attendanceService.getStudentCount()).toBe(1);
            
            attendanceService.registerStudent('Student', 'Two', 'STU002');
            expect(attendanceService.getStudentCount()).toBe(2);
            
            attendanceService.registerStudent('Student', 'Three', 'STU003');
            expect(attendanceService.getStudentCount()).toBe(3);
        });

        it('should not increment count when overwriting existing student', () => {
            attendanceService.registerStudent('John', 'Doe', 'STU001');
            expect(attendanceService.getStudentCount()).toBe(1);
            
            // Register same name with different ID
            attendanceService.registerStudent('John', 'Doe', 'STU002');
            expect(attendanceService.getStudentCount()).toBe(1); // Should still be 1
        });
    });

    describe('findStudentIdByName (private method behavior)', () => {
        beforeEach(() => {
            attendanceService.registerStudent('John', 'Doe', 'STU001');
            attendanceService.registerStudent('Jane', 'Smith', 'STU002');
        });

        it('should find registered students by exact name match', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            attendanceService.markAttendanceByName('John', 'Doe');
            expect(consoleSpy).toHaveBeenCalledWith('Marking attendance for student STU001');
            
            attendanceService.markAttendanceByName('Jane', 'Smith');
            expect(consoleSpy).toHaveBeenCalledWith('Marking attendance for student STU002');
            
            consoleSpy.mockRestore();
        });

        it('should be case sensitive', () => {
            expect(() => {
                attendanceService.markAttendanceByName('john', 'doe'); // lowercase
            }).toThrow(StudentNotFoundError);
            
            expect(() => {
                attendanceService.markAttendanceByName('JOHN', 'DOE'); // uppercase
            }).toThrow(StudentNotFoundError);
        });

        it('should require exact whitespace match', () => {
            expect(() => {
                attendanceService.markAttendanceByName('John ', 'Doe'); // trailing space
            }).toThrow(StudentNotFoundError);
            
            expect(() => {
                attendanceService.markAttendanceByName(' John', 'Doe'); // leading space
            }).toThrow(StudentNotFoundError);
        });
    });

    describe('integration scenarios', () => {
        it('should handle a typical workflow', () => {
            // Start with empty service
            expect(attendanceService.getStudentCount()).toBe(0);
            
            // Register students
            attendanceService.registerStudent('Alice', 'Johnson', 'STU001');
            attendanceService.registerStudent('Bob', 'Smith', 'STU002');
            attendanceService.registerStudent('Carol', 'Williams', 'STU003');
            
            expect(attendanceService.getStudentCount()).toBe(3);
            
            // Mark attendance for existing students
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            attendanceService.markAttendanceByName('Alice', 'Johnson');
            attendanceService.markAttendanceByName('Bob', 'Smith');
            attendanceService.markAttendanceByName('Carol', 'Williams');
            
            expect(consoleSpy).toHaveBeenCalledTimes(3);
            expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Marking attendance for student STU001');
            expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Marking attendance for student STU002');
            expect(consoleSpy).toHaveBeenNthCalledWith(3, 'Marking attendance for student STU003');
            
            consoleSpy.mockRestore();
            
            // Try to mark attendance for non-existent student
            expect(() => {
                attendanceService.markAttendanceByName('David', 'Brown');
            }).toThrow(StudentNotFoundError);
        });

        it('should handle registration updates correctly', () => {
            // Register a student
            attendanceService.registerStudent('John', 'Doe', 'TEMP001');
            
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            attendanceService.markAttendanceByName('John', 'Doe');
            expect(consoleSpy).toHaveBeenCalledWith('Marking attendance for student TEMP001');
            
            // Update the same student with a new ID
            attendanceService.registerStudent('John', 'Doe', 'PERM001');
            
            // Attendance should now use the new ID
            attendanceService.markAttendanceByName('John', 'Doe');
            expect(consoleSpy).toHaveBeenCalledWith('Marking attendance for student PERM001');
            
            consoleSpy.mockRestore();
            
            // Student count should still be 1
            expect(attendanceService.getStudentCount()).toBe(1);
        });
    });
});