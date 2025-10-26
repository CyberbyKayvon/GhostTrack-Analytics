import React, { useState, useEffect } from 'react';
import { FileText, Eye, Users, TrendingUp } from 'lucide-react';
import { analyticsAPI } from '../../services/api';

const TopPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopPages();
    const interval = setInterval(fetchTopPages, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTopPages = async () => {
    try {
      const response = await analyticsAPI.getTopPages('ghosttrack-test-dashboard', 10);
      setPages(response.data.pages || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching top pages:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
          Top Pages (Last 7 Days)
        </h3>
        <div className="text-center py-8 text-gray-400 flex-1 flex items-center justify-center">
          Loading pages...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
        Top Pages (Last 7 Days)
      </h3>

      {pages.length === 0 ? (
        <div className="text-center py-8 text-gray-400 flex-1 flex items-center justify-center">
          No page data available yet.
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pr-2" style={{ maxHeight: '400px' }}>
          {pages.map((page, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Header with rank and page name */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 px-2.5 py-1 rounded-full">
                    <span className="text-white text-xs font-bold">#{index + 1}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-800">{page.page}</span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 p-1.5 rounded">
                    <Eye className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Views</div>
                    <div className="font-bold text-blue-600">{page.views}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-purple-100 p-1.5 rounded">
                    <Users className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Visitors</div>
                    <div className="font-bold text-purple-600">{page.unique_visitors}</div>
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

export default TopPages;
