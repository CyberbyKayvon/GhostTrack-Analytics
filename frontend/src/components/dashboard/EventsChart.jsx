import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const EventsChart = ({ data }) => {
  const chartData = useMemo(() => {
    console.log('=== CHART DEBUG START ===');
    console.log('Total events received:', data?.length);

    if (!data || data.length === 0) {
      console.log('No data provided');
      return [];
    }

    // Get current local date
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    console.log('\n📅 Today:', todayStart.toDateString());

    // Build 7-day window (last 6 days + today)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayStart);
      date.setDate(todayStart.getDate() - i);

      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      days.push({
        dayName,
        monthDay,
        events: 0,
        isToday: i === 0,
        date: new Date(date) // Store full date for comparison
      });
    }

    console.log('\n📊 Chart window:');
    days.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.dayName} ${d.monthDay}${d.isToday ? ' ← TODAY' : ''}`);
    });

    // Count events per day
    console.log('\n🔍 Counting events...');
    let matched = 0;
    let unmatched = 0;

    data.forEach((event, idx) => {
      try {
        // Parse timestamp - handle UTC
        let eventDate;
        if (event.timestamp.endsWith('Z') || event.timestamp.includes('+')) {
          eventDate = new Date(event.timestamp);
        } else {
          eventDate = new Date(event.timestamp + 'Z');
        }

        // Get event's local date (year-month-day only)
        const eventDayStart = new Date(
          eventDate.getFullYear(),
          eventDate.getMonth(),
          eventDate.getDate()
        );

        // Find matching day
        const matchingDay = days.find(d =>
          d.date.getTime() === eventDayStart.getTime()
        );

        if (matchingDay) {
          matchingDay.events++;
          matched++;
          if (idx < 5) {
            console.log(`  ✅ Event ${idx}: ${eventDayStart.toDateString()} → ${matchingDay.dayName}`);
          }
        } else {
          unmatched++;
          if (idx < 5) {
            console.log(`  ❌ Event ${idx}: ${eventDayStart.toDateString()} → OUTSIDE RANGE`);
          }
        }
      } catch (e) {
        console.error('Error:', e);
      }
    });

    console.log(`\n📈 Results: ${matched} in range, ${unmatched} outside`);
    console.log('\n📊 Events per day:');
    days.forEach(d => {
      console.log(`  ${d.dayName}: ${d.events} events`);
    });
    console.log('=== CHART DEBUG END ===\n');

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
          Total: <span className="font-semibold">{data?.length || 0}</span> events
        </span>
        <span className={`font-semibold ${totalInRange > 0 ? 'text-green-600' : 'text-orange-600'}`}>
          (<span className="font-bold">{totalInRange}</span> in last 7 days)
        </span>
      </div>

      <div className="flex-1" style={{ minHeight: '280px' }}>
        {data && data.length > 0 ? (
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
                    const isToday = payload[0].payload.isToday;
                    return `${payload[0].payload.day}, ${payload[0].payload.dateStr}${isToday ? ' (Today)' : ''}`;
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
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No events recorded yet.
          </div>
        )}
      </div>

      {totalInRange === 0 && data && data.length > 0 && (
        <div className="mt-2 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded p-2">
          ⚠️ All events are older than 7 days. Open console (F12) to see event dates.
        </div>
      )}
    </div>
  );
};

export default EventsChart;