import React, { useState, useEffect } from 'react';
import { User, Clock, Timer } from 'lucide-react';
import { analyticsAPI } from '../../services/api';

const LatestVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitors();
    const interval = setInterval(fetchVisitors, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchVisitors = async () => {
    try {
      const response = await analyticsAPI.getRecentVisitors('ghosttrack-test-dashboard', 10);
      setVisits(response.data.visitors || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setLoading(false);
    }
  };

  const formatDuration = (durationStr) => {
    try {
      const parts = durationStr.split(':');
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;

      if (minutes > 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    } catch (e) {
      return durationStr;
    }
  };

  const formatTimePacific = (timestamp) => {
    try {
      // Create date from ISO string
      const date = new Date(timestamp);

      // Format to Pacific Time (PST/PDT)
      const options = {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };

      return date.toLocaleTimeString('en-US', options);
    } catch (e) {
      console.error('Error formatting time:', e);
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4">👥 Latest Visits (Last 10)</h3>
        <div className="text-center py-8 text-gray-400 flex-1 flex items-center justify-center">
          Loading visitors...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4">👥 Latest Visits (Last 10)</h3>

      {visits.length === 0 ? (
        <div className="text-center py-8 text-gray-400 flex-1 flex items-center justify-center">
          No visitors yet. Tracking will begin automatically.
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pr-2" style={{ maxHeight: '400px' }}>
          {visits.map((visit, index) => (
            <div
              key={index}
              className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Top Row: Visitor ID and IP */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-blue-500 p-1.5 rounded-full">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="font-bold text-gray-800">#{visit.id}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 text-sm">{visit.ip}</span>
              </div>

              {/* Time and Duration Row with Labels - Aligned */}
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Time
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    {formatTimePacific(visit.timestamp)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1 flex items-center">
                    <Timer className="w-3 h-3 mr-1" />
                    Duration
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {formatDuration(visit.duration)}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Pages info */}
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                <span className="font-medium text-gray-700">{visit.pages}</span> {visit.pages === 1 ? 'page' : 'pages'} • {visit.last_page}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LatestVisits;
