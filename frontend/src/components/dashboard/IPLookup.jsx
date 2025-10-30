import React, { useState } from 'react';
import { Search, MapPin, Globe, Wifi, Server, Navigation } from 'lucide-react';

const IPTracker = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [ipData, setIpData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!ipAddress.trim()) {
      setError('Please enter an IP address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      const data = await response.json();

      if (data.error) {
        setError(data.reason || 'Invalid IP address');
        setIpData(null);
      } else {
        setIpData(data);
        setError('');
      }
    } catch (err) {
      setError('Failed to fetch IP data. Please try again.');
      setIpData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg" style={{ minHeight: '500px' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MapPin className="text-blue-600" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          IP Address Tracker
        </h2>
      </div>

      {/* Search Input */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter IP address (e.g., 102.129.153.238)"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 font-mono"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
        >
          <Search size={20} />
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* IP Data Display */}
      {ipData && (
        <div className="space-y-4">
          {/* Main IP Info Card */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-black text-gray-900">IP Address</h3>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-lg font-mono">
                {ipData.ip}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Type</p>
                <p className="text-lg font-bold text-gray-900">{ipData.version || 'IPv4'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Organization</p>
                <p className="text-lg font-bold text-gray-900">{ipData.org || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-green-600" size={24} />
              <h3 className="text-xl font-black text-gray-900">Location</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">City</p>
                <p className="text-base font-bold text-gray-900">{ipData.city || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Region</p>
                <p className="text-base font-bold text-gray-900">{ipData.region || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Country</p>
                <p className="text-base font-bold text-gray-900">
                  {ipData.country_name || 'Unknown'} ({ipData.country_code || 'N/A'})
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Postal Code</p>
                <p className="text-base font-bold text-gray-900">{ipData.postal || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Coordinates & Network */}
          <div className="grid grid-cols-2 gap-4">
            {/* Coordinates */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Navigation className="text-purple-600" size={24} />
                <h3 className="text-xl font-black text-gray-900">Coordinates</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Latitude</p>
                  <p className="text-base font-bold text-gray-900 font-mono">{ipData.latitude || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Longitude</p>
                  <p className="text-base font-bold text-gray-900 font-mono">{ipData.longitude || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Timezone</p>
                  <p className="text-base font-bold text-gray-900">{ipData.timezone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Network Info */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Wifi className="text-orange-600" size={24} />
                <h3 className="text-xl font-black text-gray-900">Network</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">ASN</p>
                  <p className="text-base font-bold text-gray-900 font-mono">{ipData.asn || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Network</p>
                  <p className="text-base font-bold text-gray-900 font-mono">{ipData.network || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Currency</p>
                  <p className="text-base font-bold text-gray-900">
                    {ipData.currency ? `${ipData.currency} (${ipData.currency_name})` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!ipData && !error && !loading && (
        <div className="text-center py-12">
          <div className="inline-block p-6 bg-gray-100 rounded-2xl mb-4">
            <MapPin className="text-gray-300" size={64} />
          </div>
          <p className="text-gray-900 font-bold text-xl mb-2">Search for an IP Address</p>
          <p className="text-gray-500">Enter an IP address above to view detailed information</p>
        </div>
      )}
    </div>
  );
};

export default IPTracker;