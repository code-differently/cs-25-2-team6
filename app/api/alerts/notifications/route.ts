import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../../src/services/NotificationService';
import { FileAlertRepo } from '../../../../src/persistence/FileAlertRepo';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists for notifications
const dataPath = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

// Ensure notifications file exists
const notificationsFilePath = path.join(dataPath, 'notifications.json');
if (!fs.existsSync(notificationsFilePath)) {
  fs.writeFileSync(notificationsFilePath, JSON.stringify([]), 'utf8');
}

// Initialize services
const notificationService = new NotificationService();
const alertRepo = new FileAlertRepo();

/**
 * GET /api/alerts/notifications
 * Get notifications with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    
    const notifications = notificationService.getNotifications({
      parentId,
      studentId,
      status
    });
    
    return NextResponse.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts/notifications
 * Send a notification to parents
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, parentIds, message, sendEmail = false, sendSMS = false } = body;
    
    // Validate required fields
    if (!alertId || !parentIds || !Array.isArray(parentIds)) {
      return NextResponse.json(
        { success: false, error: 'Alert ID and parent IDs array are required' },
        { status: 400 }
      );
    }
    
    // Get the alert to notify about
    const alert = alertRepo.getAlertById(alertId);
    
    if (!alert) {
      return NextResponse.json(
        { success: false, error: `Alert with ID ${alertId} not found` },
        { status: 404 }
      );
    }
    
    // Send the notification
    const results = await notificationService.sendNotification({
      alert,
      parentIds,
      customMessage: message,
      sendEmail,
      sendSMS
    });
    
    return NextResponse.json({
      success: true,
      data: results,
      message: 'Notifications sent successfully',
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/alerts/notifications
 * Update notification status (read/unread)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, status } = body;
    
    if (!notificationId || !status) {
      return NextResponse.json(
        { success: false, error: 'Notification ID and status are required' },
        { status: 400 }
      );
    }
    
    const success = notificationService.updateNotificationStatus(notificationId, status);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: `Notification with ID ${notificationId} not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification status updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification status' },
      { status: 500 }
    );
  }
}
