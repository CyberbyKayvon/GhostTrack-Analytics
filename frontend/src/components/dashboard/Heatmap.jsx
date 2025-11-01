import React, { useState, useEffect } from 'react';
import { Flame, RefreshCw } from 'lucide-react';
import { heatmapAPI } from '../../services/api';

const HeatmapViewer = ({ siteId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchData();
  }, [siteId, days]);

  const fetchData = async () => {
    if (!siteId) return;
    try {
      setLoading(true);
      const response = await heatmapAPI.getData(siteId, { days });
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Heatmap error:', error);
      setLoading(false);
    }
  };

  // Calculate click density for each area
  const getClickDensity = () => {
    if (!data?.clicks) return [];

    const gridSize = 50;
    const density = {};

    data.clicks.forEach(click => {
      const gridX = Math.floor(click.x / gridSize);
      const gridY = Math.floor(click.y / gridSize);
      const key = `${gridX},${gridY}`;
      density[key] = (density[key] || 0) + 1;
    });

    return Object.entries(density).map(([key, count]) => {
      const [x, y] = key.split(',').map(Number);
      return { x: x * gridSize, y: y * gridSize, count };
    });
  };

  const maxClicks = Math.max(...(getClickDensity().map(d => d.count) || [1]));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flame className="text-orange-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Click Heatmap</h2>
        </div>

        <div className="flex gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
          >
            <option value={1}>Last 24 Hours</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>

          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Card */}
      {data && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200">
            <p className="text-sm font-semibold text-gray-500 mb-1">Total Clicks</p>
            <p className="text-3xl font-black text-gray-900">{data.total_clicks}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
            <p className="text-sm font-semibold text-gray-500 mb-1">Date Range</p>
            <p className="text-3xl font-black text-gray-900">{days} Days</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
            <p className="text-sm font-semibold text-gray-500 mb-1">Hotspots</p>
            <p className="text-3xl font-black text-gray-900">{getClickDensity().length}</p>
          </div>
        </div>
      )}

      {/* Visual Heatmap */}
      <div className="bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="animate-spin mx-auto mb-2 text-gray-400" size={48} />
              <p className="text-gray-500">Loading heatmap data...</p>
            </div>
          </div>
        ) : data?.clicks?.length > 0 ? (
          <div className="relative bg-white" style={{ height: '500px', width: '100%' }}>
            {/* Click dots visualization */}
            {getClickDensity().map((area, i) => {
              const intensity = area.count / maxClicks;
              const size = 20 + (intensity * 40);
              const opacity = 0.3 + (intensity * 0.7);

              return (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${(area.x / 1920) * 100}%`,
                    top: `${(area.y / 1080) * 100}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: intensity > 0.7 ? '#ef4444' :
                                   intensity > 0.4 ? '#f59e0b' :
                                   '#3b82f6',
                    opacity: opacity,
                    transform: 'translate(-50%, -50%)',
                    border: '2px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                  title={`${area.count} clicks`}
                />
              );
            })}

            {/* Grid overlay */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{
                   backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                   backgroundSize: '50px 50px'
                 }}
            />

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 border-2 border-gray-200">
              <p className="text-xs font-bold text-gray-700 mb-2">Click Intensity</p>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span>Low</span>
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span>Medium</span>
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>High</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <Flame className="mx-auto mb-4 text-gray-300" size={64} />
              <p className="text-gray-600 font-bold text-xl">No clicks recorded yet</p>
              <p className="text-gray-500 mt-2">Visit kayvontennis.com and click around to see data!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapViewer;