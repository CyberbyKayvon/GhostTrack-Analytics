import React, { useState, useEffect } from 'react';
import { Users, Globe, Monitor, Clock, Activity, MousePointer2, Smartphone, Tablet, Instagram } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import { UAParser } from 'ua-parser-js';

// Chrome SVG Icon
const ChromeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#4285F4"/>
    <circle cx="12" cy="12" r="4" fill="#4285F4"/>
  </svg>
);

// Safari SVG Icon
const SafariIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#0066CC" strokeWidth="1.5" fill="white"/>
    <circle cx="12" cy="12" r="1" fill="#0066CC"/>
  </svg>
);

const LatestVisits = ({ siteId }) => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (siteId) {
      fetchVisitors();
      const interval = setInterval(fetchVisitors, 10000);
      return () => clearInterval(interval);
    }
  }, [siteId]);

  const fetchVisitors = async () => {
    try {
      console.log('=== FETCHING VISITORS ===');
      console.log('Site ID:', siteId);

      const response = await analyticsAPI.getRecentVisitors(siteId, 10);

      console.log('Full API Response:', response);
      console.log('Response Data:', response.data);
      console.log('Visitors Array:', response.data?.visitors);

      const visitors = response.data?.visitors || [];

      console.log('Setting visits to:', visitors);
      console.log('Number of visitors:', visitors.length);

      setVisits(visitors);
      setLoading(false);
    } catch (error) {
      console.error('=== ERROR FETCHING VISITORS ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      setLoading(false);
    }
  };

  const getBrowserInfo = (visit) => {
    const userAgent = visit.user_agent || '';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    let browserName = visit.browser || result.browser.name || 'Unknown';
    let deviceType = result.device.type || 'desktop';

    if (userAgent.includes('Instagram')) browserName = 'Instagram';

    let browserIcon = <Monitor className="w-4 h-4" />;
    let browserColor = 'bg-blue-500';

    if (browserName.toLowerCase().includes('instagram')) {
      browserIcon = <Instagram className="w-4 h-4" />;
      browserColor = 'bg-pink-500';
    } else if (browserName.toLowerCase().includes('chrome')) {
      browserIcon = <ChromeIcon className="w-4 h-4" />;
      browserColor = 'bg-blue-500';
    } else if (browserName.toLowerCase().includes('safari')) {
      browserIcon = <SafariIcon className="w-4 h-4" />;
      browserColor = 'bg-blue-600';
    }

    let deviceIcon = deviceType === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />;

    return { browserIcon, browserColor, browserName, deviceIcon, deviceType };
  };

  const formatTime = (timestamp) => {
    try {
      const date = timestamp.endsWith('Z') ? new Date(timestamp) : new Date(timestamp + 'Z');
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
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
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="text-purple-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Latest Users</h2>
        </div>
        <div className="text-center py-8 text-gray-400">Loading visitors...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="text-purple-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Latest Users</h2>
        </div>
        <div className="px-4 py-2 bg-blue-100 rounded-lg">
          <span className="text-blue-700 font-bold text-sm">{visits.length} Sessions</span>
        </div>
      </div>

      {visits.length === 0 ? (
        <div className="text-center py-16">
          <Users className="text-gray-300 mx-auto mb-4" size={64} />
          <p className="text-gray-900 font-bold text-xl mb-1">No Active Sessions</p>
          <p className="text-gray-500">Visitor data will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
          {visits.map((visit, index) => {
            const { browserIcon, browserColor, browserName, deviceIcon, deviceType } = getBrowserInfo(visit);
            const accentColor = accentColors[index % accentColors.length];

            return (
              <div key={visit.session_id || index} className={`bg-gray-50 rounded-xl p-5 border-l-4 ${accentColor} border border-gray-200 hover:shadow-md transition-all`}>
                <div className="flex items-center gap-5">
                  <div className="flex-shrink-0">
                    <div className={`w-14 h-14 rounded-xl ${browserColor} flex items-center justify-center shadow-md`}>
                      {browserIcon}
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-5 gap-5">
                    {/* IP - TURQUOISE #1E88B8 */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe size={16} className="text-cyan-600" />
                        <span className="text-sm font-black uppercase text-cyan-600">IP</span>
                      </div>
                      <div className="text-gray-900 font-bold font-mono">{visit.ip || 'Unknown'}</div>
                      <div className="text-gray-500 text-xs">Visitor #{visit.id}</div>
                    </div>

                    {/* Device - PINK #D91C81 */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Monitor size={16} className="text-pink-600" />
                        <span className="text-sm font-black uppercase text-pink-600">DEVICE</span>
                      </div>
                      <div className="text-gray-900 font-bold capitalize">{deviceType}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm font-medium">Browser:</span>
                        {browserIcon}
                        <span className="text-gray-900 text-sm font-semibold">{browserName}</span>
                      </div>
                    </div>

                    {/* Session - TURQUOISE #1E88B8 */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={16} className="text-cyan-600" />
                        <span className="text-sm font-black uppercase text-cyan-600">TIME</span>
                      </div>
                      <div className="text-gray-900 font-bold">{formatTime(visit.timestamp)}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600 text-sm font-medium">Duration:</span>
                        <span className="text-gray-900 text-sm font-semibold">{visit.duration || '0m 0s'}</span>
                      </div>
                    </div>

                    {/* Activity - PINK #D91C81 */}
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

                    {/* Latest - TURQUOISE #1E88B8 */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity size={16} className="text-cyan-600" />
                        <span className="text-sm font-black uppercase text-cyan-600">PAGE</span>
                      </div>
                      <div className="px-2.5 py-1.5 bg-purple-600 rounded-md">
                        <span className="text-white font-bold text-xs truncate block">{formatPageUrl(visit.last_page)}</span>
                      </div>
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