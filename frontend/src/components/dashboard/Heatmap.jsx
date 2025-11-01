import React, { useState, useEffect } from 'react';
import { Flame, RefreshCw, ExternalLink } from 'lucide-react';
import { heatmapAPI } from '../../services/api';

const HeatmapViewer = ({ siteId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
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
  const pageBreakdown = getPageBreakdown();

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg w-full">
      {/* Header - Fixed for mobile */}
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
            <p className="text-xl md:text-3xl font-black text-gr