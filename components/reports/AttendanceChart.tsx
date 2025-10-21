import React, { useMemo, useState, useEffect, useRef, useContext, createContext } from 'react';
import { AttendanceRecord } from './AttendanceDataTable';

export type ChartType = 'line' | 'bar' | 'pie' | 'area';

interface ChartData {
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  rate: number;
}

interface AttendanceChartProps {
  data: AttendanceRecord[];
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Simple Card Components
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
  <h3 className={`text-lg font-semibold ${className}`}  style={{ color: '#1F2937' }}>
    {children}
  </h3>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// Simple Select Components
const ChevronDown: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

const SelectContext = createContext<{
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div ref={selectRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const context = useContext(SelectContext);
  if (!context) return null;

  return (
    <button
      type="button"
      onClick={() => context.setIsOpen(!context.isOpen)}
      className={`
        w-full h-10 px-3 py-2 
        flex items-center justify-between 
        border border-gray-300 rounded-md 
        bg-white text-sm text-gray-900 
        hover:bg-gray-50 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        transition-all duration-200
        ${className}
      `}
    >
      {children}
      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${context.isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = useContext(SelectContext);
  if (!context || !context.isOpen) return null;

  return (
    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
      {children}
    </div>
  );
};

const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => {
  const context = useContext(SelectContext);
  if (!context) return null;

  const isSelected = context.value === value;

  return (
    <div
      onClick={() => {
        context.onValueChange(value);
        context.setIsOpen(false);
      }}
      className={`
        px-3 py-2 text-sm cursor-pointer 
        hover:bg-gray-100 
        first:rounded-t-md last:rounded-b-md
        ${isSelected ? 'bg-blue-50 text-blue-900 font-medium' : 'text-gray-900'}
      `}
    >
      {children}
    </div>
  );
};

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const context = useContext(SelectContext);
  if (!context) return null;

  return (
    <span className={context.value ? 'text-gray-900' : 'text-gray-400'}>
      {context.value || placeholder || 'Select an option'}
    </span>
  );
};

export const AttendanceChart: React.FC<AttendanceChartProps> = ({
  data,
  chartType,
  onChartTypeChange,
  dateRange
}) => {
  const processedData = useMemo(() => {
    const dailyStats = new Map<string, ChartData>();

    data.forEach(record => {
      const date = record.date;
      
      if (!dailyStats.has(date)) {
        dailyStats.set(date, {
          date,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0,
          rate: 0
        });
      }

      const dayData = dailyStats.get(date)!;
      dayData[record.status]++;
      dayData.total++;
    });

    // Calculate attendance rates
    dailyStats.forEach(dayData => {
      dayData.rate = dayData.total > 0 ? ((dayData.present + dayData.late) / dayData.total) * 100 : 0;
    });

    return Array.from(dailyStats.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);

  const renderAttendanceChart = (chartData: ChartData[], type: ChartType) => {
    if (chartData.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center text-gray-500">
          No data available for the selected period
        </div>
      );
    }

    const maxValue = Math.max(1, ...chartData.map(d => d.total)); // Ensure minimum value of 1
    
    switch (type) {
      case 'line':
        return (
          <div className="h-80 relative">
            <svg className="w-full h-full" viewBox="0 0 800 300">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(y => (
                <line
                  key={y}
                  x1="60"
                  y1={60 + (100 - y) * 1.8}
                  x2="740"
                  y2={60 + (100 - y) * 1.8}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
              
              {/* Attendance rate line */}
              {chartData.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  points={chartData.map((d, i) => 
                    `${60 + (i * 680 / (chartData.length - 1))},${60 + (100 - d.rate) * 1.8}`
                  ).join(' ')}
                />
              )}
              
              {/* Data points */}
              {chartData.map((d, i) => (
                <circle
                  key={i}
                  cx={chartData.length === 1 ? 400 : 60 + (i * 680 / (chartData.length - 1))}
                  cy={60 + (100 - d.rate) * 1.8}
                  r="4"
                  fill="#3b82f6"
                  className="cursor-pointer"
                  style={{ transition: 'r 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.setAttribute('r', '6'); }}
                  onMouseLeave={(e) => { e.currentTarget.setAttribute('r', '4'); }}
                >
                  <title>{`${new Date(d.date).toLocaleDateString()}: ${d.rate.toFixed(1)}%`}</title>
                </circle>
              ))}
              
              {/* Y-axis labels */}
              {[0, 25, 50, 75, 100].map(y => (
                <text
                  key={y}
                  x="50"
                  y={65 + (100 - y) * 1.8}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {y}%
                </text>
              ))}
              
              {/* X-axis labels */}
              {chartData.map((d, i) => {
                if (chartData.length <= 6 || i % Math.ceil(chartData.length / 6) === 0) {
                  return (
                    <text
                      key={i}
                      x={chartData.length === 1 ? 400 : 60 + (i * 680 / (chartData.length - 1))}
                      y="280"
                      textAnchor="middle"
                      fontSize="12"
                      fill="#6b7280"
                    >
                      {new Date(d.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </text>
                  );
                }
                return null;
              })}
            </svg>
          </div>
        );

      case 'bar':
        return (
          <div className="h-80 relative">
            <svg className="w-full h-full" viewBox="0 0 800 300">
              {/* Grid lines */}
              {Array.from({ length: 6 }, (_, i) => {
                const y = (maxValue / 5) * i;
                return (
                  <line
                    key={i}
                    x1="60"
                    y1={240 - (y / maxValue) * 180}
                    x2="740"
                    y2={240 - (y / maxValue) * 180}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                );
              })}
              
              {/* Bars */}
              {chartData.map((d, i) => {
                const barWidth = Math.max(10, (680 / chartData.length) * 0.6);
                const x = 60 + (i * 680 / chartData.length) + (680 / chartData.length - barWidth) / 2;
                
                let stackY = 240;
                const segments = [
                  { value: d.present, color: '#10b981', label: 'Present' },
                  { value: d.late, color: '#f59e0b', label: 'Late' },
                  { value: d.excused, color: '#3b82f6', label: 'Excused' },
                  { value: d.absent, color: '#ef4444', label: 'Absent' }
                ];
                
                return (
                  <g key={i}>
                    {segments.map((segment, j) => {
                      if (segment.value === 0) return null;
                      const height = (segment.value / maxValue) * 180;
                      stackY -= height;
                      return (
                        <rect
                          key={j}
                          x={x}
                          y={stackY}
                          width={barWidth}
                          height={height}
                          fill={segment.color}
                          className="cursor-pointer"
                          style={{ opacity: 1, transition: 'opacity 0.2s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                        >
                          <title>{`${new Date(d.date).toLocaleDateString()}: ${segment.label} - ${segment.value}`}</title>
                        </rect>
                      );
                    })}
                  </g>
                );
              })}
              
              {/* Y-axis labels */}
              {Array.from({ length: 6 }, (_, i) => {
                const y = Math.round((maxValue / 5) * i);
                return (
                  <text
                    key={i}
                    x="50"
                    y={245 - (y / maxValue) * 180}
                    textAnchor="end"
                    fontSize="12"
                    fill="#6b7280"
                  >
                    {y}
                  </text>
                );
              })}
              
              {/* X-axis labels */}
              {chartData.map((d, i) => {
                if (chartData.length <= 6 || i % Math.ceil(chartData.length / 6) === 0) {
                  return (
                    <text
                      key={i}
                      x={60 + (i * 680 / chartData.length) + (680 / chartData.length) / 2}
                      y="260"
                      textAnchor="middle"
                      fontSize="12"
                      fill="#6b7280"
                    >
                      {new Date(d.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </text>
                  );
                }
                return null;
              })}
            </svg>
          </div>
        );

      case 'pie':
        const latestData = chartData[chartData.length - 1];
        if (!latestData || latestData.total === 0) {
          return <div className="h-80 flex items-center justify-center text-gray-500">No data available</div>;
        }
        
        const total = latestData.total;
        const segments = [
          { label: 'Present', value: latestData.present, color: '#10b981' },
          { label: 'Late', value: latestData.late, color: '#f59e0b' },
          { label: 'Excused', value: latestData.excused, color: '#3b82f6' },
          { label: 'Absent', value: latestData.absent, color: '#ef4444' }
        ].filter(s => s.value > 0);
        
        let cumulativeAngle = 0;
        const radius = 80;
        const centerX = 150;
        const centerY = 150;
        
        return (
          <div className="h-80 flex items-center">
            <svg className="w-80 h-80" viewBox="0 0 300 300">
              {segments.map((segment, i) => {
                const angle = (segment.value / total) * 2 * Math.PI;
                const startAngle = cumulativeAngle;
                const endAngle = cumulativeAngle + angle;
                
                const x1 = centerX + radius * Math.cos(startAngle);
                const y1 = centerY + radius * Math.sin(startAngle);
                const x2 = centerX + radius * Math.cos(endAngle);
                const y2 = centerY + radius * Math.sin(endAngle);
                
                const largeArcFlag = angle > Math.PI ? 1 : 0;
                
                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                
                cumulativeAngle += angle;
                
                return (
                  <path
                    key={i}
                    d={pathData}
                    fill={segment.color}
                    className="cursor-pointer"
                    style={{ opacity: 1, transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    <title>{`${segment.label}: ${segment.value} (${((segment.value / total) * 100).toFixed(1)}%)`}</title>
                  </path>
                );
              })}
            </svg>
            
            <div className="ml-8 space-y-3">
              {segments.map((segment, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <span className="text-sm text-gray-700">
                    {segment.label}: {segment.value} ({((segment.value / total) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'area':
        return (
          <div className="h-80 relative">
            <svg className="w-full h-full" viewBox="0 0 800 300">
              <defs>
                <linearGradient id={`areaGradient-${Math.random()}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(y => (
                <line
                  key={y}
                  x1="60"
                  y1={60 + (100 - y) * 1.8}
                  x2="740"
                  y2={60 + (100 - y) * 1.8}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
              
              {/* Area fill */}
              {chartData.length > 0 && (
                <path
                  d={`M 60,240 ${chartData.map((d, i) => 
                    `L ${chartData.length === 1 ? 400 : 60 + (i * 680 / (chartData.length - 1))},${60 + (100 - d.rate) * 1.8}`
                  ).join(' ')} L ${chartData.length === 1 ? 400 : 740},240 Z`}
                  fill={`url(#areaGradient-${Math.random()})`}
                  opacity="0.6"
                />
              )}
              
              {/* Line */}
              {chartData.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  points={chartData.map((d, i) => 
                    `${60 + (i * 680 / (chartData.length - 1))},${60 + (100 - d.rate) * 1.8}`
                  ).join(' ')}
                />
              )}
              
              {/* Y-axis labels */}
              {[0, 25, 50, 75, 100].map(y => (
                <text
                  key={y}
                  x="50"
                  y={65 + (100 - y) * 1.8}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {y}%
                </text>
              ))}
              
              {/* X-axis labels */}
              {chartData.map((d, i) => {
                if (chartData.length <= 6 || i % Math.ceil(chartData.length / 6) === 0) {
                  return (
                    <text
                      key={i}
                      x={chartData.length === 1 ? 400 : 60 + (i * 680 / (chartData.length - 1))}
                      y="280"
                      textAnchor="middle"
                      fontSize="12"
                      fill="#6b7280"
                    >
                      {new Date(d.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </text>
                  );
                }
                return null;
              })}
            </svg>
          </div>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Attendance Analysis</CardTitle>
          <Select value={chartType} onValueChange={(value) => onChartTypeChange(value as ChartType)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {dateRange && (
          <p className="text-sm text-gray-600">
            {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {processedData.length > 0 ? (
          renderAttendanceChart(processedData, chartType)
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No data available for the selected period
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;