import React, { useState, useEffect, useCallback } from 'react';
import { Flame, RefreshCw, ExternalLink } from 'lucide-react';
import { heatmapAPI } from '../../services/api';

const HeatmapViewer = ({ siteId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);

  const fetchData = useCallback(async () => {
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
  }, [siteId, days]);

  // Reset state when siteId or days changes
  useEffect(() => {
    setData(null);
    setLoading(true);
  }, [siteId, days]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getPageBreakdown = () => {
    if (!data?.clicks) return [];

    const pages = {};
    data.clicks.forEach(click => {
      const url = click.page_url || 'Unknown';
      pages[url] = (pages[url] || 0) + 1;
    });

    return Object.entries(pages)
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count);
  };

  const getClickDensity = () => {
    if (!data?.clicks) return [];

    const gridSize = 50;
    const density = {};

    data.clicks.forEach(click => {
      const x = click.x_position || click.x || 0;
      const y = click.y_position || click.y || 0;

      const gridX = Math.floor(x / gridSize);
      const gridY = Math.floor(y / gridSize);
      const key = `${gridX},${gridY}`;
      density[key] = (density[key] || 0) + 1;
    });

    return Object.entries(density).map(([key, count]) => {
      const [x, y] = key.split(',').map(Number);
      return { x: x * gridSize, y: y * gridSize, count };
    });
  };

  const clickDensity = getClickDensity();
  const maxClicks = Math.max(...(clickDensity.map(d => d.count) || [1]));
  const pageBreakdown = getPageBreakdown();

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg w-full">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-6 pb-4 border-b-2 border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flame className="text-orange-600" size={24} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Click Heatmap</h2>
        </div>

        <div className="flex gap-2 w-full">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="flex-1 px-3 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
          >
            <option value={1}>24 Hours</option>
            <option value={7}>7 Days</option>
            <option value={30}>30 Days</option>
          </select>

          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm md:text-base whitespace-nowrap"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {data && (
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg md:rounded-xl p-3 md:p-4 border-2 border-orange-200">
            <p className="text-xs md:text-sm font-semibold text-gray-500 mb-1">Total Clicks</p>
            <p className="text-xl md:text-3xl font-black text-gray-900">{data.total_clicks}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg md:rounded-xl p-3 md:p-4 border-2 border-blue-200">
            <p className="text-xs md:text-sm font-semibold text-gray-500 mb-1">Range</p>
            <p className="text-xl md:text-3xl font-black text-gray-900">{days}d</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg md:rounded-xl p-3 md:p-4 border-2 border-purple-200">
            <p className="text-xs md:text-sm font-semibold text-gray-500 mb-1">Pages</p>
            <p className="text-xl md:text-3xl font-black text-gray-900">{pageBreakdown.length}</p>
          </div>
        </div>
      )}

      {/* Page Breakdown */}
      {pageBreakdown.length > 0 && (
        <div className="mb-4 md:mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 md:p-4 border-2 border-gray-200">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            📊 Clicks by Page
          </h3>
          <div className="space-y-2">
            {pageBreakdown.map((page, index) => {
              const percentage = (page.count / data.total_clicks * 100).toFixed(1);
              const pageName = page.url.split('/').pop() || page.url.replace('https://', '').replace('http://', '').split('/')[0];

              return (
                <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg md:text-xl font-black text-gray-400 flex-shrink-0">#{index + 1}</span>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs md:text-sm font-semibold text-gray-700 hover:text-orange-600 truncate flex items-center gap-1"
                      >
                        <span className="truncate">{pageName || 'Homepage'}</span>
                        <ExternalLink size={10} className="flex-shrink-0" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-gray-500 hidden sm:inline">{percentage}%</span>
                      <span className="px-2 md:px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-bold text-xs md:text-sm whitespace-nowrap">
                        {page.count}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visual Heatmap - FIXED OVERFLOW */}
      <div className="bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden">
        {loading ? (
          <div className="h-48 md:h-64 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="animate-spin mx-auto mb-2 text-gray-400" size={36} />
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          </div>
        ) : data?.clicks?.length > 0 ? (
          <div className="relative bg-white p-6" style={{ height: '320px', width: '100%' }}>
            <div className="relative w-full h-full">
              {/* Click dots */}
              {clickDensity.map((area, i) => {
                const intensity = area.count / maxClicks;
                const size = 12 + (intensity * 25);
                const opacity = 0.4 + (intensity * 0.6);

                return (
                  <div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
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
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      zIndex: 10
                    }}
                    title={`${area.count} clicks`}
                  />
                );
              })}

              {/* Grid */}
              <div className="absolute inset-0 pointer-events-none"
                   style={{
                     backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                     backgroundSize: '30px 30px'
                   }}
              />
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 right-3 bg-white rounded-lg shadow-lg p-2 border-2 border-gray-200 z-20">
              <p className="text-xs font-bold text-gray-700 mb-1">Click Density</p>
              <div className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Low</span>
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Med</span>
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>High</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-48 md:h-64 flex items-center justify-center p-4">
            <div className="text-center">
              <Flame className="mx-auto mb-3 text-gray-300" size={40} />
              <p className="text-gray-600 font-bold text-sm md:text-lg">No clicks yet</p>
              <p className="text-gray-500 mt-1 text-xs md:text-sm">Visit your site and click around!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapViewer;