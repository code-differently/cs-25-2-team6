import { NextRequest, NextResponse } from 'next/server';
import { ScheduleService } from '../../../../src/services/ScheduleService';

// Initialize services
const scheduleService = new ScheduleService();

/**
 * Apply excused absences to all students for a scheduled day off
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dateISO } = body;
    
   
    if (!dateISO) {
      return NextResponse.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      );
    }
    
    // Check if the date is scheduled as a day off
    if (!scheduleService.isPlannedDayOff(dateISO)) {
      return NextResponse.json(
        { success: false, error: 'This date is not scheduled as a day off' },
        { status: 404 }
      );
    }
    
    // Apply excused absences to all students
    const processedCount = scheduleService.applyPlannedDayOffToAllStudents(dateISO);
    
    return NextResponse.json({
      success: true,
      data: {
        processedCount,
        dateISO
      },
      message: `Successfully applied ${processedCount} excused absences`,
    });
  } catch (error) {
    console.error('Error applying bulk excused absences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to apply bulk excused absences' },
      { status: 500 }
    );
  }
}

/**
 * Check the status of bulk excuse process
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateISO = searchParams.get('dateISO');
    
    if (!dateISO) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      );
    }
    
    // Check if the date is scheduled as a day off
    if (!scheduleService.isPlannedDayOff(dateISO)) {
      return NextResponse.json(
        { success: false, error: 'This date is not scheduled as a day off' },
        { status: 404 }
      );
    }
    

    return NextResponse.json({
      success: true,
      data: {
        dateISO,
        status: 'completed'
      },
      message: 'Bulk excuse process has been completed',
    });
  } catch (error) {
    console.error('Error checking bulk excuse status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check bulk excuse status' },
      { status: 500 }
    );
  }
}
