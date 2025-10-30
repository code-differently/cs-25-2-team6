import React, { useState, useEffect, useRef } from 'react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

interface StudentSearchInputProps {
  students: Student[];
  onSelect: (student: Student | null) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  clearOnSelect?: boolean;
}

const StudentSearchInput: React.FC<StudentSearchInputProps> = ({
  students,
  onSelect,
  placeholder = "Search for a student...",
  label,
  className = '',
  disabled = false,
  clearOnSelect = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents([]);
      setShowDropdown(false);
      return;
    }

    const filtered = students.filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const email = student.email?.toLowerCase() || '';
      const id = student.id?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      
      return fullName.includes(term) || 
             student.firstName.toLowerCase().includes(term) ||
             student.lastName.toLowerCase().includes(term) ||
             email.includes(term) ||
             id.includes(term);
    });

    setFilteredStudents(filtered);
    setShowDropdown(filtered.length > 0);
    setSelectedIndex(-1);
  }, [searchTerm, students]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStudentSelect = (student: Student) => {
    onSelect(student);
    if (clearOnSelect) {
      setSearchTerm('');
    } else {
      setSearchTerm(`${student.firstName} ${student.lastName}`);
    }
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredStudents.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredStudents.length) {
          handleStudentSelect(filteredStudents[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`student-search-input ${className}`} ref={dropdownRef}>
      {label && (
        <label className="search-input-label">
          {label}
        </label>
      )}
      <div className="search-input-container">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="search-input"
        />
        {showDropdown && (
          <div className="search-dropdown">
            {filteredStudents.map((student, index) => (
              <div
                key={student.id}
                className={`search-dropdown-item ${
                  index === selectedIndex ? 'selected' : ''
                }`}
                onClick={() => handleStudentSelect(student)}
              >
                <div className="student-name">
                  {student.firstName} {student.lastName}
                </div>
                {student.email && (
                  <div className="student-email">
                    {student.email}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSearchInput;