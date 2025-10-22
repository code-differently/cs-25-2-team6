'use client';

import { useState } from 'react';

export interface RAGQueryResult {
  query: string;
  answer: string; // Updated from interpretation
  data?: any;
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
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`Failed to process query: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log("API response data:", data);
      
      if (data.success) {
        const queryResult: RAGQueryResult = {
          query: query.trim(),
          answer: data.answer || 'Query processed successfully',
          data: data.data,
          suggestedActions: data.suggestedActions,
          confidence: data.confidence,
          success: true
        };
        
        setResults(queryResult);
        onResults?.(queryResult);
      } else {
        console.error("API returned success=false:", data);
        setError(data.error || 'Failed to process query');
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
    <div className={`${className} font-mono bg-black p-4 rounded-md border border-gray-800 shadow-lg`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-xs text-gray-500">attendance-query-terminal</div>
        <div className="w-4"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-2">
        <div className="flex items-center text-green-400">
          <span className="mr-2 font-bold">$</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none border-0 text-green-400 placeholder-gray-500"
            disabled={loading}
            autoFocus
          />
          {loading && (
            <div className="animate-pulse ml-2">
              <span className="text-gray-400">Processing...</span>
            </div>
          )}
        </div>
      </form>

      {error && (
        <div className="mb-2 text-red-500">
          <span className="text-red-500 font-bold">ERROR: </span>
          <span>{error}</span>
        </div>
      )}

      {results && (
        <div className="mt-2 font-mono">
          {/* Show the original query echoed back */}
          <div className="text-green-400">
            <span className="mr-1 opacity-50">{`>`}</span>
            <span className="opacity-70">Query: {results.query}</span>
          </div>
          
          {/* Show the answer */}
          <div className="mt-2 mb-4 text-white whitespace-pre-line">
            {results.answer}
          </div>
          
          {/* Show data as json output */}
          {results.data && (
            <div className="mb-4">
              <div className="text-yellow-400 text-sm">DATA:</div>
              <pre className="text-green-300 text-xs overflow-auto mt-1 max-h-56 p-2 bg-gray-800 border border-gray-700 rounded">
                {JSON.stringify(results.data, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Show suggested actions as command suggestions */}
          {results.suggestedActions && results.suggestedActions.length > 0 && (
            <div className="mt-4">
              <div className="text-yellow-400 text-sm">SUGGESTED COMMANDS:</div>
              <div className="mt-1 space-y-1">
                {results.suggestedActions.map((action, index) => (
                  <div 
                    key={index} 
                    className="text-blue-400 cursor-pointer hover:underline"
                    onClick={() => console.log('Action clicked:', action)}
                  >
                    $ {action.label}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Command prompt for next query */}
          <div className="mt-4 text-gray-400">
            <button
              onClick={clearResults}
              className="text-gray-400 hover:text-white underline"
            >
              [Clear and start new query]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
