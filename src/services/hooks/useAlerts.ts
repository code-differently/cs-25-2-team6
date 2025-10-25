import { useState, useEffect, useCallback } from 'react';

export interface AttendanceAlert {
  id: string;
  studentId: string;
  studentName: string;
  type: 'absence' | 'tardy' | 'pattern' | 'chronic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  triggerDate: Date;
  status: 'active' | 'resolved' | 'acknowledged';
  interventions: Intervention[];
  metadata: {
    absenceCount?: number;
    tardyCount?: number;
    consecutiveDays?: number;
    attendanceRate?: number;
  };
}

export interface Intervention {
  id: string;
  type: 'email' | 'phone' | 'meeting' | 'letter';
  date: Date;
  notes: string;
  followUpRequired: boolean;
  assignedTo: string;
}

export interface AlertFilters {
  severity?: string[];
  type?: string[];
  status?: string[];
  dateRange?: { start: Date; end: Date };
  studentSearch?: string;
}

export interface SortCriteria {
  field: 'severity' | 'date' | 'student' | 'type';
  direction: 'asc' | 'desc';
}

export interface AlertAction {
  type: 'acknowledge' | 'resolve' | 'assign' | 'delete';
  data?: any;
}

export function useAlerts(filters: AlertFilters = {}) {
  const [alerts, setAlerts] = useState<AttendanceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>({
    field: 'severity',
    direction: 'desc'
  });

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual implementation
      const mockAlerts: AttendanceAlert[] = [
        {
          id: '1',
          studentId: 'S001',
          studentName: 'John Smith',
          type: 'chronic',
          severity: 'critical',
          description: 'Chronic absenteeism - 15 days in last month',
          triggerDate: new Date(),
          status: 'active',
          interventions: [],
          metadata: { absenceCount: 15, attendanceRate: 65 }
        },
        // Add more mock data as needed
      ];
      
      setAlerts(mockAlerts);
      setError(null);
    } catch (err) {
      setError('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleAlertSort = useCallback((criteria: SortCriteria) => {
    setSortCriteria(criteria);
    setAlerts(prev => sortAlertsBySeverity([...prev], criteria));
  }, []);

  const handleAlertFilter = useCallback((filterType: string, value: any) => {
    // Implement filtering logic
    fetchAlerts();
  }, [fetchAlerts]);

  const sortAlertsBySeverity = (alertsToSort: AttendanceAlert[], criteria?: SortCriteria) => {
    const sortField = criteria?.field || sortCriteria.field;
    const direction = criteria?.direction || sortCriteria.direction;
    
    return alertsToSort.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
        case 'date':
          comparison = a.triggerDate.getTime() - b.triggerDate.getTime();
          break;
        case 'student':
          comparison = a.studentName.localeCompare(b.studentName);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return direction === 'desc' ? -comparison : comparison;
    });
  };

  const handleBulkAlertActions = useCallback(async (alertIds: string[], action: AlertAction) => {
    try {
      // Implement bulk actions
      await refreshAlertData();
    } catch (err) {
      setError('Failed to perform bulk action');
    }
  }, []);

  const refreshAlertData = useCallback(async () => {
    await fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    sortCriteria,
    handleAlertSort,
    handleAlertFilter,
    sortAlertsBySeverity,
    handleBulkAlertActions,
    refreshAlertData
  };
}