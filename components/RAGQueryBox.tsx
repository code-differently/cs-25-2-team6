'use client';

import { useState } from 'react';

interface RAGQueryResult {
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
}

export default function RAGQueryBox({ onResults, className = '' }: RAGQueryBoxProps) {
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
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to process query');
      }

      const data = await response.json();
      
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
        setError(data.error || 'Failed to process query');
      }
    } catch (err) {
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
    <div className={`bg-white rounded-lg ${className}`}>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2 items-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about attendance alerts or interventions..."
            className="flex-1 px-3 py-2 focus:outline-none focus:ring-0 border-0"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Processing...' : 'Ask AI'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {results && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-900">Query Results</h4>
            <button
              onClick={clearResults}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>

          <div className="bg-gray-50 rounded-md p-4">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700">Your Question:</p>
              <p className="text-sm text-gray-900 italic">"{results.query}"</p>
            </div>

            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700">Answer:</p>
              <p className="text-sm text-gray-900">{results.answer}</p>
            </div>

            {results.data && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Data:</p>
                <div className="overflow-auto max-h-64 bg-white border border-gray-200 rounded p-2">
                  {Array.isArray(results.data) ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        {results.data.length > 0 && (
                          <tr>
                            {Object.keys(results.data[0]).map((key) => (
                              <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {key}
                              </th>
                            ))}
                          </tr>
                        )}
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.data.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {Object.values(item).map((value, valIdx) => (
                              <td key={valIdx} className="px-3 py-2 text-xs text-gray-500">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <pre className="text-xs overflow-auto">{JSON.stringify(results.data, null, 2)}</pre>
                  )}
                </div>
              </div>
            )}

            {results.suggestedActions && results.suggestedActions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Suggested Actions:</p>
                <div className="flex flex-wrap gap-2">
                  {results.suggestedActions.map((action, index) => (
                    <button
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full border border-blue-200 hover:bg-blue-100"
                      onClick={() => console.log('Action clicked:', action)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
