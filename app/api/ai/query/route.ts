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
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }
    
    // Process the query
    const ragService = new RAGService();
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
    return NextResponse.json(
      { success: false, error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
