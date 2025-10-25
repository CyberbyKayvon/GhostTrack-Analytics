import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { analyticsAPI } from '../../services/api';

const TrafficSources = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchTrafficSources();
    const interval = setInterval(fetchTrafficSources, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrafficSources = async () => {
    try {
      const response = await analyticsAPI.getTrafficSources();
      if (response.data.sources) {
        // Filter out sources with 0 value
        const filteredData = response.data.sources.filter(item => item.value > 0);
        setData(filteredData);
      }
    } catch (error) {
      console.error('Error fetching traffic sources:', error);
    }
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);
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
              labelLine={true}
              label={({ name, value }) => {
                const percent = ((value / total) * 100).toFixed(0);
                return percent > 5 ? `${name} ${percent}%` : ''; // Only show label if > 5%
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${value} visits`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '8px'
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => {
                const percent = ((entry.payload.value / total) * 100).toFixed(0);
                return `${value} (${percent}%)`;
              }}
            />
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