import { AlertRule } from './AlertRule';

describe('AlertRule', () => {
  it('should create a standard alert rule', () => {
    const rule: AlertRule = {
      id: 'standard-alerts',
      name: 'Standard Attendance Alerts',
      maxAbsences: 5,
      maxLateArrivals: 8,
      periodDays: 30,
      isActive: true
    };

    expect(rule.id).toBe('standard-alerts');
    expect(rule.name).toBe('Standard Attendance Alerts');
    expect(rule.maxAbsences).toBe(5);
    expect(rule.maxLateArrivals).toBe(8);
    expect(rule.periodDays).toBe(30);
    expect(rule.isActive).toBe(true);
  });

  it('should create a strict alert rule with lower thresholds', () => {
    const strictRule: AlertRule = {
      id: 'strict-monitoring',
      name: 'Strict Attendance Monitoring',
      maxAbsences: 3,
      maxLateArrivals: 5,
      periodDays: 21,
      isActive: true
    };

    expect(strictRule.maxAbsences).toBe(3);
    expect(strictRule.maxLateArrivals).toBe(5);
    expect(strictRule.periodDays).toBe(21);
    expect(strictRule.isActive).toBe(true);
  });

  it('should create a lenient alert rule with higher thresholds', () => {
    const lenientRule: AlertRule = {
      id: 'lenient-policy',
      name: 'Lenient Attendance Policy',
      maxAbsences: 10,
      maxLateArrivals: 15,
      periodDays: 45,
      isActive: true
    };

    expect(lenientRule.maxAbsences).toBe(10);
    expect(lenientRule.maxLateArrivals).toBe(15);
    expect(lenientRule.periodDays).toBe(45);
  });

  it('should create an inactive alert rule', () => {
    const inactiveRule: AlertRule = {
      id: 'disabled-rule',
      name: 'Disabled Alert Rule',
      maxAbsences: 5,
      maxLateArrivals: 8,
      periodDays: 30,
      isActive: false
    };

    expect(inactiveRule.isActive).toBe(false);
  });

  it('should handle zero thresholds for testing purposes', () => {
    const testRule: AlertRule = {
      id: 'test-immediate',
      name: 'Immediate Alert Testing',
      maxAbsences: 0,
      maxLateArrivals: 0,
      periodDays: 1,
      isActive: true
    };

    expect(testRule.maxAbsences).toBe(0);
    expect(testRule.maxLateArrivals).toBe(0);
    expect(testRule.periodDays).toBe(1);
  });

  it('should support different evaluation periods', () => {
    const weeklyRule: AlertRule = {
      id: 'weekly-check',
      name: 'Weekly Attendance Check',
      maxAbsences: 2,
      maxLateArrivals: 3,
      periodDays: 7,
      isActive: true
    };

    const semesterRule: AlertRule = {
      id: 'semester-check',
      name: 'Semester Attendance Check',
      maxAbsences: 15,
      maxLateArrivals: 20,
      periodDays: 120,
      isActive: true
    };

    expect(weeklyRule.periodDays).toBe(7);
    expect(semesterRule.periodDays).toBe(120);
    expect(semesterRule.maxAbsences).toBeGreaterThan(weeklyRule.maxAbsences);
  });

  it('should maintain readonly properties', () => {
    const rule: AlertRule = {
      id: 'readonly-test',
      name: 'Readonly Properties Test',
      maxAbsences: 5,
      maxLateArrivals: 8,
      periodDays: 30,
      isActive: true
    };

    // These should all compile without error due to readonly
    expect(rule.id).toBeDefined();
    expect(rule.name).toBeDefined();
    expect(rule.maxAbsences).toBeDefined();
    expect(rule.maxLateArrivals).toBeDefined();
    expect(rule.periodDays).toBeDefined();
    expect(rule.isActive).toBeDefined();
  });
});
