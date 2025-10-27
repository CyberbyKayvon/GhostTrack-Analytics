import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Globe } from 'lucide-react';
import { analyticsAPI } from '../../services/api';

const TrafficSources = ({ siteId }) => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (siteId) {
      fetchTrafficSources();
      const interval = setInterval(fetchTrafficSources, 10000);
      return () => clearInterval(interval);
    }
  }, [siteId]);

  const fetchTrafficSources = async () => {
    try {
      const response = await analyticsAPI.getTrafficSources(siteId);
      setSources(response.data.sources || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching traffic sources:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#667eea', '#48bb78', '#ed8936', '#4299e1'];

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Globe className="w-6 h-6 mr-2 text-blue-500" />
          Traffic Sources
        </h3>
        <div className="text-center py-8 text-gray-400">
          Loading traffic data...
        </div>
      </div>
    );
  }

  const total = sources.reduce((sum, source) => sum + source.value, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-[300px] flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Globe className="w-6 h-6 mr-2 text-blue-500" />
        Traffic Sources
      </h3>

      {total === 0 ? (
        <div className="text-center py-8 text-gray-400 flex-1 flex items-center justify-center">
          No traffic data available yet.
        </div>
      ) : (
        <div className="flex items-center justify-between flex-1">
          {/* Pie Chart - Smaller */}
          <div className="w-2/5">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={sources}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} visits`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend - Horizontal Layout */}
          <div className="w-3/5 grid grid-cols-2 gap-3">
            {sources.map((source, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700 truncate">{source.name}</div>
                  <div className="text-xs text-gray-500">
                    {source.value} ({total > 0 ? Math.round((source.value / total) * 100) : 0}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafficSources;