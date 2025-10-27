import React, { useState } from 'react';
import { Search, Globe } from 'lucide-react';

const IPLookup = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLookup = () => {
    // Placeholder - functionality can be added later
    alert('IP Lookup feature coming soon! This is a placeholder for now.');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Globe className="w-6 h-6 mr-2 text-green-500" />
        IP Address Tracker
      </h3>

      {/* Input Section */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter IP address (e.g., 8.8.8.8)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleLookup}
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Search className="w-4 h-4 mr-2" />
          Track
        </button>
      </div>

      {/* Placeholder Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-8 text-gray-400">
          <Globe className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium">IP Geolocation Feature</p>
          <p className="text-xs mt-2">Enter an IP address to view location details</p>
          <p className="text-xs mt-4 text-gray-300">Coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default IPLookup;