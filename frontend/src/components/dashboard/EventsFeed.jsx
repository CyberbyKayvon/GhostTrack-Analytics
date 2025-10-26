import React from 'react';
import { Activity, MousePointer, Eye, ShoppingCart, AlertTriangle, Shield, Search } from 'lucide-react';

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
      const date = new Date(timestamp);

      // Get local time using native Date methods
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';

      // Convert to 12-hour format
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12

      const minutesStr = minutes < 10 ? '0' + minutes : minutes;

      return `${hours}:${minutesStr} ${ampm}`;
    } catch (e) {
      return 'N/A';
    }
  };

  const formatDateLocal = (timestamp) => {
    try {
      const date = new Date(timestamp);

      // Format as MM/DD/YYYY
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();

      return `${month}/${day}/${year}`;
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
    if (!userAgent) return { emoji: '❓', name: 'Unknown' };

    const ua = userAgent.toLowerCase();

    if (ua.includes('edg/') || ua.includes('edge')) {
      return { emoji: '🌊', name: 'Edge' };
    } else if (ua.includes('chrome') && ua.includes('safari')) {
      return { emoji: '🌐', name: 'Chrome' };
    } else if (ua.includes('firefox')) {
      return { emoji: '🦊', name: 'Firefox' };
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      return { emoji: '🧭', name: 'Safari' };
    } else if (ua.includes('opera') || ua.includes('opr/')) {
      return { emoji: '🎭', name: 'Opera' };
    }

    return { emoji: '❓', name: 'Other' };
  };

  // Create a mapping of session IDs to short numbers
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
                      {/* Session info with browser icon */}
                      <div className="text-xs text-gray-400 mt-1 flex items-center space-x-1">
                        <span className="text-lg">{browserInfo.emoji}</span>
                        <span>Session #{sessionNumber}</span>
                      </div>
                      {/* Date instead of 0 */}
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDateLocal(event.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-blue-600">
                      {formatTimeLocal(event.timestamp)}
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