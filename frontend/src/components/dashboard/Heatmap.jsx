import React, { useState, useEffect, useRef } from 'react';
import { Flame, RefreshCw } from 'lucide-react';

const HeatmapViewer = ({ siteId }) => {
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flame className="text-orange-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Click Heatmap</h2>
        </div>

        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-4 py-2 border-2 border-gray-300 rounded-lg"
        >
          <option value={1}>Last 24 Hours</option>
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
        </select>
      </div>

      <div className="bg-gray-50 rounded-xl border-2 border-gray-200 h-96 flex items-center justify-center">
        <p className="text-gray-500">Heatmap will render here</p>
      </div>
    </div>
  );
};

export default HeatmapViewer;