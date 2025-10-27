import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { analyticsAPI } from '../../services/api';

const TrafficSources = ({ siteId }) => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (siteId) {
      fetchTrafficSources();
      const interval = setInterval(fetchTrafficSources, 15000);
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

  const total = sources.reduce((sum, source) => sum + source.value, 0);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col" style={{ height: '280px' }}>
        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
          Traffic Sources
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading traffic data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col" style={{ height: '280px' }}>
      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
        Traffic Sources
      </h3>

      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center py-4">
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">No Traffic Data Yet</p>
            <p className="text-gray-400 text-xs">Traffic sources will appear here</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-2">
          {sources.map((source, index) => {
            const percentage = total > 0 ? ((source.value / total) * 100).toFixed(1) : 0;

            return (
              <div key={index} className="flex items-center justify-between py-1.5">
                <div className="flex items-center space-x-2 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{source.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: source.color
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-12 text-right">
                    {percentage}%
                  </span>
                  <span className="text-xs text-gray-500 w-10 text-right">
                    ({source.value})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrafficSources;