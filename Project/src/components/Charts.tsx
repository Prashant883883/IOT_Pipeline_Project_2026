'use client';

interface BarChartProps {
  title: string;
  data: { label: string; value: number }[];
  color?: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
  height?: number;
}

export function BarChart({
  title,
  data,
  color = 'blue',
  height = 250,
}: BarChartProps) {
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
  };

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div style={{ height }}>
        <div className="flex items-end justify-around h-full gap-2">
          {data.map((item) => {
            const percentage = item.value === 0 ? 0 : (item.value / maxValue) * 100;
            const barHeight = Math.max(percentage, item.value > 0 ? 8 : 0);
            
            return (
              <div
                key={item.label}
                className="flex flex-col items-center flex-1"
              >
                <div
                  className={`w-full ${colorMap[color]} rounded-t transition-all hover:opacity-80`}
                  style={{
                    height: `${barHeight}%`,
                  }}
                  title={`${item.label}: ${item.value}`}
                />
                <p className="text-xs text-gray-600 mt-2 text-center truncate w-full">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface LineChartProps {
  title: string;
  data: { x: string; y: number }[];
  height?: number;
}

export function LineChart({ title, data, height = 250 }: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div
          style={{ height }}
          className="flex items-center justify-center bg-gray-50 rounded"
        >
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.y), 1);
  const minValue = Math.min(...data.map((d) => d.y), 0);
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div style={{ height }} className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full w-12 text-xs text-gray-500 flex flex-col justify-between">
          <span>{Math.round(maxValue)}</span>
          <span>{Math.round((minValue + maxValue) / 2)}</span>
          <span>{Math.round(minValue)}</span>
        </div>

        {/* Chart area */}
        <div className="ml-12 relative h-full border-l border-b border-gray-300 flex items-end">
          {data.map((point, index) => {
            const normalizedY = (point.y - minValue) / range;
            const nextPoint = data[index + 1];
            const nextNormalizedY = nextPoint
              ? (nextPoint.y - minValue) / range
              : normalizedY;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center justify-end relative group"
              >
                {/* Line to next point */}
                {nextPoint && (
                  <svg
                    className="absolute bottom-0 left-0 w-full h-full pointer-events-none"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="50%"
                      y1={`${(1 - normalizedY) * 100}%`}
                      x2="100%"
                      y2={`${(1 - nextNormalizedY) * 100}%`}
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                  </svg>
                )}

                {/* Point */}
                <div
                  className="w-3 h-3 bg-blue-500 rounded-full absolute cursor-pointer hover:w-4 hover:h-4 hover:bg-blue-600 transition-all"
                  style={{
                    bottom: `${normalizedY * 100}%`,
                  }}
                />

                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {point.y}
                </div>

                {/* X-axis label */}
                <p className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                  {point.x}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface PieChartProps {
  title: string;
  data: { label: string; value: number; color: string }[];
}

export function PieChart({ title, data }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  let cumulativePercent = 0;
  const segments = data.map((item) => {
    const percent = (item.value / total) * 100;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    return {
      ...item,
      percent,
      startPercent,
    };
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center justify-between">
        {/* Pie chart */}
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {segments.map((segment, index) => {
              const startAngle = (segment.startPercent / 100) * 360;
              const endAngle = ((segment.startPercent + segment.percent) / 100) * 360;
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              const x1 = 50 + 40 * Math.cos(startRad);
              const y1 = 50 + 40 * Math.sin(startRad);
              const x2 = 50 + 40 * Math.cos(endRad);
              const y2 = 50 + 40 * Math.sin(endRad);

              const largeArc = segment.percent > 50 ? 1 : 0;

              const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

              return (
                <path
                  key={index}
                  d={path}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="1"
                  className="hover:opacity-80 transition-opacity"
                />
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="ml-6 space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-700">
                {segment.label} ({Math.round(segment.percent)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'purple';
}

export function StatCard({
  title,
  value,
  change,
  icon,
  color = 'blue',
}: StatCardProps) {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <p
              className={`text-sm font-medium mt-2 ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorMap[color]}`}>{icon}</div>
        )}
      </div>
    </div>
  );
}

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  label: string;
}

export function TrendIndicator({ trend, label }: TrendIndicatorProps) {
  const trendMap = {
    up: { icon: '↑', color: 'text-green-600', bg: 'bg-green-50' },
    down: { icon: '↓', color: 'text-red-600', bg: 'bg-red-50' },
    stable: { icon: '→', color: 'text-gray-600', bg: 'bg-gray-50' },
  };

  const { icon, color, bg } = trendMap[trend];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${bg}`}>
      <span className={`font-bold ${color}`}>{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}
