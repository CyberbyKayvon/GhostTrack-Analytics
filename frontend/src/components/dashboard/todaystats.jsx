import React, { useMemo } from 'react';
import { Calendar, TrendingUp, Eye, Users, MousePointer, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TodayStats = ({ events, stats }) => {
  // Calculate today's stats
  const todayStats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let todayEvents = 0;
    let todayPageviews = 0;
    let todayClicks = 0;
    const todayVisitors = new Set();

    events.forEach(event => {
      try {
        let eventDate;
        if (event.timestamp.endsWith('Z') || event.timestamp.includes('+')) {
          eventDate = new Date(event.timestamp);
        } else {
          eventDate = new Date(event.timestamp + 'Z');
        }

        if (eventDate >= todayStart) {
          todayEvents++;

          if (event.event_type === 'pageview') {
            todayPageviews++;
          }

          if (event.event_type === 'click') {
            todayClicks++;
          }

          // Track unique visitors
          if (event.session_id) {
            todayVisitors.add(event.session_id);
          }
        }
      } catch (e) {
        console.error('Error processing event:', e);
      }
    });

    return {
      events: todayEvents,
      pageviews: todayPageviews,
      clicks: todayClicks,
      visitors: todayVisitors.size
    };
  }, [events]);

  // Prepare weekly chart data
  const weeklyChartData = useMemo(() => {
    if (!events || events.length === 0) return [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Build 7-day window
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayStart);
      date.setDate(todayStart.getDate() - i);

      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      days.push({
        dayName,
        events: 0,
        isToday: i === 0,
        date: new Date(date)
      });
    }

    // Count events per day
    events.forEach(event => {
      try {
        let eventDate;
        if (event.timestamp.endsWith('Z') || event.timestamp.includes('+')) {
          eventDate = new Date(event.timestamp);
        } else {
          eventDate = new Date(event.timestamp + 'Z');
        }

        const eventDayStart = new Date(
          eventDate.getFullYear(),
          eventDate.getMonth(),
          eventDate.getDate()
        );

        const matchingDay = days.find(d =>
          d.date.getTime() === eventDayStart.getTime()
        );

        if (matchingDay) {
          matchingDay.events++;
        }
      } catch (e) {
        // Skip invalid events
      }
    });

    return days;
  }, [events]);

  const totalWeekEvents = weeklyChartData.reduce((sum, d) => sum + d.events, 0);

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col" style={{ height: '500px' }}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-purple-500" />
          Today's Activity
        </h3>
        <div className="text-xs text-gray-500">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Today's Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {/* Total Events */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-purple-600 font-medium">Events</div>
            <TrendingUp className="w-3 h-3 text-purple-500" />
          </div>
          <div className="text-4xl font-bold text-purple-700 leading-none">{todayStats.events}</div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-blue-600 font-medium">Visitors</div>
            <Users className="w-3 h-3 text-blue-500" />
          </div>
          <div className="text-4xl font-bold text-blue-700 leading-none">{todayStats.visitors}</div>
        </div>

        {/* Pageviews */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-green-600 font-medium">Pages</div>
            <Eye className="w-3 h-3 text-green-500" />
          </div>
          <div className="text-4xl font-bold text-green-700 leading-none">{todayStats.pageviews}</div>
        </div>

        {/* Clicks */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-orange-600 font-medium">Clicks</div>
            <MousePointer className="w-3 h-3 text-orange-500" />
          </div>
          <div className="text-4xl font-bold text-orange-700 leading-none">{todayStats.clicks}</div>
        </div>
      </div>

      {/* Weekly Chart Section */}
      <div className="flex-1 bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-gray-700">Last 7 Days</h4>
          <div className="text-xs text-gray-500">
            Total: <span className="font-semibold text-purple-600">{totalWeekEvents}</span>
          </div>
        </div>

        {weeklyChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={150}>
            <BarChart
              data={weeklyChartData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="dayName"
                stroke="#9ca3af"
                style={{ fontSize: '10px' }}
                tick={{ fill: '#6b7280' }}
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
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                formatter={(value) => [`${value} events`, 'Events']}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const isToday = payload[0].payload.isToday;
                    return `${payload[0].payload.dayName}${isToday ? ' (Today)' : ''}`;
                  }
                  return label;
                }}
              />
              <Bar
                dataKey="events"
                radius={[4, 4, 0, 0]}
                maxBarSize={35}
              >
                {weeklyChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isToday ? '#8b5cf6' : '#c4b5fd'}
                    opacity={entry.isToday ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[150px] flex items-center justify-center text-gray-400 text-sm">
            No data for chart
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayStats;