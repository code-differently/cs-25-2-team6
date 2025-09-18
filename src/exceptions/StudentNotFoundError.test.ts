import { StudentNotFoundError } from './StudentNotFoundError';

describe('StudentNotFoundError', () => {
    describe('constructor', () => {
        it('should create error with correct message including first and last name', () => {
            const firstName = 'John';
            const lastName = 'Doe';
            const error = new StudentNotFoundError(firstName, lastName);

            expect(error.message).toBe('Student not found: John Doe');
            expect(error.name).toBe('StudentNotFoundError');
        });

        it('should store firstName and lastName properties', () => {
            const firstName = 'Jane';
            const lastName = 'Smith';
            const error = new StudentNotFoundError(firstName, lastName);

            expect(error.firstName).toBe(firstName);
            expect(error.lastName).toBe(lastName);
        });

        it('should handle empty strings gracefully', () => {
            const error = new StudentNotFoundError('', '');

            expect(error.message).toBe('Student not found:  ');
            expect(error.firstName).toBe('');
            expect(error.lastName).toBe('');
        });

        it('should handle names with special characters', () => {
            const firstName = 'José';
            const lastName = "O'Connor";
            const error = new StudentNotFoundError(firstName, lastName);

            expect(error.message).toBe("Student not found: José O'Connor");
            expect(error.firstName).toBe(firstName);
            expect(error.lastName).toBe(lastName);
        });

        it('should be an instance of Error', () => {
            const error = new StudentNotFoundError('Test', 'User');

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(StudentNotFoundError);
        });
    });

    describe('getFullName', () => {
        it('should return the full name correctly formatted', () => {
            const firstName = 'Alice';
            const lastName = 'Johnson';
            const error = new StudentNotFoundError(firstName, lastName);

            expect(error.getFullName()).toBe('Alice Johnson');
        });

        it('should handle empty names', () => {
            const error = new StudentNotFoundError('', '');

            expect(error.getFullName()).toBe(' ');
        });

        it('should handle single name components', () => {
            const errorFirstOnly = new StudentNotFoundError('Madonna', '');
            const errorLastOnly = new StudentNotFoundError('', 'Cher');

            expect(errorFirstOnly.getFullName()).toBe('Madonna ');
            expect(errorLastOnly.getFullName()).toBe(' Cher');
        });
    });

    describe('error properties', () => {
        it('should have correct name property', () => {
            const error = new StudentNotFoundError('Test', 'Student');

            expect(error.name).toBe('StudentNotFoundError');
        });

        it('should have a stack trace', () => {
            const error = new StudentNotFoundError('Test', 'Student');

            expect(error.stack).toBeDefined();
            expect(typeof error.stack).toBe('string');
        });
    });

    describe('integration scenarios', () => {
        it('should be catchable as a specific error type', () => {
            const throwError = () => {
                throw new StudentNotFoundError('Missing', 'Student');
            };

            expect(throwError).toThrow(StudentNotFoundError);
            expect(throwError).toThrow('Student not found: Missing Student');
        });

        it('should maintain error context when caught and rethrown', () => {
            let caughtError: StudentNotFoundError | null = null;

            try {
                throw new StudentNotFoundError('Test', 'Case');
            } catch (error) {
                caughtError = error as StudentNotFoundError;
            }

            expect(caughtError).toBeInstanceOf(StudentNotFoundError);
            expect(caughtError?.firstName).toBe('Test');
            expect(caughtError?.lastName).toBe('Case');
            expect(caughtError?.getFullName()).toBe('Test Case');
        });
    });
});


