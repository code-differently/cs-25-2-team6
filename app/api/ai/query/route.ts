/**
 * API endpoint for processing natural language queries about attendance and alerts.
 */
import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '../../../../src/services/RAGService';
import { formatAlertsTable, formatStudentAttendanceTable, formatDataTable } from '../../../../src/utils/terminal-formatter';

export const runtime = 'nodejs';

/**
 * POST /api/ai/query
 * Process a natural language query and return structured response
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { query } = body;
    
    console.log('API received query:', query);
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }
    
    // Process the query
    const ragService = new RAGService();
    console.log('Calling RAGService.processQuery...');
    
    const response = await ragService.processQuery(query);
    
    // Log the full response for debugging
    console.log(`[API] RAG response confidence: ${response.confidence}`);
    
    // Use validator to ensure high quality responses
    let processedResponse = response;
    try {
      // Import validator dynamically to avoid circular dependencies
      const { validateAndFixRagResponse } = require('../../../../src/utils/rag-validator');
      
      // Validate and fix the response if needed
      const validatedResponse = validateAndFixRagResponse(response, {
        autoFix: true,
        throwOnError: false,
        logValidation: true
      });
      
      // Cast to any to access the _validation property safely
      const validatedResponseWithMeta = validatedResponse as any;
      processedResponse = validatedResponse;
      
      // If validation fixed the confidence, use that
      if (validatedResponseWithMeta._validation?.applied && 
          (processedResponse.confidence === 0 || processedResponse.confidence === undefined)) {
        // Set a reasonable default confidence if it's still zero
        processedResponse.confidence = processedResponse.confidence || 0.7;
      }
    } catch (validationError) {
      console.error('[API] Validation error:', validationError);
      // Continue with the original response if validation fails
    }
    
    return NextResponse.json({
      success: true,
      query: query,
      answer: processedResponse.naturalLanguageAnswer,
      data: processedResponse.structuredData,
      suggestedActions: processedResponse.actions,
      confidence: processedResponse.confidence || 0.7, // Ensure we always have a confidence value
      formattedData: (() => {
        const d = processedResponse.structuredData;
        if (d?.alerts && Array.isArray(d.alerts)) return formatAlertsTable(d.alerts);
        if (d?.students && Array.isArray(d.students)) return formatStudentAttendanceTable(d.students);
        if (d?.student) return formatStudentAttendanceTable([d.student]);
        if (Array.isArray(d) && d.length > 0 && (d[0].type || d[0].studentId)) return formatAlertsTable(d);
        if (Array.isArray(d)) {
          // Build columns config from keys of first object
          const keys = Object.keys(d[0] || {});
          const columns = keys.reduce((acc, key) => {
            acc[key] = { header: key.toUpperCase(), width: Math.max(10, key.length + 2), key };
            return acc;
          }, {} as Record<string, { header: string; width: number; key: string; }>);
          return formatDataTable(d, columns);
        }
        return d ? JSON.stringify(d, null, 2) : '';
      })()
    });
    
  } catch (error) {
    console.error('Error processing query:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to process query: ${errorMessage}`,
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
