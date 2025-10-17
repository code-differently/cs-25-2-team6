import React, { useState, useEffect } from 'react';

interface Student {
    id: string;
    firstName: string;
    lastName: string;
}

interface AttendanceRecord {
    studentId: string;
    status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
    earlyDismissal: boolean;
    date: string;
}

interface FormErrors {
    date: string;
    student: string;
    general: string;
}

export default function AttendancePage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    
}
