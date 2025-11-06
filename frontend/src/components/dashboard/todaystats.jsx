import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Eye, Users, MousePointer, Activity, RefreshCw, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

const TodayStats = ({ siteId }) => {
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch today's stats from dedicated endpoint
  const fetchTodayStats = async () => {
    try {
      const response = await fetch(
        `https://ghosttrack-analytics-production.up.railway.app/api/v1/analytics/today-stats?site_id=${siteId}`
      );
      const data = await response.json();
      setTodayData(data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching today stats:', error);
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTodayStats();
  }, [siteId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchTodayStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, siteId]);

  // Manual refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchTodayStats();
  };

  // Format percentage change with icon
  const ChangeIndicator = ({ value }) => {
    if (value === 0) {
      return (
        <div className="flex items-center text-gray-500 text-xs font-semibold">
          <Minus className="w-3 h-3 mr-1" />
          0%
        </div>
      );
    }

    const isPositive = value > 0;
    return (
      <div className={`flex items-center text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
        {Math.abs(value)}%
      </div>
    );
  };

  if (loading && !todayData) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-center" style={{ height: '550px' }}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
          <div className="text-gray-500 text-sm">Loading today's activity...</div>
        </div>
      </div>
    );
  }

  if (!todayData) {
    return <div className="bg-white p-6 rounded-xl shadow-lg">Unable to load stats</div>;
  }

  const { today, yesterday, hourly_breakdown } = todayData;

  // Convert UTC hour to local hour
  const utcToLocalHour = (utcHour) => {
    // Create a date object in UTC for today at the given hour
    const now = new Date();
    const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), utcHour, 0, 0));
    // Get the local hour from that UTC date
    return utcDate.getHours();
  };

  // Convert 24-hour format to 12-hour format (e.g., 0 -> "12AM", 13 -> "1PM")
  const to12HourFormat = (hour24) => {
    const hourNum = typeof hour24 === 'string' ? parseInt(hour24.split(':')[0]) : hour24;
    if (hourNum === 0) return '12AM';
    if (hourNum < 12) return `${hourNum}AM`;
    if (hourNum === 12) return '12PM';
    return `${hourNum - 12}PM`;
  };

  // Prepare hourly chart data with LOCAL time (converted from UTC)
  const hourlyChartData = hourly_breakdown.map(hour => {
    const localHour = utcToLocalHour(hour.hour);
    const currentLocalHour = new Date().getHours();

    return {
      ...hour,
      localHour: localHour,
      time: to12HourFormat(localHour),
      isCurrentHour: localHour === currentLocalHour
    };
  });

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg flex flex-col transition-all duration-300 hover:shadow-xl" style={{ height: '500px' }}>
      {/* Header with Auto-Refresh */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-500" />
            Today's Activity
          </h3>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            {lastUpdated && (
              <span className="text-gray-400">
                • Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              autoRefresh
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}
          >
            {autoRefresh ? 'Auto ✓' : 'Manual'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors disabled:opacity-50"
            title="Refresh now"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Today's Stats Grid - Single Row of Squares */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {/* Total Events */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 rounded-lg border border-purple-200 transform transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center aspect-square">
          <Activity className="w-4 h-4 text-purple-500 mb-1" />
          <div className="text-xs text-purple-600 font-semibold mb-1">Events</div>
          <div className="text-2xl font-bold text-purple-700 leading-none">
            {today.total_events.toLocaleString()}
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 rounded-lg border border-blue-200 transform transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center aspect-square">
          <Users className="w-4 h-4 text-blue-500 mb-1" />
          <div className="text-xs text-blue-600 font-semibold mb-1">Visitors</div>
          <div className="text-2xl font-bold text-blue-700 leading-none">
            {today.unique_visitors}
          </div>
        </div>

        {/* Pageviews */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 rounded-lg border border-green-200 transform transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center aspect-square">
          <Eye className="w-4 h-4 text-green-500 mb-1" />
          <div className="text-xs text-green-600 font-semibold mb-1">Pages</div>
          <div className="text-2xl font-bold text-green-700 leading-none">
            {today.pageviews}
          </div>
        </div>

        {/* Clicks */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-2 rounded-lg border border-orange-200 transform transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center aspect-square">
          <MousePointer className="w-4 h-4 text-orange-500 mb-1" />
          <div className="text-xs text-orange-600 font-semibold mb-1">Clicks</div>
          <div className="text-2xl font-bold text-orange-700 leading-none">
            {today.clicks}
          </div>
        </div>
      </div>

      {/* Hourly Activity Chart */}
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-700 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1 text-purple-500" />
            Hourly Activity (Last 24 Hours)
          </h4>
          <div className="text-xs text-gray-600">
            Live updates every 30s
          </div>
        </div>

        <ResponsiveContainer width="100%" height={140}>
          <LineChart
            data={hourlyChartData}
            margin={{ top: 0, right: 5, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              style={{ fontSize: '10px' }}
              tick={{ fill: '#6b7280' }}
              interval={2}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '10px' }}
              allowDecimals={false}
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              formatter={(value, name) => {
                if (name === 'events') return [value, 'Events'];
                if (name === 'visitors') return [value, 'Visitors'];
                return [value, name];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const isCurrentHour = payload[0].payload.isCurrentHour;
                  return `${label}${isCurrentHour ? ' (Now)' : ''}`;
                }
                return label;
              }}
            />
            <Line
              type="monotone"
              dataKey="events"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 3 }}
              activeDot={{ r: 5, fill: '#7c3aed' }}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 5, fill: '#2563eb' }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-purple-500 mr-2"></div>
            <span className="text-gray-600">Events</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-blue-500 border-dashed border-t-2 border-blue-500 mr-2"></div>
            <span className="text-gray-600">Visitors</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayStats;
