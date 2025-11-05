import React, { useState, useEffect } from 'react';
import { TrendingUp, ExternalLink } from 'lucide-react';
import { analyticsAPI } from '../../services/api';

const TrafficSources = ({ siteId }) => {
  const [sources, setSources] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!siteId) return;

    // Reset state immediately when siteId changes
    setSources([]);
    setTopPages([]);
    setLoading(true);

    const fetchData = async () => {
      try {
        // Fetch traffic sources
        const sourcesResponse = await analyticsAPI.getTrafficSources(siteId);
        setSources(sourcesResponse.data?.sources || []);

        // Fetch events to calculate top pages
        const eventsResponse = await analyticsAPI.getEvents(siteId, 100);
        const events = eventsResponse.data?.events || [];

        // Count page views by URL
        const pageCount = {};
        events.forEach(event => {
          if (event.event_type === 'pageview' && event.url) {
            pageCount[event.url] = (pageCount[event.url] || 0) + 1;
          }
        });

        // Convert to array and sort by count
        const topPagesArray = Object.entries(pageCount)
          .map(([url, count]) => ({ url, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5 pages

        setTopPages(topPagesArray);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching traffic data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [siteId]);

  const formatPageName = (url) => {
    try {
      const urlObj = new URL(url);
      let path = urlObj.pathname;

      // Remove leading/trailing slashes
      path = path.replace(/^\/+|\/+$/g, '');

      if (!path || path === '') {
        return 'Homepage';
      }

      // Get last segment
      const segments = path.split('/');
      let pageName = segments[segments.length - 1];

      // Remove file extensions
      pageName = pageName.replace(/\.(html|htm|php|aspx)$/i, '');

      // Capitalize first letter
      pageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

      // Truncate if too long
      if (pageName.length > 20) {
        pageName = pageName.substring(0, 17) + '...';
      }

      return pageName || 'Homepage';
    } catch (e) {
      return 'Unknown';
    }
  };

  const getTotalVisits = () => {
    return sources.reduce((sum, source) => sum + source.value, 0);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg" style={{ minHeight: '500px', maxHeight: '500px' }}>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
          Traffic Sources
        </h3>
        <div className="text-center py-8 text-gray-400">
          Loading traffic data...
        </div>
      </div>
    );
  }

  const totalVisits = getTotalVisits();

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg" style={{ minHeight: '500px', maxHeight: '500px', overflow: 'hidden' }}>
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
        Traffic Sources
      </h3>

      {/* 2-COLUMN LAYOUT - 40% Left, 60% Right */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '40% 60%', height: 'calc(100% - 60px)' }}>

        {/* LEFT COLUMN - Traffic Sources (40% - Narrower) */}
        <div className="space-y-4 overflow-y-auto pr-2">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">Source Breakdown</h4>

          {sources.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              No traffic data yet
            </div>
          ) : (
            sources.map((source, index) => {
              const percentage = totalVisits > 0
                ? ((source.value / totalVisits) * 100).toFixed(1)
                : 0;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {source.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900">
                        {percentage}%
                      </span>
                      <span className="text-xs text-gray-500">
                        ({source.value})
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: source.color
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN - Top Pages (60% - Wider) */}
        <div className="border-l border-gray-200 pl-6 overflow-y-auto">
          <h4 className="text-sm font-semibold text-gray-600 mb-3 text-center">Top Pages</h4>

          {topPages.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              No page data yet
            </div>
          ) : (
            <div className="space-y-3">
              {topPages.map((page, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {formatPageName(page.url)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {page.url.length > 35
                          ? '...' + page.url.slice(-32)
                          : page.url
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className="text-sm font-bold text-gray-900">
                      {page.count}
                    </span>
                    <span className="text-xs text-gray-500">views</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficSources;