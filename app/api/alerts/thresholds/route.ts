import { NextRequest, NextResponse } from 'next/server';
import { AlertService } from '../../../../src/services/AlertService';
import { AlertThreshold, AlertType, AlertPeriod } from '../../../../src/domains/AlertThreshold';
import { FileAlertRepo } from '../../../../src/persistence/FileAlertRepo';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists for thresholds
const dataPath = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

// Ensure thresholds file exists
const thresholdsFilePath = path.join(dataPath, 'alert_thresholds.json');
if (!fs.existsSync(thresholdsFilePath)) {
  fs.writeFileSync(thresholdsFilePath, JSON.stringify([]), 'utf8');
}

// Initialize services
const alertService = new AlertService();
const alertRepo = new FileAlertRepo();

/**
 * GET /api/alerts/thresholds
 * Get alert thresholds with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const typeStr = searchParams.get('type');
    const type = typeStr ? typeStr as AlertType : null;
    
    let thresholds;
    
    if (studentId) {
      // Get thresholds for a specific student
      thresholds = alertRepo.getThresholdsByStudent(studentId);
    } else if (type) {
      // Get thresholds by type
      thresholds = alertRepo.getThresholdsByType(type);
    } else {
      // Get all thresholds
      thresholds = alertRepo.getAllThresholds();
    }
    
    return NextResponse.json({
      success: true,
      data: thresholds,
    });
  } catch (error) {
    console.error('Error getting thresholds:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get thresholds' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts/thresholds
 * Create or update an alert threshold
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, count, period, studentId, notifyParents, id } = body;
    
    // Validate required fields
    if (!type || count === undefined || !period) {
      return NextResponse.json(
        { success: false, error: 'Type, count, and period are required' },
        { status: 400 }
      );
    }
    
    // Check if valid values for type and period
    if (!Object.values(AlertType).includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid alert type: ${type}` },
        { status: 400 }
      );
    }
    
    if (!Object.values(AlertPeriod).includes(period)) {
      return NextResponse.json(
        { success: false, error: `Invalid period: ${period}` },
        { status: 400 }
      );
    }
    
    let threshold;
    
    if (id) {
      // Update existing threshold
      threshold = alertRepo.getThresholdById(id);
      
      if (!threshold) {
        return NextResponse.json(
          { success: false, error: `Threshold with ID ${id} not found` },
          { status: 404 }
        );
      }
      
      threshold.update({
        count,
        notifyParents: notifyParents ?? threshold.notifyParents
      });
    } else {
      // Create new threshold
      threshold = AlertThreshold.createNew(
        type,
        count,
        period,
        studentId || null,
        notifyParents || false
      );
    }
    
    // Validate and save threshold
    const valid = alertService.saveThreshold(threshold);
    
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid threshold settings' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: threshold,
      message: id ? 'Threshold updated successfully' : 'Threshold created successfully',
    });
  } catch (error) {
    console.error('Error saving threshold:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save threshold' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/alerts/thresholds
 * Delete an alert threshold
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Threshold ID parameter is required' },
        { status: 400 }
      );
    }
    
    // Check if threshold exists
    const threshold = alertRepo.getThresholdById(id);
    
    if (!threshold) {
      return NextResponse.json(
        { success: false, error: `Threshold with ID ${id} not found` },
        { status: 404 }
      );
    }
    
    // Delete threshold
    const success = alertRepo.deleteThreshold(id);
    
    return NextResponse.json({
      success,
      message: success ? 'Threshold deleted successfully' : 'Failed to delete threshold',
    });
  } catch (error) {
    console.error('Error deleting threshold:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete threshold' },
      { status: 500 }
    );
  }
}
