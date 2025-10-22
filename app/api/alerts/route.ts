import { NextRequest, NextResponse } from 'next/server';
import { AlertService } from '../../../src/services/AlertService';
import { AlertFilters } from '../../../src/domains/AttendanceAlert';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists for alerts
const dataPath = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

// Ensure alert files exist
const alertsFilePath = path.join(dataPath, 'alerts.json');
const thresholdsFilePath = path.join(dataPath, 'alert_thresholds.json');

if (!fs.existsSync(alertsFilePath)) {
  fs.writeFileSync(alertsFilePath, JSON.stringify([]), 'utf8');
}

if (!fs.existsSync(thresholdsFilePath)) {
  fs.writeFileSync(thresholdsFilePath, JSON.stringify([]), 'utf8');
}

// Initialize services
const alertService = new AlertService();

/**
 * GET /api/alerts
 * Get alerts with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters from query params
    const filters: AlertFilters = {};
    
    const studentId = searchParams.get('studentId');
    if (studentId) {
      filters.studentId = studentId;
    }
    
    const status = searchParams.get('status');
    if (status) {
      filters.status = status.split(',') as any[];
    }
    
    const type = searchParams.get('type');
    if (type) {
      filters.type = type.split(',') as any[];
    }
    
    const period = searchParams.get('period');
    if (period) {
      filters.period = period as any;
    }
    
    const dateFrom = searchParams.get('dateFrom');
    if (dateFrom) {
      filters.dateFrom = new Date(dateFrom);
    }
    
    const dateTo = searchParams.get('dateTo');
    if (dateTo) {
      filters.dateTo = new Date(dateTo);
    }
    
    // Get alerts requiring intervention
    const alerts = await alertService.getAlertsRequiringIntervention(filters);
    
    return NextResponse.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error('Error getting alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get alerts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts/process
 * Process automatic alerts
 */
export async function POST(request: NextRequest) {
  try {
    const result = await alertService.processAutomaticAlerts();
    
    return NextResponse.json({
      success: result.errors.length === 0,
      data: result,
      message: `Processed ${result.processed} alerts, triggered ${result.triggered}, sent ${result.notificationsSent} notifications`,
    });
  } catch (error) {
    console.error('Error processing alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process alerts' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/alerts
 * Dismiss an alert
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');
    
    if (!alertId) {
      return NextResponse.json(
        { success: false, error: 'Alert ID parameter is required' },
        { status: 400 }
      );
    }
    
    const success = alertService.dismissAlert(alertId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Alert not found or could not be dismissed' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Alert dismissed successfully',
    });
  } catch (error) {
    console.error('Error dismissing alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to dismiss alert' },
      { status: 500 }
    );
  }
}
