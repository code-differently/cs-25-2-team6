'use client';

import { useState } from 'react';

interface RAGQueryResult {
  query: string;
  interpretation: string;
  summary: string;
  insights: string[];
  data?: any;
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
      const response = await fetch('/api/reports/natural-language', {
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
          interpretation: data.data.interpretation || 'Query processed successfully',
          summary: data.data.summary || 'Results generated based on your query',
          insights: data.data.insights || [],
          data: data.data
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
    <div className={`bg-white rounded-lg border shadow-sm p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ask About Attendance Data
        </h3>
        <p className="text-sm text-gray-600">
          Ask natural language questions about attendance patterns, student data, or generate reports
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about attendance... (e.g., 'Show students absent this week')"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Ask'}
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
              <p className="text-sm font-medium text-gray-700">Interpretation:</p>
              <p className="text-sm text-gray-900">{results.interpretation}</p>
            </div>

            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700">Summary:</p>
              <p className="text-sm text-gray-900">{results.summary}</p>
            </div>

            {results.insights && results.insights.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Key Insights:</p>
                <ul className="text-sm text-gray-900 space-y-1">
                  {results.insights.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
