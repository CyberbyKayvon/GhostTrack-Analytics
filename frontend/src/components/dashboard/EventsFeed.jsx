import React from 'react';
import { Activity, MousePointer, Eye, FileText, AlertTriangle, Shield } from 'lucide-react';

const EventsFeed = ({ events }) => {
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'pageview':
        return <Eye className="w-4 h-4" />;
      case 'click':
        return <MousePointer className="w-4 h-4" />;
      case 'add_to_cart':
        return <FileText className="w-4 h-4" />;
      case 'suspicious_activity':
        return <AlertTriangle className="w-4 h-4" />;
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
        return 'bg-red-100 text-red-600';
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

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const options = {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      return date.toLocaleTimeString('en-US', options);
    } catch (e) {
      return 'N/A';
    }
  };

  const getPageName = (url) => {
    if (!url) return 'Unknown';
    const pageName = url.split('/').pop() || 'Home';
    return pageName.replace('.html', '');
  };

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
          {events.slice(0, 10).map((event, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`p-2 rounded-lg ${getEventColor(event.event_type)}`}>
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800 text-sm">
                        {formatEventType(event.event_type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {getPageName(event.url)}
                    </div>
                    {event.is_bot && (
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Bot Detected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsFeed;
