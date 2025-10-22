import { useState } from 'react';

export interface ScheduledDayOff {
  id: string;
  date: string;
  reason: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface UseScheduleApiReturn {
  loading: boolean;
  error: string | null;
  scheduledDays: ScheduledDayOff[];
  fetchScheduledDays: (month?: number, year?: number) => Promise<ScheduledDayOff[]>;
  createScheduledDay: (date: string, reason: string, description?: string) => Promise<ScheduleApiResponse>;
  deleteScheduledDay: (id: string) => Promise<ScheduleApiResponse>;
  applyToAllStudents: (dayOffId: string) => Promise<ScheduleApiResponse>;
}

/**
 * Custom hook for interacting with the Schedule API
 */
export function useScheduleApi(): UseScheduleApiReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduledDays, setScheduledDays] = useState<ScheduledDayOff[]>([]);

  /**
   * Fetch scheduled days with optional month/year filters
   */
  const fetchScheduledDays = async (month?: number, year?: number): Promise<ScheduledDayOff[]> => {
    setLoading(true);
    setError(null);

    try {
      let url = '/api/schedule';
      const params = new URLSearchParams();
      
      if (month !== undefined) {
        params.append('month', month.toString());
      }
      
      if (year !== undefined) {
        params.append('year', year.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch scheduled days');
      }
      
      setScheduledDays(result.data);
      return result.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch scheduled days';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new scheduled day off
   */
  const createScheduledDay = async (
    date: string,
    reason: string,
    description?: string
  ): Promise<ScheduleApiResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          reason,
          description,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create scheduled day');
      }
      
      // Refresh the list
      await fetchScheduledDays();
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create scheduled day';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a scheduled day off by ID
   */
  const deleteScheduledDay = async (id: string): Promise<ScheduleApiResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/schedule?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete scheduled day');
      }
      
      // Refresh the list
      await fetchScheduledDays();
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete scheduled day';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply a scheduled day off to all students
   */
  const applyToAllStudents = async (dayOffId: string): Promise<ScheduleApiResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/schedule/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dayOffId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to apply scheduled day to all students');
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to apply scheduled day';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    scheduledDays,
    fetchScheduledDays,
    createScheduledDay,
    deleteScheduledDay,
    applyToAllStudents,
  };
}
