import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EventsChart = ({ data }) => {
  // Ensure we always have data to display
  const displayData = data && data.length > 0 ? data : [
    { time: '0:00', events: 0 },
    { time: '6:00', events: 0 },
    { time: '12:00', events: 0 },
    { time: '18:00', events: 0 },
    { time: '24:00', events: 0 }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Events Over Time</h3>
      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="time"
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#666"
              style={{ fontSize: '12px' }}
              allowDecimals={false}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '8px'
              }}
            />
            <Line
              type="monotone"
              dataKey="events"
              stroke="#667eea"
              strokeWidth={3}
              dot={{ fill: '#667eea', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EventsChart;