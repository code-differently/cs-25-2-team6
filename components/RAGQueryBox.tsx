'use client';

import { useState } from 'react';
import './RAGQueryBox.css';

export interface RAGQueryResult {
  query: string;
  answer: string; // Updated from interpretation
  data?: any;
  formattedData?: string; // Formatted version of data for terminal display
  suggestedActions?: Array<{
    type: string;
    label: string;
    params?: Record<string, any>;
  }>;
  confidence?: number;
  success: boolean;
}

interface RAGQueryBoxProps {
  onResults?: (results: RAGQueryResult) => void;
  className?: string;
  placeholder?: string;
}

export default function RAGQueryBox({ 
  onResults, 
  className = '', 
  placeholder = 'Ask about attendance alerts or interventions...'
}: RAGQueryBoxProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RAGQueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Submitting query:", query.trim());
      
      // Add timeout handling for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setError("Request timed out. Please try again with a simpler query.");
        setLoading(false);
      }, 30000); // 30 second timeout
      
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // We'll always expect a 200 status even for error responses now
      const data = await response.json();
      
      console.log("API response data:", data);
      
      if (data.success) {
        const queryResult: RAGQueryResult = {
          query: query.trim(),
          answer: data.answer || 'Query processed successfully',
          data: data.data,
          formattedData: data.formattedData,
          suggestedActions: data.suggestedActions,
          confidence: data.confidence,
          success: true
        };
        
        setResults(queryResult);
        onResults?.(queryResult);
      } else {
        console.error("API returned success=false:", data);
        
        // Use the friendly error message or answer if provided
        const errorMessage = data.answer || data.error || 'Failed to process query';
        
        // Instead of setting error, let's create a "fake" successful response that contains the error message
        const errorResult: RAGQueryResult = {
          query: query.trim(),
          answer: errorMessage,
          confidence: data.confidence || 0,
          success: false
        };
        
        setResults(errorResult);
        onResults?.(errorResult);
      }
    } catch (err) {
      console.error("Error processing query:", err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
    setQuery('');
  };

  return (
    <div className={`${className} font-mono bg-white p-4 rounded-md border border-gray-300 shadow-lg`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-xs text-gray-800 font-semibold">attendance-query-terminal</div>
        <div className="w-4"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-2">
        <div className="flex items-center text-black">
          <span className="mr-2 font-bold text-black">$</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none border-0 text-black placeholder-black placeholder-opacity-60"
            disabled={loading}
            autoFocus
          />
          {loading && (
            <div className="animate-pulse ml-2">
              <span className="text-gray-800">Processing...</span>
            </div>
          )}
        </div>
      </form>

      {error && (
        <div className="mb-2 text-red-600">
          <span className="text-red-600 font-bold">ERROR: </span>
          <span>{error}</span>
        </div>
      )}

      {results && (
        <div className="mt-2 font-mono">
          {/* Show the original query echoed back */}
          <div className="text-blue-600">
            <span className="mr-1 opacity-60">{`>`}</span>
            <span className="opacity-80">Query: {results.query}</span>
          </div>
          
          {/* Show the answer */}
          <div className="mt-2 mb-4 text-black whitespace-pre-line font-medium">
            {results.answer}
          </div>
          
          {/* Show data as formatted output */}
          {results.data && (
            <div className="mb-4">
              <div className="text-blue-700 text-sm font-bold">DATA:</div>
              <pre 
                className="text-black text-xs overflow-auto mt-1 max-h-56 p-2 bg-gray-100 border border-gray-300 rounded font-mono terminal-output"
                dangerouslySetInnerHTML={{ 
                  __html: results.formattedData || JSON.stringify(results.data, null, 2)
                }}
              ></pre>
            </div>
          )}
          
          {/* Show suggested actions as command suggestions */}
          {results.suggestedActions && results.suggestedActions.length > 0 && (
            <div className="mt-4">
              {/* Show confidence level */}
              {results.confidence !== undefined && (
                <div className={`mb-2 text-sm font-medium ${
                  results.confidence > 0.8 ? 'text-green-600' : 
                  results.confidence > 0.5 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  Confidence: {Math.round(results.confidence * 100)}%
                </div>
              )}
              
              <div className="text-blue-700 text-sm font-bold">SUGGESTED ACTIONS:</div>
              <div className="mt-1 space-y-1">
                {results.suggestedActions && results.suggestedActions.map((action, index) => (
                  <div 
                    key={index} 
                    className="text-blue-600 cursor-pointer hover:text-blue-800 hover:underline"
                    onClick={() => console.log('Action clicked:', action)}
                  >
                    → {action.label}
                  </div>
                ))}
                {(!results.suggestedActions || results.suggestedActions.length === 0) && (
                  <div className="text-gray-500 italic">No suggested actions</div>
                )}
              </div>
            </div>
          )}
          
          {/* Command prompt for next query */}
          <div className="mt-4">
            <button
              onClick={clearResults}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              [Clear and start new query]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
