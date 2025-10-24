import { useState, useEffect, useCallback } from 'react';

export interface DayOff {
  id: string;
  date: string;
  teacherId: string;
  teacherName: string;
  reason: string;
  status: 'approved' | 'pending' | 'rejected';
  type: 'sick' | 'vacation' | 'personal' | 'other';
}

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'class' | 'event' | 'holiday';
  description?: string;
  location?: string;
}

export interface CalendarState {
  currentDate: Date;
  selectedDate: Date;
  daysOff: DayOff[];
  events: ScheduleEvent[];
  isLoading: boolean;
  error: string | null;
}

export const useScheduleCalendar = (initialDate: Date = new Date()) => {
  const [state, setState] = useState<CalendarState>({
    currentDate: new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
    selectedDate: initialDate,
    daysOff: [],
    events: [],
    isLoading: false,
    error: null
  });

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    setState(prev => ({
      ...prev,
      selectedDate: date
    }));
  }, []);

  // Calendar navigation
  const handleCalendarNavigation = useCallback((direction: 'prev' | 'next' | 'today') => {
    setState(prev => {
      const currentDate = new Date(prev.currentDate);
      
      switch (direction) {
        case 'prev':
          currentDate.setMonth(currentDate.getMonth() - 1);
          break;
        case 'next':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'today':
          const today = new Date();
          currentDate.setFullYear(today.getFullYear(), today.getMonth(), 1);
          break;
      }
      
      return {
        ...prev,
        currentDate
      };
    });
  }, []);

  // Render calendar month
  const renderCalendarMonth = useCallback((year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
      
      if (days.length >= 42) break; // 6 weeks max
    }
    
    return days;
  }, []);

  // Highlight scheduled days
  const highlightScheduledDays = useCallback((daysOff: DayOff[]) => {
    const highlightedDates = new Set<string>();
    
    daysOff.forEach(dayOff => {
      highlightedDates.add(dayOff.date);
    });
    
    return highlightedDates;
  }, []);

  // Refresh schedule data
  const refreshScheduleData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual data fetching
      const mockDaysOff: DayOff[] = [
        {
          id: '1',
          date: '2024-01-15',
          teacherId: 'teacher1',
          teacherName: 'John Smith',
          reason: 'Sick leave',
          status: 'approved',
          type: 'sick'
        },
        {
          id: '2',
          date: '2024-01-20',
          teacherId: 'teacher2',
          teacherName: 'Jane Doe',
          reason: 'Vacation',
          status: 'pending',
          type: 'vacation'
        }
      ];

      const mockEvents: ScheduleEvent[] = [
        {
          id: '1',
          title: 'Staff Meeting',
          date: '2024-01-18',
          startTime: '09:00',
          endTime: '10:30',
          type: 'meeting',
          description: 'Monthly staff meeting',
          location: 'Conference Room A'
        },
        {
          id: '2',
          title: 'Parent-Teacher Conference',
          date: '2024-01-25',
          startTime: '14:00',
          endTime: '17:00',
          type: 'event',
          description: 'Quarterly parent-teacher conferences',
          location: 'Main Hall'
        }
      ];

      setState(prev => ({
        ...prev,
        daysOff: mockDaysOff,
        events: mockEvents,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load schedule data',
        isLoading: false
      }));
    }
  }, []);

  // Load initial data
  useEffect(() => {
    refreshScheduleData();
  }, [refreshScheduleData]);

  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return state.events.filter(event => event.date === dateString);
  }, [state.events]);

  // Get days off for a specific date
  const getDaysOffForDate = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return state.daysOff.filter(dayOff => dayOff.date === dateString);
  }, [state.daysOff]);

  return {
    ...state,
    handleDateSelect,
    handleCalendarNavigation,
    renderCalendarMonth,
    highlightScheduledDays,
    refreshScheduleData,
    getEventsForDate,
    getDaysOffForDate
  };
};