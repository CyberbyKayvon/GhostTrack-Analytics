import React, { useState, useEffect } from 'react';
import { User, Clock, Timer, MousePointer, MapPin, Globe } from 'lucide-react';
import { analyticsAPI } from '../../services/api';

// Chrome SVG Icon Component
const ChromeIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#4285F4"/>
    <path d="M12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6Z" fill="#FFFFFF"/>
    <circle cx="12" cy="12" r="4" fill="#4285F4"/>
    <path d="M12 2C17.5228 2 22 6.47715 22 12H18C18 8.68629 15.3137 6 12 6V2Z" fill="#EA4335"/>
    <path d="M2 12C2 6.47715 6.47715 2 12 2V6C8.68629 6 6 8.68629 6 12H2Z" fill="#FBBC04"/>
    <path d="M12 18V22C6.47715 22 2 17.5228 2 12H6C6 15.3137 8.68629 18 12 18Z" fill="#34A853"/>
    <path d="M22 12C22 17.5228 17.5228 22 12 22V18C15.3137 18 18 15.3137 18 12H22Z" fill="#4285F4"/>
  </svg>
);

const LatestVisits = ({ siteId }) => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (siteId) {
      fetchVisitors();
      const interval = setInterval(fetchVisitors, 10000);
      return () => clearInterval(interval);
    }
  }, [siteId]);

  const fetchVisitors = async () => {
    try {
      console.log('Fetching visitors for site:', siteId);
      const response = await analyticsAPI.getRecentVisitors(siteId, 10);
      console.log('API Response:', response);

      const visitors = response.data?.visitors || [];
      console.log('Visitors data:', visitors);

      if (visitors.length > 0) {
        // Sort by visitor ID (descending - newest first)
        const sortedVisitors = [...visitors].sort((a, b) => {
          const numA = parseInt(String(a.id)) || 0;
          const numB = parseInt(String(b.id)) || 0;
          return numB - numA;
        });

        setVisits(sortedVisitors);
        setError(null);
      } else {
        setVisits([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const getBrowserIcon = (browser) => {
    const icons = {
      'Chrome': {
        icon: <ChromeIcon className="w-3 h-3" />,
        color: 'bg-blue-100 text-blue-700',
        name: 'Chrome'
      },
      'Firefox': {
        icon: <div className="text-sm">🦊</div>,
        color: 'bg-orange-100 text-orange-700',
        name: 'Firefox'
      },
      'Safari': {
        icon: <div className="text-sm">🧭</div>,
        color: 'bg-blue-100 text-blue-700',
        name: 'Safari'
      },
      'Edge': {
        icon: <div className="text-sm">🌊</div>,
        color: 'bg-cyan-100 text-cyan-700',
        name: 'Edge'
      },
      'Opera': {
        icon: <div className="text-sm">🎭</div>,
        color: 'bg-red-100 text-red-700',
        name: 'Opera'
      },
      'Brave': {
        icon: <div className="text-sm">🦁</div>,
        color: 'bg-purple-100 text-purple-700',
        name: 'Brave'
      },
      'IE': {
        icon: <div className="text-sm">💤</div>,
        color: 'bg-gray-100 text-gray-700',
        name: 'IE'
      },
      'Other': {
        icon: <div className="text-sm">❓</div>,
        color: 'bg-gray-100 text-gray-500',
        name: 'Other'
      },
      'Unknown': {
        icon: <div className="text-sm">❓</div>,
        color: 'bg-gray-100 text-gray-500',
        name: 'Unknown'
      }
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
      let date;

      if (timestamp.endsWith('Z') || timestamp.includes('+')) {
        date = new Date(timestamp);
      } else {
        date = new Date(timestamp + 'Z');
      }

      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;

      const minutesStr = minutes < 10 ? '0' + minutes : minutes;

      return `${hours}:${minutesStr} ${ampm}`;
    } catch (e) {
      console.error('Error formatting time:', e, timestamp);
      return 'N/A';
    }
  };

  const getRegionFromIP = (ip) => {
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return 'Local';
    }
    return null;
  };

  const getRegion = (visit) => {
    if (visit.location && visit.location !== 'Unknown') {
      const parts = visit.location.split(',');
      if (parts.length >= 1) {
        return parts[0].trim();
      }
      return visit.location;
    }

    return getRegionFromIP(visit.ip);
  };

  const formatPageUrl = (pageUrl) => {
    if (!pageUrl || pageUrl === 'Unknown') return 'Homepage';

    try {
      const url = new URL(pageUrl);
      let path = url.pathname;

      // Remove leading/trailing slashes
      path = path.replace(/^\/+|\/+$/g, '');

      // If empty (homepage), return domain
      if (!path) {
        return url.hostname.replace('www.', '');
      }

      // Get just the page name (last segment)
      const segments = path.split('/');
      let pageName = segments[segments.length - 1];

      // Remove file extensions
      pageName = pageName.replace(/\.(html|htm|php|aspx)$/i, '');

      // If no page name, use last meaningful segment
      if (!pageName && segments.length > 1) {
        pageName = segments[segments.length - 2];
      }

      // Capitalize first letter
      pageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

      // Truncate if too long
      if (pageName.length > 25) {
        pageName = pageName.substring(0, 22) + '...';
      }

      return pageName || 'Homepage';
    } catch (e) {
      // If URL parsing fails, just clean up the string
      const cleaned = pageUrl.split('/').pop()?.replace(/\.(html|htm)$/i, '') || 'Homepage';
      return cleaned.length > 25 ? cleaned.substring(0, 22) + '...' : cleaned;
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <User className="w-6 h-6 mr-2 text-blue-500" />
          Latest Users (Last 10)
        </h3>
        <div className="text-center py-8 text-gray-400 flex-1 flex items-center justify-center">
          Loading visitors...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <User className="w-6 h-6 mr-2 text-blue-500" />
          Latest Users (Last 10)
        </h3>
        <div className="text-center py-8 flex-1 flex items-center justify-center">
          <div>
            <p className="text-red-500 font-medium mb-2">Error loading visitors</p>
            <p className="text-gray-400 text-sm">{error}</p>
            <button
              onClick={fetchVisitors}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <User className="w-6 h-6 mr-2 text-blue-500" />
        Latest Users (Last 10)
      </h3>

      {visits.length === 0 ? (
        <div className="text-center py-8 text-gray-400 flex-1 flex items-center justify-center">
          <div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-gray-600 font-medium mb-2">No visitors yet</p>
            <p className="text-gray-400 text-sm">Tracking will begin automatically when users visit your site</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pr-2" style={{ maxHeight: '400px' }}>
          {visits.map((visit, index) => {
            const browserInfo = getBrowserIcon(visit.browser || 'Unknown');
            const region = getRegion(visit);

            return (
              <div
                key={index}
                className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Row 1: Visitor ID on LEFT, IP + Location + Browser on RIGHT */}
                <div className="flex items-center justify-between mb-3">
                  {/* LEFT: Just the ID */}
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-500 p-1.5 rounded-full">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-bold text-gray-800">#{visit.id}</span>
                  </div>

                  {/* RIGHT: IP + Location Badge + Browser Badge */}
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 text-xs font-medium">IP:</span>
                    <span className="text-gray-700 text-sm font-mono">{visit.ip}</span>

                    {region && (
                      <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        region === 'Local'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {region === 'Local' ? (
                          <>
                            <Globe className="w-3 h-3" />
                            <span>Local</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3 h-3" />
                            <span>{region}</span>
                          </>
                        )}
                      </div>
                    )}

                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${browserInfo.color}`}>
                      {browserInfo.icon}
                      <span>{browserInfo.name}</span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Time and Duration - SIDE BY SIDE */}
                <div className="flex items-center space-x-6 mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Time</div>
                      <div className="text-sm font-semibold text-blue-600">
                        {formatTimeLocal(visit.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Timer className="w-3 h-3 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Duration</div>
                      <div className="text-sm font-semibold text-gray-700">
                        {formatDuration(visit.duration)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Activity and Page */}
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 flex items-center">
                  <MousePointer className="w-3 h-3 mr-1 text-purple-500" />
                  <span className="font-semibold text-gray-700">{visit.clicks || 0}</span>
                  <span className="ml-1">{visit.clicks === 1 ? 'action' : 'actions'}</span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-600 truncate">{formatPageUrl(visit.last_page)}</span>
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