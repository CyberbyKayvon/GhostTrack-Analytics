import React, { useState, useEffect } from 'react';
import { Users, Globe, Monitor, Clock, Activity, MousePointer2, Smartphone, Tablet, Instagram, Calendar, Shield } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import { UAParser } from 'ua-parser-js';

// Chrome - Real recognizable logo with all 4 colors
const ChromeIcon = ({ className = "w-8 h-8" }) => (
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

// Safari - Blue compass with red/blue needle
const SafariIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#0066CC" strokeWidth="1.5" fill="white"/>
    <path d="M12 3L12.5 5.5M12 21L11.5 18.5M21 12L18.5 12.5M3 12L5.5 11.5" stroke="#0066CC" strokeWidth="1" strokeLinecap="round"/>
    <path d="M17.5 6.5L16 8M6.5 17.5L8 16M17.5 17.5L16 16M6.5 6.5L8 8" stroke="#0066CC" strokeWidth="1" strokeLinecap="round"/>
    <path d="M12 12L15 9L12 15L9 15L12 12Z" fill="#FF0000"/>
    <path d="M12 12L9 15L12 9L15 9L12 12Z" fill="#0066CC"/>
    <circle cx="12" cy="12" r="1" fill="#0066CC"/>
  </svg>
);

// Firefox - Official orange/red fox around purple globe
const FirefoxIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Purple/blue globe */}
    <circle cx="12" cy="12" r="10" fill="#6B46C1"/>
    <circle cx="12" cy="12" r="8" fill="#5636D3"/>
    {/* Orange fox wrapping around - tail */}
    <path d="M 4 10 Q 2 6 4 4 Q 6 2 8 4 L 10 8 Z" fill="#FF9500"/>
    {/* Orange/red fox body */}
    <path d="M 12 2 Q 16 2 19 6 Q 22 10 22 14 Q 20 16 18 17 L 14 18 Q 12 17 12 15 Z" fill="#FF6611"/>
    {/* Yellow accent */}
    <path d="M 20 8 Q 22 6 22 10 Q 21 12 19 13 Z" fill="#FFBD4F"/>
  </svg>
);

// Edge - Official blue wave with gradient
const EdgeIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dark blue base */}
    <circle cx="12" cy="12" r="10" fill="#0078D4"/>
    {/* Cyan/teal wave accent */}
    <path d="M 12 2 Q 18 4 20 10 Q 22 14 20 18 Q 16 22 12 22 Q 10 20 10 16 Q 10 12 12 10 Q 14 8 16 8 Q 18 8 19 10" fill="#00BCF2"/>
    {/* Light blue highlight */}
    <path d="M 8 8 Q 12 6 16 8" stroke="#80DEEA" strokeWidth="1.5" fill="none" opacity="0.8"/>
  </svg>
);

// Opera - Red O logo
const OperaIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#FF1B2D"/>
    <ellipse cx="12" cy="12" rx="5" ry="7" fill="none" stroke="white" strokeWidth="2"/>
  </svg>
);

const LatestVisits = ({ siteId }) => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!siteId) return;

    // Reset state immediately when siteId changes
    setVisits([]);
    setLoading(true);

    const fetchVisitors = async () => {
      try {
        const response = await analyticsAPI.getRecentVisitors(siteId, 10);
        const visitors = response.data?.visitors || [];
        setVisits(visitors);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching visitors:', error);
        setLoading(false);
      }
    };

    fetchVisitors();
    const interval = setInterval(fetchVisitors, 10000);
    return () => clearInterval(interval);
  }, [siteId]);

  const getBrowserInfo = (visit) => {
    const userAgent = visit.user_agent || '';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    let browserName = visit.browser || result.browser.name || 'Unknown';
    let deviceType = result.device.type || 'desktop';

    // Detect Instagram in-app browser
    if (userAgent.includes('Instagram')) browserName = 'Instagram';

    // Get browser icon and color
    let browserIcon, browserColor;

    if (browserName === 'Instagram' || browserName.toLowerCase().includes('instagram')) {
      browserIcon = <Instagram className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />;
      browserColor = 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400';
    } else if (browserName.toLowerCase().includes('edge') || browserName.toLowerCase().includes('edg')) {
      browserIcon = <EdgeIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />;
      browserColor = 'bg-white';
    } else if (browserName.toLowerCase().includes('chrome')) {
      browserIcon = <ChromeIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />;
      browserColor = 'bg-white';
    } else if (browserName.toLowerCase().includes('firefox')) {
      browserIcon = <FirefoxIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />;
      browserColor = 'bg-white';
    } else if (browserName.toLowerCase().includes('safari')) {
      browserIcon = <SafariIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />;
      browserColor = 'bg-white';
    } else if (browserName.toLowerCase().includes('opera')) {
      browserIcon = <OperaIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />;
      browserColor = 'bg-white';
    } else {
      browserIcon = <Activity className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-600" />;
      browserColor = 'bg-gray-200';
    }

    // Get device icon
    let deviceIcon;
    if (deviceType === 'mobile') {
      deviceIcon = <Smartphone className="w-4 h-4" />;
    } else if (deviceType === 'tablet') {
      deviceIcon = <Tablet className="w-4 h-4" />;
    } else {
      deviceIcon = <Monitor className="w-4 h-4" />;
    }

    return { browserIcon, browserColor, deviceIcon, deviceType, browserName };
  };

  // Format time exactly like EventsFeed (e.g., "7:20 PM")
  const formatTime = (timestamp) => {
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
      return 'N/A';
    }
  };

  // NEW: Format date (e.g., "Nov 1, 2025" or "11/1/25")
  const formatDate = (timestamp) => {
    try {
      let date;
      if (timestamp.endsWith('Z') || timestamp.includes('+')) {
        date = new Date(timestamp);
      } else {
        date = new Date(timestamp + 'Z');
      }

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();

      return `${month} ${day}, ${year}`;
    } catch (e) {
      return 'N/A';
    }
  };

  // Format duration properly
  const formatDuration = (duration) => {
    if (!duration || duration === '0:00' || duration === '0') return '0s';

    if (typeof duration === 'string' && duration.includes(':')) {
      const parts = duration.split(':');
      if (parts.length === 2) {
        const mins = parseInt(parts[0]);
        const secs = parseInt(parts[1]);

        if (mins < 1440) {
          if (mins === 0) return `${secs}s`;
          if (mins < 60) return `${mins}m ${secs}s`;
          const hours = Math.floor(mins / 60);
          const remainingMins = mins % 60;
          return `${hours}h ${remainingMins}m`;
        } else {
          const totalSeconds = mins * 60 + secs;
          return formatSecondsToTime(totalSeconds);
        }
      }
    }

    if (typeof duration === 'number') {
      return formatSecondsToTime(duration);
    }

    return duration;
  };

  const formatSecondsToTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const formatPageUrl = (url) => {
    if (!url || url === 'Unknown') return 'Homepage';
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.split('/').pop() || 'Homepage';
      return path.replace(/\.(html|htm|php)$/i, '') || 'Homepage';
    } catch {
      return 'Homepage';
    }
  };

  const accentColors = ['border-l-purple-500', 'border-l-blue-500', 'border-l-cyan-500', 'border-l-green-500', 'border-l-orange-500'];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 border-b-2 border-gray-100">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="text-purple-600" size={20} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Latest Users</h2>
        </div>
        <div className="text-center py-8 text-gray-400">Loading visitors...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 pb-4 border-b-2 border-gray-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="text-purple-600" size={20} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Latest Users</h2>
        </div>
        <div className="px-4 py-2 bg-blue-100 rounded-lg self-start sm:self-auto">
          <span className="text-blue-700 font-bold text-sm">{visits.length} Sessions</span>
        </div>
      </div>

      {visits.length === 0 ? (
        <div className="text-center py-16">
          <Users className="text-gray-300 mx-auto mb-4" size={48} />
          <p className="text-gray-900 font-bold text-lg sm:text-xl mb-1">No Active Sessions</p>
          <p className="text-gray-500 text-sm sm:text-base">Visitor data will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-2" style={{ maxHeight: '600px' }}>
          {visits.map((visit, index) => {
            const { browserIcon, browserColor, deviceIcon, deviceType, browserName} = getBrowserInfo(visit);
            const accentColor = accentColors[index % accentColors.length];

            return (
              <div key={`${visit.session_id}-${visit.id || visit.timestamp || index}`} className={`bg-gray-50 rounded-xl p-3 sm:p-4 lg:p-5 border-l-4 ${accentColor} border border-gray-200 hover:shadow-md transition-all relative`}>
                {/* Bot Badge - Top Right Corner */}
                {visit.is_bot && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4">
                    <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-red-500 text-white shadow-md">
                      <Shield className="w-3 h-3 mr-1" />
                      BOT
                    </div>
                  </div>
                )}

                {/* Mobile & Tablet Layout (< lg) */}
                <div className="lg:hidden space-y-3">
                  {/* Browser Icon + IP + Activity */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg ${browserColor} flex items-center justify-center shadow-md`}>
                        {browserIcon}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="text-cyan-600 flex-shrink-0" />
                          <span className="text-gray-900 font-bold font-mono text-sm break-all">{visit.ip || 'Unknown'}</span>
                        </div>
                        <div className="flex items-baseline gap-1 flex-shrink-0">
                          <span className="text-orange-600 font-black text-xl">{visit.clicks || 0}</span>
                          <span className="text-gray-600 font-semibold text-xs">clicks</span>
                        </div>
                      </div>

                      <div className="text-gray-500 text-xs mb-1">Visitor #{visit.id}</div>

                      {/* Device & Browser */}
                      <div className="flex items-center gap-2 text-xs">
                        {deviceIcon}
                        <span className="text-gray-900 font-semibold capitalize">{deviceType}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{browserName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Time, Duration & Page */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock size={14} className="text-cyan-600" />
                        <span className="text-xs font-bold text-gray-700 uppercase">Time</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900">{formatTime(visit.timestamp)}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                        <Calendar size={12} className="text-gray-500" />
                        <span>{formatDate(visit.timestamp)}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Duration: <span className="font-semibold text-gray-900">{formatDuration(visit.duration)}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Activity size={14} className="text-cyan-600" />
                        <span className="text-xs font-bold text-gray-700 uppercase">Page</span>
                      </div>
                      <div className="px-2 py-1 bg-purple-600 rounded-md inline-block">
                        <span className="text-white font-bold text-xs">{formatPageUrl(visit.last_page)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout (>= lg) */}
                <div className="hidden lg:flex items-center gap-5">
                  {/* Browser icon - LARGE and recognizable */}
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 rounded-xl ${browserColor} flex items-center justify-center shadow-md`}>
                      {browserIcon}
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-5 gap-5">
                    {/* IP */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe size={16} className="text-cyan-600" />
                        <span className="text-sm font-black uppercase text-cyan-600">IP</span>
                      </div>
                      <div className="text-gray-900 font-bold font-mono">{visit.ip || 'Unknown'}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                        <Calendar size={12} className="text-gray-500" />
                        <span>{formatDate(visit.timestamp)}</span>
                      </div>
                    </div>

                    {/* Device */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Monitor size={16} className="text-pink-600" />
                        <span className="text-sm font-black uppercase text-pink-600">DEVICE</span>
                      </div>
                      <div className="text-gray-900 font-bold capitalize">{deviceType}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600 text-sm">Browser:</span>
                        <span className="text-gray-900 text-sm font-semibold">{browserName}</span>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={16} className="text-cyan-600" />
                        <span className="text-sm font-black uppercase text-cyan-600">TIME</span>
                      </div>
                      <div className="text-gray-900 font-bold">{formatTime(visit.timestamp)}</div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <span className="font-medium">Duration:</span>
                        <span className="font-semibold text-gray-900">{formatDuration(visit.duration)}</span>
                      </div>
                    </div>

                    {/* Activity */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MousePointer2 size={16} className="text-pink-600" />
                        <span className="text-sm font-black uppercase text-pink-600">ACTIVITY</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-orange-600 font-black text-3xl">{visit.clicks || 0}</span>
                        <span className="text-gray-600 font-semibold text-sm">events</span>
                      </div>
                    </div>

                    {/* Page */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity size={16} className="text-cyan-600" />
                        <span className="text-sm font-black uppercase text-cyan-600">PAGE</span>
                      </div>
                      <div className="px-2.5 py-1.5 bg-purple-600 rounded-md">
                        <span className="text-white font-bold text-xs truncate block">{formatPageUrl(visit.last_page)}</span>
                      </div>
                      <div className="text-gray-500 text-xs mt-1">Visitor #{visit.id}</div>
                    </div>
                  </div>
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