import React from 'react';
import { User, Clock, Globe } from 'lucide-react';

const LatestVisits = () => {
  // Placeholder data
  const visits = [
    {
      id: 1,
      visitor: "Visitor #1267",
      ip: "107.136.164.146",
      pages: 2,
      duration: "0:06:36",
      lastPage: "Kayvon Tennis - Elite Coaching",
      time: "Just now"
    },
    {
      id: 2,
      visitor: "Visitor #1266",
      ip: "205.169.39.188",
      pages: 1,
      duration: "0:00:12",
      lastPage: "Home Page",
      time: "2 min ago"
    },
    {
      id: 3,
      visitor: "Visitor #1265",
      ip: "192.168.1.105",
      pages: 4,
      duration: "0:08:22",
      lastPage: "Contact Form",
      time: "5 min ago"
    }
  ];

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
              <span className="text-xs text-gray-400">{visit.time}</span>
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
              <span className="text-gray-600">{visit.lastPage}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestVisits;