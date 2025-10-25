import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { analyticsAPI } from '../../services/api';

const TrafficSources = () => {
  const [data, setData] = useState([
    { name: 'Direct', value: 0, color: '#667eea' },
    { name: 'Organic Search', value: 0, color: '#48bb78' },
    { name: 'Social Media', value: 0, color: '#ed8936' },
    { name: 'Referral', value: 0, color: '#4299e1' }
  ]);

  useEffect(() => {
    fetchTrafficSources();
    const interval = setInterval(fetchTrafficSources, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrafficSources = async () => {
    try {
      const response = await analyticsAPI.getTrafficSources();
      if (response.data.sources) {
        setData(response.data.sources);
      }
    } catch (error) {
      console.error('Error fetching traffic sources:', error);
    }
  };

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Show placeholder if no data
  const hasData = total > 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">🌐 Traffic Sources</h3>
      {hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => {
                const percent = ((value / total) * 100).toFixed(0);
                return `${name} ${percent}%`;
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} visits`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-lg">No traffic data yet</p>
            <p className="text-sm mt-2">Data will appear as visitors arrive</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafficSources;