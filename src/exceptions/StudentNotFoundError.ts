
export class StudentNotFoundError extends Error {
    public readonly firstName: string;
    public readonly lastName: string;

    constructor(firstName: string, lastName: string) {
        const message = `Student not found: ${firstName} ${lastName}`;
        super(message);
        
        this.name = 'StudentNotFoundError';
        this.firstName = firstName;
        this.lastName = lastName;
        
        
        if ((Error as any).captureStackTrace) {
            (Error as any).captureStackTrace(this, StudentNotFoundError);
        }
    }

    
    public getFullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}