import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EventsChart = ({ data }) => {
  // Generate last 7 days
  const getLast7Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toISOString().split('T')[0];
      days.push({ day: dayName, date: dateStr, events: 0 });
    }

    return days;
  };

  // Count events per day
  const chartData = getLast7Days();

  if (data && data.length > 0) {
    data.forEach(event => {
      try {
        const eventDate = new Date(event.timestamp || event.date);
        const dateStr = eventDate.toISOString().split('T')[0];
        const dayData = chartData.find(d => d.date === dateStr);
        if (dayData) {
          dayData.events++;
        }
      } catch (e) {
        console.error('Error processing event date:', e);
      }
    });
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Events Last 7 Days</h3>
      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
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
              labelFormatter={(value, payload) => {
                if (payload && payload[0]) {
                  return `${payload[0].payload.day}`;
                }
                return value;
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