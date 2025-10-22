/**
 * API endpoint for processing natural language queries about attendance and alerts.
 */
import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '../../../../src/services/RAGService';

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
    
    return NextResponse.json({
      success: true,
      query: query,
      answer: response.naturalLanguageAnswer,
      data: response.structuredData,
      suggestedActions: response.actions,
      confidence: response.confidence
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
