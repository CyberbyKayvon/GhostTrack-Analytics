import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';

const IPLookup = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [ipData, setIpData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLookup = async () => {
    if (!ipAddress.trim()) {
      setError('Please enter an IP address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      const data = await response.json();

      if (data.error) {
        setError(data.reason || 'Invalid IP address');
        setIpData(null);
      } else {
        setIpData(data);
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch IP information');
      setIpData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <MapPin className="w-6 h-6 mr-2 text-blue-500" />
        IP Address Tracker
      </h3>

      {/* Search Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter IP address (e.g., 8.8.8.8)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleLookup}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Results - Flex-1 to fill remaining space */}
      <div className="flex-1 flex items-center justify-center">
        {!ipData && !loading && (
          <div className="text-center text-gray-400">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-12 h-12 text-blue-600" />
            </div>
            <p className="font-medium mb-2">Enter an IP address</p>
            <p className="text-sm">Track location, ISP, and network information</p>
          </div>
        )}

        {ipData && (
          <div className="w-full space-y-4">
            {/* IP Address */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">IP Address</div>
              <div className="text-lg font-bold text-gray-900">{ipData.ip}</div>
              <div className="text-xs text-gray-500 mt-1">Type: {ipData.version}</div>
            </div>

            {/* Location */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Location
              </div>
              <div className="font-semibold text-gray-900">
                {ipData.city}, {ipData.region}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {ipData.country_name} ({ipData.country_code})
              </div>
              {ipData.postal && (
                <div className="text-xs text-gray-500 mt-1">ZIP: {ipData.postal}</div>
              )}
            </div>

            {/* Coordinates */}
            {ipData.latitude && ipData.longitude && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Coordinates</div>
                <div className="text-sm font-mono text-gray-700">
                  {ipData.latitude}, {ipData.longitude}
                </div>
              </div>
            )}

            {/* Network Info */}
            {ipData.org && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Network</div>
                <div className="text-sm text-gray-700">{ipData.org}</div>
                {ipData.asn && (
                  <div className="text-xs text-gray-500 mt-1">ASN: {ipData.asn}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IPLookup;