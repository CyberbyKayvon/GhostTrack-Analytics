import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';

const IPLookup = () => {
  const [ipAddress, setIpAddress] = useState('');

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col" style={{ height: '280px' }}>
      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
        IP Address Tracker
      </h3>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Enter IP address (e.g., 8.8.8.8)"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center py-4">
          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">IP Lookup Coming Soon</p>
          <p className="text-gray-400 text-xs">Track and analyze IP addresses</p>
        </div>
      </div>
    </div>
  );
};

export default IPLookup;