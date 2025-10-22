import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ReportService } from '../../../src/services/ReportService';
import { AttendanceStatus } from '../../../src/domains/AttendanceStatus';

// Validation schemas
const ReportRequestSchema = z.object({
  filters: z.object({
    studentIds: z.array(z.string()).optional(),
    studentName: z.string().optional(),
    lastName: z.string().optional(),
    grades: z.array(z.string()).optional(),
    classIds: z.array(z.string()).optional(),
    dateISO: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    relativePeriod: z.enum(['today', 'week', 'month', 'quarter', '7days', '30days', '90days', 'semester', 'year']).optional(),
    status: z.nativeEnum(AttendanceStatus).optional(),
    statuses: z.array(z.nativeEnum(AttendanceStatus)).optional(),
    includeExcused: z.boolean().optional(),
    onlyLate: z.boolean().optional(),
    onlyEarlyDismissal: z.boolean().optional()
  }).optional().default({}),
  aggregations: z.object({
    includeCount: z.boolean().optional(),
    includePercentage: z.boolean().optional(),
    includeStreaks: z.boolean().optional(),
    includeTrends: z.boolean().optional(),
    includeComparative: z.boolean().optional()
  }).optional(),
  sorting: z.object({
    sortBy: z.enum(['name', 'date', 'status', 'attendanceRate', 'class', 'totalDays']),
    sortOrder: z.enum(['asc', 'desc'])
  }).optional(),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1).max(1000)
  }).optional(),
  useCache: z.boolean().optional().default(true)
});

export const runtime = 'nodejs';

/**
 
 * Generate comprehensive attendance reports with filtering, aggregation, and insights
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validatedRequest = ReportRequestSchema.parse(body);
    
    // Generate report
    const reportService = new ReportService();
    const result = await reportService.generateComprehensiveReport(validatedRequest);
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Report generation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request format',
        details: error.issues
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

/**
 
 * Get a simple report with query parameters (for quick dashboard access)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters: any = {};
    
    if (searchParams.get('studentName')) {
      filters.studentName = searchParams.get('studentName');
    }
    
    if (searchParams.get('relativePeriod')) {
      filters.relativePeriod = searchParams.get('relativePeriod');
    }
    
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') as AttendanceStatus;
    }
    
    if (searchParams.get('dateFrom')) {
      filters.dateFrom = searchParams.get('dateFrom');
    }
    
    if (searchParams.get('dateTo')) {
      filters.dateTo = searchParams.get('dateTo');
    }
    
    // Build request
    const reportRequest = {
      filters,
      aggregations: {
        includeCount: true,
        includePercentage: true,
        includeComparative: searchParams.get('includeComparative') === 'true'
      },
      useCache: searchParams.get('useCache') !== 'false'
    };
    
    // Generate report
    const reportService = new ReportService();
    const result = await reportService.generateComprehensiveReport(reportRequest);
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Report GET error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
