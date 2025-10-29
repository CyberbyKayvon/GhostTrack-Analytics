import React, { useMemo } from 'react';
import { Users, Globe, Monitor, Clock, Zap, Eye, MousePointer2, Activity } from 'lucide-react';

const LatestVisits = ({ events }) => {
  // Process events into unique sessions/visits
  const visits = useMemo(() => {
    if (!events || events.length === 0) return [];

    // Group events by IP address + hour
    const sessionMap = new Map();

    events.forEach(event => {
      const ip = event.FOUND_IP || event.ip || 'unknown';
      const timestamp = new Date(event.timestamp);
      const hourKey = `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}-${timestamp.getHours()}`;
      const sessionKey = `${ip}_${hourKey}`;

      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, {
          session_key: sessionKey,
          ip_address: ip,
          events: [],
          first_seen: event.timestamp,
          last_seen: event.timestamp,
        });
      }

      const session = sessionMap.get(sessionKey);
      session.events.push(event);

      if (event.timestamp > session.last_seen) {
        session.last_seen = event.timestamp;
      }
    });

    // Convert to array and calculate metrics
    const visitsArray = Array.from(sessionMap.values()).map(session => {
      const pageviews = session.events.filter(e =>
        e.event_type === 'pageview' || e.event_type === 'page_view'
      ).length;
      const clicks = session.events.filter(e => e.event_type === 'click').length;

      const latestEvent = session.events[session.events.length - 1];

      const firstTime = new Date(session.first_seen);
      const lastTime = new Date(session.last_seen);
      const durationMs = lastTime - firstTime;
      const durationMin = Math.floor(durationMs / 60000);
      const durationSec = Math.floor((durationMs % 60000) / 1000);

      let pagePath = '/';
      if (latestEvent?.url && latestEvent.url !== 'N/A') {
        try {
          pagePath = new URL(latestEvent.url).pathname;
        } catch (e) {
          pagePath = latestEvent.url;
        }
      }

      return {
        session_key: session.session_key,
        ip_address: session.ip_address,
        time: firstTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        duration: durationMin > 0 ? `${durationMin}m ${durationSec}s` : `${durationSec}s`,
        actions: session.events.length,
        page_views: pageviews,
        clicks: clicks,
        page_path: pagePath,
        event_type: latestEvent?.event_type || 'unknown',
        timestamp: session.last_seen,
      };
    });

    return visitsArray
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }, [events]);

  // Accent colors for the left border stripe
  const accentColors = [
    'border-l-purple-500',
    'border-l-blue-500',
    'border-l-cyan-500',
    'border-l-green-500',
    'border-l-orange-500',
    'border-l-pink-500',
    'border-l-red-500',
    'border-l-indigo-500',
    'border-l-teal-500',
    'border-l-fuchsia-500',
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="text-purple-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Latest Users
          </h2>
        </div>
        <div className="px-4 py-2 bg-blue-100 rounded-lg">
          <span className="text-blue-700 font-bold text-sm">
            {visits.length} Active Sessions
          </span>
        </div>
      </div>

      {/* Visits List */}
      <div className="space-y-3">
        {visits.map((visit, index) => {
          const shortId = visit.session_key.split('_')[1]?.slice(-2) || String(index).padStart(2, '0');
          const accentColor = accentColors[index % accentColors.length];

          return (
            <div
              key={visit.session_key}
              className={`bg-gray-50 rounded-xl p-5 border-l-4 ${accentColor} border border-gray-200 hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-center gap-5">
                {/* Bold Badge with Number */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">
                      #{shortId}
                    </span>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="flex-1 grid grid-cols-5 gap-5">

                  {/* IP Address */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe size={16} className="text-[#1E88B8]" />
                      <span className="text-sm font-black text-[#1E88B8] uppercase tracking-wider">
                        IP ADDRESS
                      </span>
                    </div>
                    <div className="text-gray-900 font-bold text-base font-mono">
                      {visit.ip_address}
                    </div>
                    <div className="text-gray-500 text-xs font-medium">
                      Visitor #{index + 1}
                    </div>
                  </div>

                  {/* Device */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Monitor size={16} className="text-[#D91C81]" />
                      <span className="text-sm font-black text-[#D91C81] uppercase tracking-wider">
                        DEVICE
                      </span>
                    </div>
                    <div className="text-gray-900 font-bold text-base">
                      Desktop
                    </div>
                    <div className="text-gray-600 text-sm">
                      Web Browser
                    </div>
                  </div>

                  {/* Session Time */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={16} className="text-[#1E88B8]" />
                      <span className="text-sm font-black text-[#1E88B8] uppercase tracking-wider">
                        SESSION
                      </span>
                    </div>
                    <div className="text-gray-900 font-bold text-base">
                      {visit.time}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                      <Activity size={14} className="text-[#1E88B8]" />
                      <span className="font-medium">{visit.duration}</span>
                    </div>
                  </div>

                  {/* Activity Stats - BOLD NUMBERS */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MousePointer2 size={16} className="text-[#D91C81]" />
                      <span className="text-sm font-black text-[#D91C81] uppercase tracking-wider">
                        ACTIVITY
                      </span>
                    </div>
                    <div className="space-y-2">
                      {/* Total Events - BIG & BOLD */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-orange-600 font-black text-3xl">
                          {visit.actions}
                        </span>
                        <span className="text-gray-600 font-semibold text-sm">events</span>
                      </div>

                      {/* Views & Clicks in subtle pills */}
                      <div className="flex gap-2 flex-wrap">
                        <div className="px-2.5 py-1 bg-blue-100 rounded-md flex items-center gap-1.5">
                          <Eye size={12} className="text-blue-600" />
                          <span className="text-blue-700 font-bold text-xs">{visit.page_views}</span>
                          <span className="text-blue-600 text-xs">views</span>
                        </div>

                        {visit.clicks > 0 && (
                          <div className="px-2.5 py-1 bg-pink-100 rounded-md">
                            <span className="text-pink-700 font-bold text-xs">{visit.clicks} clicks</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Latest Activity */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity size={16} className="text-[#1E88B8]" />
                      <span className="text-sm font-black text-[#1E88B8] uppercase tracking-wider">
                        LATEST
                      </span>
                    </div>
                    <div className="space-y-2">
                      {/* Event Type Badge */}
                      <div className="inline-block px-3 py-1.5 bg-purple-600 rounded-lg">
                        <span className="text-white font-bold text-sm">
                          {visit.event_type}
                        </span>
                      </div>

                      {/* Page Path */}
                      <div
                        className="px-2.5 py-1.5 bg-gray-200 rounded-md"
                        title={visit.page_path}
                      >
                        <span className="text-gray-700 font-mono font-medium text-xs truncate block">
                          {visit.page_path}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visits.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-block p-5 bg-gray-100 rounded-2xl mb-4">
            <Users className="text-gray-300" size={64} />
          </div>
          <p className="text-gray-900 font-bold text-xl mb-1">No Active Sessions</p>
          <p className="text-gray-500">Visitor data will appear here when available</p>
        </div>
      )}
    </div>
  );
};

export default LatestVisits;