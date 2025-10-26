import React, { useState, useEffect } from 'react';
import { User, Clock, Timer, MousePointer, MapPin } from 'lucide-react';
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
      const visitors = response.data.visitors || [];

      // Sort by ID in descending order to get newest (010) at top
      const sortedVisitors = [...visitors].sort((a, b) => {
        const numA = parseInt(String(a.id)) || 0;
        const numB = parseInt(String(b.id)) || 0;
        return numB - numA; // Descending order
      });

      setVisits(sortedVisitors);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setLoading(false);
    }
  };

  const getBrowserIcon = (browser) => {
    const icons = {
      'Chrome': { emoji: '🌐', color: 'bg-yellow-100 text-yellow-700', name: 'Chrome' },
      'Firefox': { emoji: '🦊', color: 'bg-orange-100 text-orange-700', name: 'Firefox' },
      'Safari': { emoji: '🧭', color: 'bg-blue-100 text-blue-700', name: 'Safari' },
      'Edge': { emoji: '🌊', color: 'bg-cyan-100 text-cyan-700', name: 'Edge' },
      'Opera': { emoji: '🎭', color: 'bg-red-100 text-red-700', name: 'Opera' },
      'Brave': { emoji: '🦁', color: 'bg-purple-100 text-purple-700', name: 'Brave' },
      'IE': { emoji: '💤', color: 'bg-gray-100 text-gray-700', name: 'IE' },
      'Other': { emoji: '❓', color: 'bg-gray-100 text-gray-500', name: 'Other' },
      'Unknown': { emoji: '❓', color: 'bg-gray-100 text-gray-500', name: 'Unknown' }
    };

    return icons[browser] || icons['Unknown'];
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

  const formatTimeLocal = (timestamp) => {
    try {
      const date = new Date(timestamp);

      // Use native Date methods to get local time
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';

      // Convert to 12-hour format
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12

      const minutesStr = minutes < 10 ? '0' + minutes : minutes;

      return `${hours}:${minutesStr} ${ampm}`;
    } catch (e) {
      console.error('Error formatting time:', e, timestamp);
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
          {visits.map((visit, index) => {
            const browserInfo = getBrowserIcon(visit.browser || 'Unknown');

            return (
              <div
                key={index}
                className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Top Row: Visitor ID, IP, Browser, and Location */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-500 p-1.5 rounded-full">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-bold text-gray-800">#{visit.id}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 text-xs font-medium">IP:</span>
                    <span className="text-gray-700 text-sm font-mono">{visit.ip}</span>
                  </div>

                  {/* Browser Badge */}
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${browserInfo.color}`}>
                    <span className="text-sm">{browserInfo.emoji}</span>
                    <span>{browserInfo.name}</span>
                  </div>
                </div>

                {/* Time and Duration Row */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <div className="text-xs text-gray-500 font-medium mb-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Time
                    </div>
                    <div className="text-sm font-semibold text-blue-600">
                      {formatTimeLocal(visit.timestamp)}
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

                {/* Bottom Row: Activity count and Location */}
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <MousePointer className="w-3 h-3 mr-1 text-purple-500" />
                    <span className="font-semibold text-gray-700">{visit.clicks || 0}</span>
                    <span className="ml-1">{visit.clicks === 1 ? 'action' : 'actions'}</span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-600 truncate">{visit.last_page}</span>
                  </div>

                  {/* Location indicator */}
                  {visit.location && (
                    <div className="flex items-center text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="text-xs">{visit.location}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LatestVisits;