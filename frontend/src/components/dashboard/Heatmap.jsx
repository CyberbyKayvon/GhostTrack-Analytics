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
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b-2 border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flame className="text-orange-600" size={24} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Click Heatmap</h2>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
          >
            <option value={1}>24 Hours</option>
            <option value={7}>7 Days</option>
            <option value={30}>30 Days</option>
          </select>

          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3 md:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 flex items-center gap-2 text-sm md:text-base"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      {data && (
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg md:rounded-xl p-3 md:p-4 border-2 border-orange-200">
            <p className="text-xs md:text-sm font-semibold text-gray-500 mb-1">Total Clicks</p>
            <p className="text-2xl md:text-3xl font-black text-gray-900">{data.total_clicks}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg md:rounded-xl p-3 md:p-4 border-2 border-blue-200">
            <p className="text-xs md:text-sm font-semibold text-gray-500 mb-1">Range</p>
            <p className="text-2xl md:text-3xl font-black text-gray-900">{days}d</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg md:rounded-xl p-3 md:p-4 border-2 border-purple-200">
            <p className="text-xs md:text-sm font-semibold text-gray-500 mb-1">Hotspots</p>
            <p className="text-2xl md:text-3xl font-black text-gray-900">{getClickDensity().length}</p>
          </div>
        </div>
      )}

      {/* Visual Heatmap - Responsive Height */}
      <div className="bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden">
        {loading ? (
          <div className="h-64 md:h-80 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="animate-spin mx-auto mb-2 text-gray-400" size={36} />
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          </div>
        ) : data?.clicks?.length > 0 ? (
          <div className="relative bg-white mx-auto" style={{ height: '300px', maxHeight: '300px', width: '100%', maxWidth: '100%' }}>
            {/* Click dots visualization */}
            {getClickDensity().map((area, i) => {
              const intensity = area.count / maxClicks;
              const size = 15 + (intensity * 30); // Smaller dots
              const opacity = 0.4 + (intensity * 0.6);

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
                   backgroundSize: '40px 40px'
                 }}
            />

            {/* Legend - Responsive positioning */}
            <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-white rounded-lg shadow-lg p-2 md:p-3 border-2 border-gray-200">
              <p className="text-xs font-bold text-gray-700 mb-1 md:mb-2">Click Intensity</p>
              <div className="flex items-center gap-1 md:gap-2 text-xs">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-500"></div>
                <span className="text-xs">Low</span>
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-orange-500"></div>
                <span className="text-xs">Med</span>
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500"></div>
                <span className="text-xs">High</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 md:h-80 flex items-center justify-center p-4">
            <div className="text-center">
              <Flame className="mx-auto mb-3 md:mb-4 text-gray-300" size={48} />
              <p className="text-gray-600 font-bold text-base md:text-xl">No clicks yet</p>
              <p className="text-gray-500 mt-2 text-sm md:text-base">Visit your site and click around!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapViewer;