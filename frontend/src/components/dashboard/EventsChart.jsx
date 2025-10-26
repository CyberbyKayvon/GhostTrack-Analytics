import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const EventsChart = ({ data }) => {
  const chartData = useMemo(() => {
    console.log('=== CHART DEBUG START ===');
    console.log('Total events:', data?.length);

    if (!data || data.length === 0) {
      console.log('No data provided');
      return [];
    }

    // Show sample of event timestamps
    console.log('Sample timestamps:', data.slice(0, 3).map(e => ({
      timestamp: e.timestamp,
      parsed: new Date(e.timestamp).toString()
    })));

    // Create 7 days - SIMPLIFIED
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);

      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      days.push({
        dayName,
        monthDay,
        events: 0,
        isToday: i === 0,
        // Store just the date string for comparison (YYYY-MM-DD)
        dateStr: date.toISOString().split('T')[0]
      });
    }

    console.log('Chart days:', days.map(d => `${d.dayName} (${d.dateStr})`));

    // Count events - MUCH SIMPLER matching
    let matched = 0;
    let unmatched = 0;

    data.forEach((event, idx) => {
      try {
        const eventDate = new Date(event.timestamp);
        const eventDateStr = eventDate.toISOString().split('T')[0];

        const day = days.find(d => d.dateStr === eventDateStr);

        if (day) {
          day.events++;
          matched++;
        } else {
          unmatched++;
          if (idx < 5) {
            console.log(`Event ${idx} (${eventDateStr}) not in range`);
          }
        }
      } catch (e) {
        console.error('Error processing event:', e);
      }
    });

    console.log(`Matched: ${matched}, Unmatched: ${unmatched}`);
    console.log('Events by day:', days.map(d => `${d.dayName}: ${d.events}`));
    console.log('=== CHART DEBUG END ===');

    return days.map(d => ({
      day: d.dayName,
      dateStr: d.monthDay,
      events: d.events,
      isToday: d.isToday
    }));
  }, [data]);

  const totalInRange = chartData.reduce((sum, d) => sum + d.events, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
        <span className="mr-2">📊</span>
        Events Last 7 Days
      </h3>

      <div className="text-xs text-gray-500 mb-4 flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
          📍 Today: {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </span>
        <span className="text-gray-600">
          Total: {data?.length || 0} events
        </span>
        <span className={`font-semibold ${totalInRange > 0 ? 'text-green-600' : 'text-red-600'}`}>
          ({totalInRange} in last 7 days)
        </span>
        {totalInRange === 0 && data && data.length > 0 && (
          <span className="text-red-600 text-xs">
            ⚠️ All events are older than 7 days! Check console.
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
                  return `${payload[0].payload.day}, ${payload[0].payload.dateStr}`;
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
          No events recorded yet.
        </div>
      )}
    </div>
  );
};

export default EventsChart;