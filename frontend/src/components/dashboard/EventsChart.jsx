import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const EventsChart = ({ data }) => {
  // Process events data to show ACTUAL last 7 days chronologically
  const chartData = useMemo(() => {
    console.log('=== EVENTS CHART DEBUG ===');
    console.log('Total events received:', data?.length);

    if (data && data.length > 0) {
      console.log('First 3 event timestamps:', data.slice(0, 3).map(e => e.timestamp));
    }

    // Get last 7 days in USER'S LOCAL timezone
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0); // Start of day

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999); // End of day

      const dayName = date.toLocaleDateString('en-US', {
        weekday: 'short'
      });

      const dateDisplay = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      last7Days.push({
        dayName: dayName,
        dateDisplay: dateDisplay,
        events: 0,
        isToday: i === 0,
        dateStart: date.getTime(),
        dateEnd: endOfDay.getTime()
      });
    }

    console.log('Chart days:', last7Days.map(d => `${d.dayName} (${d.dateDisplay})`));

    // Count events for each day
    if (data && data.length > 0) {
      data.forEach((event, index) => {
        try {
          const eventDate = new Date(event.timestamp);
          const eventTime = eventDate.getTime();

          // Find which day this event belongs to
          const dayData = last7Days.find(d => eventTime >= d.dateStart && eventTime <= d.dateEnd);

          if (dayData) {
            dayData.events++;
          } else {
            if (index < 3) { // Only log first few mismatches
              console.log('Event outside 7-day range:', event.timestamp, new Date(event.timestamp).toLocaleString());
            }
          }
        } catch (e) {
          console.error('Error processing event:', e, event);
        }
      });
    }

    // Log the final counts
    console.log('Events per day:', last7Days.map(d => `${d.dayName}: ${d.events}`));
    console.log('=== END DEBUG ===');

    return last7Days.map(day => ({
      day: day.dayName,
      dateStr: day.dateDisplay,
      events: day.events,
      isToday: day.isToday
    }));
  }, [data]);

  const totalEvents = chartData.reduce((sum, d) => sum + d.events, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
        <span className="mr-2">📊</span>
        Events Last 7 Days
      </h3>

      <div className="text-xs text-gray-500 mb-4 flex items-center gap-3">
        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
          📍 Today: {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </span>
        {data && (
          <span className="text-gray-600">
            Total: {data.length} events ({totalEvents} in last 7 days)
          </span>
        )}
      </div>

      <div className="flex-1" style={{ minHeight: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              allowDecimals={false}
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              formatter={(value) => [`${value} events`, 'Events']}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const item = payload[0].payload;
                  return `${item.day}, ${item.dateStr}`;
                }
                return label;
              }}
              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
            />
            <Bar
              dataKey="events"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isToday ? '#4f46e5' : '#a5b4fc'}
                  opacity={entry.isToday ? 1 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {(!data || data.length === 0) && (
        <div className="text-center py-4 text-gray-400 text-sm">
          No events recorded yet. Start tracking to see your activity.
        </div>
      )}
    </div>
  );
};

export default EventsChart;