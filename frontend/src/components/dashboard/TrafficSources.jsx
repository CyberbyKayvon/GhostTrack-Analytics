import React, { useState, useEffect } from 'react';
import { TrendingUp, Globe } from 'lucide-react';
import { analyticsAPI } from '../../services/api';

const TrafficSources = ({ siteId }) => {
  const [sources, setSources] = useState([]);
  const [geoLocations, setGeoLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to determine region from IP (simple categorization)
  const getRegionFromIP = (ip) => {
    if (!ip || ip === 'Unknown') return 'Unknown';

    // This is a simplified version - can be enhanced with proper geolocation API
    // For now, categorize by IP ranges (very basic)
    const firstOctet = parseInt(ip.split('.')[0]);

    // US-based IPs (simplified)
    if (firstOctet >= 3 && firstOctet <= 126) return 'North America';
    // Europe
    if (firstOctet >= 128 && firstOctet <= 191) return 'Europe';
    // Asia-Pacific
    if (firstOctet >= 192 && firstOctet <= 223) return 'Asia-Pacific';
    // Other/Unknown
    return 'Other Regions';
  };

  useEffect(() => {
    if (!siteId) return;

    // Reset state immediately when siteId changes
    setSources([]);
    setGeoLocations([]);
    setLoading(true);

    const fetchData = async () => {
      try {
        // Fetch traffic sources
        const sourcesResponse = await analyticsAPI.getTrafficSources(siteId);
        setSources(sourcesResponse.data?.sources || []);

        // Fetch recent visitors to get geographic data
        const visitorsResponse = await analyticsAPI.getRecentVisitors(siteId, 50);
        const visitors = visitorsResponse.data?.visitors || [];

        // Count visitors by region
        const regionCount = {};
        visitors.forEach(visitor => {
          if (visitor.ip) {
            const region = getRegionFromIP(visitor.ip);
            regionCount[region] = (regionCount[region] || 0) + 1;
          }
        });

        // Convert to array and sort by count
        const geoArray = Object.entries(regionCount)
          .map(([region, count]) => ({ region, count }))
          .sort((a, b) => b.count - a.count);

        setGeoLocations(geoArray);
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

        {/* RIGHT COLUMN - Geographic Locations (60% - Wider) */}
        <div className="border-l border-gray-200 pl-6 overflow-y-auto">
          <h4 className="text-sm font-semibold text-gray-600 mb-3 text-center flex items-center justify-center gap-2">
            <Globe size={16} className="text-blue-500" />
            Visitor Locations
          </h4>

          {geoLocations.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              No location data yet
            </div>
          ) : (
            <div className="space-y-3">
              {geoLocations.map((location, index) => {
                const totalVisitors = geoLocations.reduce((sum, loc) => sum + loc.count, 0);
                const percentage = ((location.count / totalVisitors) * 100).toFixed(1);

                // Color scheme for regions
                const colors = [
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-purple-500',
                  'bg-orange-500',
                  'bg-pink-500'
                ];
                const color = colors[index % colors.length];

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {location.region}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gray-900">
                          {percentage}%
                        </span>
                        <span className="text-xs text-gray-500">
                          ({location.count})
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${color} transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficSources;