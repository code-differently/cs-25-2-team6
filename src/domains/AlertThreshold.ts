/**
 * Types of alerts that can be monitored
 */
export enum AlertType {
  ABSENCE = 'ABSENCE',
  LATENESS = 'LATENESS',
  CUMULATIVE = 'CUMULATIVE'
}

/**
 * Time periods for alert monitoring
 */
export enum AlertPeriod {
  THIRTY_DAYS = 'THIRTY_DAYS',  // Rolling 30-day window
  CUMULATIVE = 'CUMULATIVE'     // All-time cumulative count
}

/**
 * Represents a configurable threshold for attendance alerts
 * Used to determine when alerts should be triggered based on absence/lateness counts
 */
export class AlertThreshold {
  /**
   * Creates a new AlertThreshold
   * 
   * @param id Unique identifier for the threshold
   * @param type Type of attendance issue to monitor (absence, lateness, or cumulative)
   * @param count Number of occurrences that triggers an alert
   * @param period Time period to consider (30 days or cumulative)
   * @param studentId Optional ID of specific student this threshold applies to (null means global)
   * @param notifyParents Whether to notify parents when threshold is reached
   * @param createdAt Creation timestamp
   * @param updatedAt Last update timestamp
   */
  constructor(
    public readonly id: string,
    public type: AlertType,
    public count: number,
    public period: AlertPeriod,
    public studentId: string | null = null,  // null means global threshold
    public notifyParents: boolean = false,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  /**
   * Factory method to create a new AlertThreshold with a generated ID
   */
  static createNew(
    type: AlertType,
    count: number,
    period: AlertPeriod,
    studentId: string | null = null,
    notifyParents: boolean = false
  ): AlertThreshold {
    return new AlertThreshold(
      `thresh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      count,
      period,
      studentId,
      notifyParents
    );
  }

  /**
   * Update the threshold settings
   */
  update(params: {
    count?: number;
    notifyParents?: boolean;
  }): void {
    if (params.count !== undefined) {
      this.count = params.count;
    }
    
    if (params.notifyParents !== undefined) {
      this.notifyParents = params.notifyParents;
    }
    
    this.updatedAt = new Date();
  }
}

/**
 * Result of threshold validation
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Threshold effectiveness tracking
 */
export interface ThresholdEffectiveness {
  thresholdId: string;
  alertsTriggered: number;
  falsePositives: number;
  interventionsSuccessful: number;
  averageResolutionDays: number;
  lastEvaluated: Date;
}

/**
 * Threshold comparison for optimization
 */
export interface ThresholdComparison {
  originalThreshold: AlertThreshold;
  proposedChanges: Partial<{
    count: number;
    period: AlertPeriod;
    notifyParents: boolean;
  }>;
  expectedImpact: {
    alertsReduced: number;
    alertsIncreased: number;
    effectivenessScore: number;
  };
}

/**
 * Threshold conflict detection
 */
export interface ThresholdConflict {
  thresholdId: string;
  conflictType: 'duplicate' | 'overlapping' | 'contradictory';
  conflictingThresholdId: string;
  severity: 'warning' | 'error';
  resolution: string;
}
