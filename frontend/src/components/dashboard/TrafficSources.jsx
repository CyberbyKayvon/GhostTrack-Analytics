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

  // Always show all 4 sources in legend, even if value is 0
  const allSources = [
    { name: 'Direct', color: '#667eea' },
    { name: 'Organic Search', color: '#48bb78' },
    { name: 'Social Media', color: '#ed8936' },
    { name: 'Referral', color: '#4299e1' }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">🌐 Traffic Sources</h3>
      {hasData ? (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={false}
              outerRadius={90}
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
              height={60}
              formatter={(value, entry) => {
                const item = data.find(d => d.name === value);
                const percent = item ? ((item.value / total) * 100).toFixed(0) : 0;
                return `${value} (${percent}%)`;
              }}
              wrapperStyle={{
                paddingTop: '20px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[350px] flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-lg">No traffic data yet</p>
            <p className="text-sm mt-2">Data will appear as visitors arrive</p>
            <div className="mt-4 space-y-1">
              {allSources.map((source) => (
                <div key={source.name} className="flex items-center justify-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <span>{source.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafficSources;