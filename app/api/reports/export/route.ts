import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ReportService } from '../../../../src/services/ReportService';
import { AttendanceStatus } from '../../../../src/domains/AttendanceStatus';

export const runtime = 'nodejs';
// Export format validation
const ExportFormatSchema = z.enum(['csv', 'json', 'pdf']);


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { format, filters = {}, options = {} } = body;
    
    
    const validatedFormat = ExportFormatSchema.parse(format);
    
    const reportService = new ReportService();
    const exportData = await reportService.exportReport({ filters }, validatedFormat, options);
    
    return new NextResponse(exportData.data as string, {
      status: 200,
      headers: {
        'Content-Type': exportData.mimeType,
        'Content-Disposition': `attachment; filename="${exportData.filename}"`
      }
    });
    
  } catch (error) {
    console.error('Export API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid format specified',
        details: error.issues
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Export failed'
    }, { status: 500 });
  }
}

/**

 * Export reports with query parameters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse format
    const format = searchParams.get('format') || 'json';
    const validatedFormat = ExportFormatSchema.parse(format);
    
    // Parsing filters
    const filters: any = {};
    if (searchParams.get('studentName')) filters.studentName = searchParams.get('studentName');
    if (searchParams.get('dateFrom')) filters.dateFrom = searchParams.get('dateFrom');
    if (searchParams.get('dateTo')) filters.dateTo = searchParams.get('dateTo');
    if (searchParams.get('status')) filters.status = searchParams.get('status') as AttendanceStatus;
    if (searchParams.get('relativePeriod')) filters.relativePeriod = searchParams.get('relativePeriod');
    
    const reportService = new ReportService();
    const exportData = await reportService.exportReport({ filters }, validatedFormat);
    
    return new NextResponse(exportData.data as string, {
      status: 200,
      headers: {
        'Content-Type': exportData.mimeType,
        'Content-Disposition': `attachment; filename="${exportData.filename}"`
      }
    });
    
  } catch (error) {
    console.error('Export GET error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Export failed'
    }, { status: 500 });
  }
}

function getContentType(format: string): string {
  switch (format) {
    case 'csv':
      return 'text/csv';
    case 'pdf':
      return 'application/pdf';
    case 'json':
    default:
      return 'application/json';
  }
}
