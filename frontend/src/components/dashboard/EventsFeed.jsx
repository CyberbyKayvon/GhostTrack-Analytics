import React from 'react';
import { Clock, MousePointer, Eye } from 'lucide-react';

const EventsFeed = ({ events }) => {
  const getEventIcon = (type) => {
    switch(type) {
      case 'pageview': return <Eye className="w-4 h-4" />;
      case 'click': return <MousePointer className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Recent Events</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No events yet</div>
        ) : (
          events.map((event, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="text-ghost-purple">
                {getEventIcon(event.event_type)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{event.event_type}</p>
                <p className="text-sm text-gray-500">{event.url}</p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(event.timestamp).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsFeed;