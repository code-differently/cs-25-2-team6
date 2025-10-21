'use client';

interface QuerySuggestionsProps {
  onSelectQuery: (query: string) => void;
  className?: string;
}

const SUGGESTED_QUERIES = [
  {
    category: "Student Attendance",
    queries: [
      "Show me students with attendance below 90%",
      "Who was absent yesterday?",
      "Which students are frequently late?",
      "List students with perfect attendance this month"
    ]
  },
  {
    category: "Time-based Analysis", 
    queries: [
      "Show attendance trends for this week",
      "Compare attendance between this month and last month",
      "What days have the highest absence rates?",
      "Show me attendance patterns for today"
    ]
  },
  {
    category: "Status Reports",
    queries: [
      "How many students were present today?",
      "Show me all excused absences this week",
      "Which students had early dismissals?",
      "Generate a summary report for this month"
    ]
  }
];

export default function QuerySuggestions({ onSelectQuery, className = '' }: QuerySuggestionsProps) {
  return (
    <div className={`bg-white rounded-lg border shadow-sm p-4 ${className}`}>
      <h4 className="font-medium text-gray-900 mb-3">Query Suggestions</h4>
      <p className="text-sm text-gray-600 mb-4">
        Click on any suggestion below to try it out, or type your own question
      </p>
      
      <div className="space-y-4">
        {SUGGESTED_QUERIES.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h5 className="text-sm font-medium text-gray-700 mb-2">{category.category}</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {category.queries.map((query, queryIndex) => (
                <button
                  key={queryIndex}
                  onClick={() => onSelectQuery(query)}
                  className="text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-md transition-colors"
                >
                  "{query}"
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Query Tips</h5>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Use natural language - ask questions as you would to a person</li>
          <li>• Be specific about time ranges (today, this week, last month)</li>
          <li>• Mention specific students by name if needed</li>
          <li>• Ask for summaries, trends, or comparisons</li>
        </ul>
      </div>
    </div>
  );
}
