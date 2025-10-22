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
      // Get the year and month from the current date
      const year = state.currentDate.getFullYear();
      const month = state.currentDate.getMonth() + 1; // JS months are 0-indexed, API expects 1-indexed
      
      // Fetch scheduled days from the API
      const response = await fetch(`/api/schedule?year=${year}&month=${month}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch scheduled days');
      }
      
      // Convert API response to our internal structure
      const fetchedDaysOff: DayOff[] = result.data.map((day: any) => ({
        id: day.id,
        date: day.date,
        teacherId: 'system',
        teacherName: 'System',
        reason: day.reason,
        status: 'approved',
        type: day.reason.toLowerCase()
      }));

      // Create events based on scheduled days
      const fetchedEvents: ScheduleEvent[] = result.data.map((day: any) => ({
        id: day.id,
        title: day.reason,
        date: day.date,
        startTime: '00:00',
        endTime: '23:59',
        type: day.reason.toLowerCase() === 'holiday' ? 'holiday' : 'event',
        description: day.description || `Scheduled day off: ${day.reason}`,
        location: 'All locations'
      }));

      setState(prev => ({
        ...prev,
        daysOff: fetchedDaysOff,
        events: fetchedEvents,
        isLoading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to load schedule data',
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