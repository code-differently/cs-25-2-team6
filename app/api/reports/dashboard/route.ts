import { NextRequest, NextResponse } from 'next/server';
import { ReportService } from '../../../../src/services/ReportService';

export const runtime = 'nodejs';

/**
 * Get dashboard summary data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse time period (default to '30days')
    const period = searchParams.get('period') || '30days';
    const includeComparative = searchParams.get('includeComparative') === 'true';
    
    const reportService = new ReportService();
    const dashboardData = await reportService.generateDashboardSummary({
      relativePeriod: period as any
    });
    
    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
