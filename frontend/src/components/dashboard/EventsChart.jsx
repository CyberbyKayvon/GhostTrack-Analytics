import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EventsChart = ({ data }) => {
  // Generate last 7 days with actual data
  const getLast7DaysWithData = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create array for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toISOString().split('T')[0];

      days.push({
        day: dayName,
        fullDate: date,
        dateStr: dateStr,
        events: 0
      });
    }

    // Count events for each day
    if (data && Array.isArray(data)) {
      data.forEach(event => {
        try {
          const eventDate = new Date(event.timestamp);
          eventDate.setHours(0, 0, 0, 0);

          const dayData = days.find(d => {
            const dayTime = new Date(d.fullDate).getTime();
            const eventTime = eventDate.getTime();
            return dayTime === eventTime;
          });

          if (dayData) {
            dayData.events++;
          }
        } catch (e) {
          console.error('Error processing event:', e);
        }
      });
    }

    return days.map(d => ({ day: d.day, events: d.events }));
  };

  const chartData = getLast7DaysWithData();

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Events Last 7 Days</h3>
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="day"
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#666"
              style={{ fontSize: '12px' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '8px'
              }}
            />
            <Bar
              dataKey="events"
              fill="#667eea"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EventsChart;