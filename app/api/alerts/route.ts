import { NextRequest, NextResponse } from 'next/server';
import { AlertService } from '../../../src/services/AlertService';
import { AlertFilters, AlertStatus } from '../../../src/domains/AttendanceAlert';
import { FileAlertRepo } from '../../../src/persistence/FileAlertRepo';
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
const alertRepo = new FileAlertRepo();

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
    // Default to ACTIVE alerts if no status is specified
    if (!filters.status) {
      filters.status = [AlertStatus.ACTIVE];
    }
    
    const alerts = alertRepo.getFilteredAlerts(filters);
    
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
    // For now, just return a message - this endpoint would need to be implemented
    // with actual alert processing logic
    return NextResponse.json({
      success: true,
      data: {
        processed: 0,
        triggered: 0,
        notificationsSent: 0,
        errors: []
      },
      message: 'Alert processing is not implemented in this version',
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
    
    // Get the alert, mark it as dismissed, and save it
    const allAlerts = alertRepo.getAllAlerts();
    const alert = allAlerts.find(a => a.id === alertId);
    
    if (!alert) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }
    
    alert.dismiss();
    alertRepo.saveAlert(alert);
    const success = true;
    
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
