import React, { useState, useEffect } from 'react';
import { User, Clock, Globe } from 'lucide-react';
import { analyticsAPI } from '../../services/api';

const LatestVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitors();
    const interval = setInterval(fetchVisitors, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchVisitors = async () => {
    try {
      const response = await analyticsAPI.getRecentVisitors('ghosttrack-test-dashboard', 5);
      setVisits(response.data.visitors || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">👥 Latest Visits</h3>
        <div className="text-center py-8 text-gray-400">Loading visitors...</div>
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">👥 Latest Visits</h3>
        <div className="text-center py-8 text-gray-400">
          <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No recent visitors</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">👥 Latest Visits</h3>
      <div className="space-y-4">
        {visits.map((visit) => (
          <div key={visit.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-500" />
                <span className="font-semibold text-gray-800">{visit.visitor}</span>
              </div>
              <span className="text-xs text-gray-400">{visit.time_ago}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Globe className="w-4 h-4" />
                <span>{visit.ip}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{visit.duration}</span>
              </div>
            </div>

            <div className="mt-2 text-sm">
              <span className="text-gray-500">Pages: </span>
              <span className="font-medium text-gray-700">{visit.pages}</span>
              <span className="text-gray-400 mx-2">•</span>
              <span className="text-gray-600">{visit.last_page}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestVisits;