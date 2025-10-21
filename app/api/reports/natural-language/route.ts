import { NextRequest, NextResponse } from 'next/server';
import { ReportService } from '../../../../src/services/ReportService';

export const runtime = 'nodejs';

/**
 * Process natural language queries for reports
 */
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Query is required'
      }, { status: 400 });
    }
    
    const reportService = new ReportService();
    const result = await reportService.generateNaturalLanguageReport(query);
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Natural language API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Query processing failed'
    }, { status: 500 });
  }
}
