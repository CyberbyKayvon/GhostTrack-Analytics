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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
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
            className="px-4 py-2 border-2 border-gray-300 rounded-lg"
          >
            <option value={1}>Last 24 Hours</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>

          <button
            onClick={fetchData}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {data && (
        <div className="mb-4 p-4 bg-orange-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">
            {data.total_clicks} clicks recorded
          </p>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : data?.clicks?.length > 0 ? (
          <div>
            <p className="font-bold mb-2">Click Coordinates:</p>
            {data.clicks.slice(0, 10).map((click, i) => (
              <div key={i} className="text-sm text-gray-600">
                Click {i+1}: X={click.x}, Y={click.y}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No clicks yet - visit kayvontennis.com and click around!</p>
        )}
      </div>
    </div>
  );
};

export default HeatmapViewer;