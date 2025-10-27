import React from 'react';
import { Activity, MousePointer, Eye, ShoppingCart, AlertTriangle, Shield, Search } from 'lucide-react';

// Chrome SVG Icon Component
const ChromeIcon = ({ className = "w-4 h-4" }) => (
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

const EventsFeed = ({ events }) => {
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'pageview':
        return <Eye className="w-4 h-4" />;
      case 'click':
        return <MousePointer className="w-4 h-4" />;
      case 'add_to_cart':
        return <ShoppingCart className="w-4 h-4" />;
      case 'suspicious_activity':
      case 'suspicious_behavior':
        return <AlertTriangle className="w-4 h-4" />;
      case 'rapid_test':
        return <Activity className="w-4 h-4" />;
      case 'search':
        return <Search className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'pageview':
        return 'bg-blue-100 text-blue-600';
      case 'click':
        return 'bg-purple-100 text-purple-600';
      case 'add_to_cart':
        return 'bg-green-100 text-green-600';
      case 'suspicious_activity':
      case 'suspicious_behavior':
        return 'bg-red-100 text-red-600';
      case 'rapid_test':
        return 'bg-orange-100 text-orange-600';
      case 'search':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatEventType = (eventType) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTimeLocal = (timestamp) => {
    try {
      // Handle UTC conversion properly
      let date;

      if (timestamp.endsWith('Z') || timestamp.includes('+')) {
        date = new Date(timestamp);
      } else {
        // Assume UTC and append Z
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

  const formatDateLocal = (timestamp) => {
    try {
      let date;

      if (timestamp.endsWith('Z') || timestamp.includes('+')) {
        date = new Date(timestamp);
      } else {
        date = new Date(timestamp + 'Z');
      }

      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();

      const monthStr = month < 10 ? '0' + month : month;
      const dayStr = day < 10 ? '0' + day : day;

      return `${monthStr}/${dayStr}/${year}`;
    } catch (e) {
      return 'N/A';
    }
  };

  const getPageName = (url) => {
    if (!url) return 'Unknown';
    const pageName = url.split('/').pop() || 'Home';
    return pageName.replace('.html', '');
  };

  const detectBrowser = (userAgent) => {
    if (!userAgent) return { icon: <Activity className="w-3 h-3" />, name: 'Unknown', color: 'bg-gray-100 text-gray-500' };

    const ua = userAgent.toLowerCase();

    if (ua.includes('edg/') || ua.includes('edge')) {
      return {
        icon: <div className="text-sm">🌊</div>,
        name: 'Edge',
        color: 'bg-cyan-100 text-cyan-700'
      };
    } else if (ua.includes('chrome') && ua.includes('safari')) {
      return {
        icon: <ChromeIcon className="w-3 h-3" />,
        name: 'Chrome',
        color: 'bg-blue-100 text-blue-700'
      };
    } else if (ua.includes('firefox')) {
      return {
        icon: <div className="text-sm">🦊</div>,
        name: 'Firefox',
        color: 'bg-orange-100 text-orange-700'
      };
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      return {
        icon: <div className="text-sm">🧭</div>,
        name: 'Safari',
        color: 'bg-blue-100 text-blue-700'
      };
    } else if (ua.includes('opera') || ua.includes('opr/')) {
      return {
        icon: <div className="text-sm">🎭</div>,
        name: 'Opera',
        color: 'bg-red-100 text-red-700'
      };
    }

    return {
      icon: <Activity className="w-3 h-3" />,
      name: 'Other',
      color: 'bg-gray-100 text-gray-500'
    };
  };

  const sessionMap = React.useMemo(() => {
    const map = new Map();
    let counter = 1;

    events.forEach(event => {
      if (event.session_id && !map.has(event.session_id)) {
        map.set(event.session_id, counter.toString().padStart(3, '0'));
        counter++;
      }
    });

    return map;
  }, [events]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Activity className="w-6 h-6 mr-2 text-purple-500" />
        Recent Events
      </h3>

      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-400 flex-1 flex items-center justify-center">
          No events recorded yet.
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pr-2" style={{ maxHeight: '400px' }}>
          {events.slice(0, 10).map((event, index) => {
            const browserInfo = detectBrowser(event.user_agent);
            const sessionNumber = sessionMap.get(event.session_id) || '???';

            return (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${getEventColor(event.event_type)}`}>
                      {getEventIcon(event.event_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm mb-1">
                        {formatEventType(event.event_type)}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center space-x-2">
                        <span>Page: {getPageName(event.url)}</span>
                      </div>
                      <div className={`text-xs text-gray-400 mt-1 flex items-center space-x-1 px-2 py-0.5 rounded ${browserInfo.color}`}>
                        {browserInfo.icon}
                        <span>Session #{sessionNumber}</span>
                      </div>
                    </div>
                  </div>
                  {/* RIGHT SIDE - ONLY TIME AND DATE */}
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="text-sm font-bold text-blue-600">
                      {formatTimeLocal(event.timestamp)}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {formatDateLocal(event.timestamp)}
                    </div>
                    {event.is_bot && (
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Bot
                      </div>
                    )}
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

export default EventsFeed;
