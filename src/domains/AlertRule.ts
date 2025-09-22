/**
 * AlertRule defines thresholds for triggering attendance alerts.
 * Used to notify teachers when students exceed absence or lateness limits.
 * 
 * Example: Standard Alert Rule
 * - id: "standard-alerts"
 * - name: "Standard Attendance Alerts"
 * - maxAbsences: 5 (alert after 5 absences in period)
 * - maxLateArrivals: 8 (alert after 8 late arrivals in period)
 * - periodDays: 30 (evaluate over 30-day rolling window)
 * - isActive: true
 */
export interface AlertRule {
  /** Unique identifier for this alert rule */
  readonly id: string;
  
  /** Human-readable name for this alert rule */
  readonly name: string;
  
  /** Maximum number of absences before triggering an alert */
  readonly maxAbsences: number;
  
  /** Maximum number of late arrivals before triggering an alert */
  readonly maxLateArrivals: number;
  
  /** Number of days to evaluate (rolling window) */
  readonly periodDays: number;
  
  /** Whether this alert rule is currently active */
  readonly isActive: boolean;
}
