import React from 'react';

interface SummaryCardData {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

interface ReportSummaryCardsProps {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
  previousPeriodRate?: number;
  isLoading?: boolean;
}

// Simple SVG Icon Components
const TrendingUp: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDown: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const Users: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const Clock: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircle: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertCircle: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Simple UI Components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`} style={{ color: '#1F2937', marginTop: '32px' }}>
    {children}
  </h3>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none';
  
  const variantClasses = {
    default: 'border-transparent bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
    destructive: 'border-transparent bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 text-gray-900 hover:bg-gray-50'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({
  totalStudents,
  presentCount,
  absentCount,
  lateCount,
  attendanceRate,
  previousPeriodRate,
  isLoading = false
}) => {
  const calculateTrend = (current: number, previous?: number) => {
    if (!previous || previous === 0) return undefined;
    const change = current - previous;
    return {
      value: Math.abs(change),
      type: change >= 0 ? ('increase' as const) : ('decrease' as const),
      period: 'vs last period'
    };
  };

  // Add safety checks for undefined values
  const safeAttendanceRate = attendanceRate ?? 0;
  const safeTotalStudents = totalStudents ?? 0;
  const safePresentCount = presentCount ?? 0;
  const safeAbsentCount = absentCount ?? 0;
  const safeLateCount = lateCount ?? 0;

  const summaryCards: SummaryCardData[] = [
    {
      title: 'Total Students',
      value: safeTotalStudents,
      icon: <Users className="text-purple-600" size={500} />,
      trend: 'neutral'
    },
    {
      title: 'Present Today',
      value: safePresentCount,
      icon: <CheckCircle className="text-purple-600" size={500} />,
      trend: 'up'
    },
    {
      title: 'Absent Today',
      value: safeAbsentCount,
      icon: <AlertCircle className="text-purple-600" size={500} />,
      trend: safeTotalStudents > 0 && safeAbsentCount > (safeTotalStudents * 0.1) ? 'down' : 'neutral'
    },
    {
      title: 'Late Arrivals',
      value: safeLateCount,
      icon: <Clock className="text-purple-600" size={500} />,
      trend: safeTotalStudents > 0 && safeLateCount > (safeTotalStudents * 0.05) ? 'down' : 'neutral'
    },
    {
      title: 'Attendance Rate',
      value: `${safeAttendanceRate.toFixed(1)}%`,
      change: calculateTrend(safeAttendanceRate, previousPeriodRate),
      icon: <TrendingUp className="text-purple-600" size={500} />,
      trend: safeAttendanceRate >= 90 ? 'up' : safeAttendanceRate >= 75 ? 'neutral' : 'down'
    }
  ];

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {summaryCards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{card.value}</div>
              {card.change && (
                <Badge 
                  variant={card.change.type === 'increase' ? 'default' : 'secondary'}
                  className={getTrendColor(card.trend)}
                >
                  {getTrendIcon(card.trend)}
                  {card.change.value.toFixed(1)}%
                </Badge>
              )}
            </div>
            {card.change && (
              <p className="text-xs text-gray-500 mt-1">
                {card.change.period}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReportSummaryCards;