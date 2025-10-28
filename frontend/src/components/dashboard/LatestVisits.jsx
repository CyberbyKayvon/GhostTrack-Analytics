import React, { useState, useEffect } from 'react';
import { User, Clock, Timer, MousePointer, MapPin, Globe, Smartphone, Tablet, Monitor, Instagram } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import { UAParser } from 'ua-parser-js';

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

// Safari SVG Icon Component
const SafariIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#0066CC" strokeWidth="1.5" fill="white"/>
    <path d="M12 3L12.5 5.5M12 21L11.5 18.5M21 12L18.5 12.5M3 12L5.5 11.5" stroke="#0066CC" strokeWidth="1" strokeLinecap="round"/>
    <path d="M17.5 6.5L16 8M6.5 17.5L8 16M17.5 17.5L16 16M6.5 6.5L8 8" stroke="#0066CC" strokeWidth="1" strokeLinecap="round"/>
    <path d="M12 12L15 9L12 15L9 15L12 12Z" fill="#FF0000"/>
    <path d="M12 12L9 15L12 9L15 9L12 12Z" fill="#0066CC"/>
    <circle cx="12" cy="12" r="1" fill="#0066CC"/>
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

  // IMPROVED: Detect Instagram in-app browser and accurate mobile detection
  const getBrowserAndDeviceInfo = (visit) => {
    const userAgent = visit.user_agent || visit.browser_user_agent || '';
    const storedBrowser = visit.browser || 'Unknown';

    console.log('Processing visit:', {
      id: visit.id,
      ip: visit.ip,
      userAgent: userAgent,
      storedBrowser
    });

    if (!userAgent) {
      return {
        browserIcon: <Monitor className="w-3 h-3 text-gray-500" />,
        browserColor: 'bg-gray-100 text-gray-500',
        browserName: storedBrowser,
        deviceIcon: <Monitor className="w-3 h-3" />,
        deviceType: 'desktop'
      };
    }

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    console.log('Parsed result:', result);

    let browserName = result.browser.name || storedBrowser || 'Unknown';
    let deviceType = result.device.type || 'desktop';

    // SPECIAL: Detect Instagram in-app browser
    if (userAgent.includes('Instagram') || storedBrowser.toLowerCase().includes('instagram')) {
      browserName = 'Instagram';
    }

    // Browser icon based on name
    let browserIcon, browserColor;

    if (browserName === 'Instagram') {
      browserIcon = <Instagram className="w-3 h-3" />;
      browserColor = 'bg-pink-100 text-pink-700';
    } else if (browserName.toLowerCase().includes('edge')) {
      browserIcon = <div className="text-sm">🌊</div>;
      browserColor = 'bg-cyan-100 text-cyan-700';
    } else if (browserName.toLowerCase().includes('chrome')) {
      browserIcon = <ChromeIcon className="w-3 h-3" />;
      browserColor = 'bg-blue-100 text-blue-700';
    } else if (browserName.toLowerCase().includes('firefox')) {
      browserIcon = <div className="text-sm">🦊</div>;
      browserColor = 'bg-orange-100 text-orange-700';
    } else if (browserName.toLowerCase().includes('safari')) {
      browserIcon = <SafariIcon className="w-3 h-3" />;
      browserColor = 'bg-blue-100 text-blue-700';
    } else if (browserName.toLowerCase().includes('opera')) {
      browserIcon = <div className="text-sm">🎭</div>;
      browserColor = 'bg-red-100 text-red-700';
    } else if (browserName.toLowerCase().includes('brave')) {
      browserIcon = <div className="text-sm">🦁</div>;
      browserColor = 'bg-purple-100 text-purple-700';
    } else {
      browserIcon = <Monitor className="w-3 h-3" />;
      browserColor = 'bg-gray-100 text-gray-500';
    }

    // Device icon based on type
    let deviceIcon;
    if (deviceType === 'mobile') {
      deviceIcon = <Smartphone className="w-3 h-3" />;
    } else if (deviceType === 'tablet') {
      deviceIcon = <Tablet className="w-3 h-3" />;
    } else {
      deviceIcon = <Monitor className="w-3 h-3" />;
    }

    return {
      browserIcon,
      browserColor,
      browserName,
      deviceIcon,
      deviceType
    };
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

      path = path.replace(/^\/+|\/+$/g, '');

      if (!path) {
        return url.hostname.replace('www.', '');
      }

      const segments = path.split('/');
      let pageName = segments[segments.length - 1];

      pageName = pageName.replace(/\.(html|htm|php|aspx)$/i, '');

      if (!pageName && segments.length > 1) {
        pageName = segments[segments.length - 2];
      }

      pageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

      if (pageName.length > 25) {
        pageName = pageName.substring(0, 22) + '...';
      }

      return pageName || 'Homepage';
    } catch (e) {
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
            const { browserIcon, browserColor, browserName, deviceIcon, deviceType } = getBrowserAndDeviceInfo(visit);
            const region = getRegion(visit);

            return (
              <div
                key={index}
                className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Row 1: Visitor ID + IP on LEFT, Location + Browser + Device on RIGHT */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-500 p-1.5 rounded-full">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-bold text-gray-800">#{visit.id}</span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-gray-700 text-xs font-mono">{visit.ip}</span>
                  </div>

                  {/* RIGHT: Location + Browser + Device */}
                  <div className="flex items-center space-x-2">
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

                    {/* Browser Badge with ICON */}
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${browserColor}`}>
                      {browserIcon}
                      <span>{browserName}</span>
                    </div>

                    {/* Device Badge */}
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                      {deviceIcon}
                      <span className="capitalize">{deviceType}</span>
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