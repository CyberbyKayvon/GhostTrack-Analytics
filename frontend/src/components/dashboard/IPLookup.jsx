import React, { useState } from 'react';
import { MapPin, Search, Globe, Wifi, Clock, Loader2, Building, Flag, Server, Hash } from 'lucide-react';

const IPLookup = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ipData, setIpData] = useState(null);

  const lookupIP = async () => {
    if (!ipAddress.trim()) {
      setError('Please enter an IP address');
      return;
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ipAddress.trim())) {
      setError('Please enter a valid IP address (e.g., 8.8.8.8)');
      return;
    }

    setLoading(true);
    setError(null);
    setIpData(null);

    try {
      // Using ip-api.com free API with all available fields
      const response = await fetch(`https://ipapi.co/${ipAddress.trim()}/json/`);

      if (!response.ok) {
        throw new Error('Failed to fetch IP data');
      }

      const data = await response.json();

      if (data.status === 'fail') {
        throw new Error(data.message || 'Invalid IP address or lookup failed');
      }

      setIpData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to lookup IP address');
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      lookupIP();
    }
  };

  const formatOffset = (offset) => {
    if (!offset) return 'N/A';
    const hours = Math.floor(Math.abs(offset) / 3600);
    const minutes = Math.floor((Math.abs(offset) % 3600) / 60);
    const sign = offset >= 0 ? '+' : '-';
    return `UTC ${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col" style={{ height: '520px' }}>
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
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={lookupIP}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-3">
        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Looking up IP address...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && !ipData && (
          <div className="text-center py-8">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Enter an IP address</p>
            <p className="text-gray-400 text-xs">Track location, ISP, and network information</p>
          </div>
        )}

        {ipData && (
          <div className="space-y-2">
            {/* IP Address & Type */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 font-medium mb-0.5">IP Address</div>
                <div className="text-sm font-mono font-semibold text-indigo-600">{ipData.query}</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 font-medium mb-0.5">Type</div>
                <div className="text-sm font-semibold text-gray-800">IPv4</div>
              </div>
            </div>

            {/* Geographic Location */}
            <div className="bg-white p-2 rounded-lg border border-gray-200">
              <div className="flex items-center mb-1">
                <MapPin className="w-3 h-3 text-blue-500 mr-1" />
                <div className="text-xs text-gray-500 font-medium">Location</div>
              </div>
              <div className="text-sm font-semibold text-gray-800 mb-0.5">
                {ipData.city}, {ipData.regionName}
              </div>
              <div className="text-xs text-gray-600 space-y-0.5">
                <div>{ipData.country} ({ipData.countryCode}){ipData.zip && ` - ${ipData.zip}`}</div>
                <div className="text-gray-500">{ipData.continent} • Region Code: {ipData.region}</div>
              </div>
            </div>

            {/* Coordinates & Map */}
            <div className="bg-white p-2 rounded-lg border border-gray-200">
              <div className="flex items-center mb-1">
                <Globe className="w-3 h-3 text-orange-500 mr-1" />
                <div className="text-xs text-gray-500 font-medium">Coordinates</div>
              </div>
              <div className="text-xs font-semibold text-gray-800 mb-1">
                Lat: {ipData.lat.toFixed(6)} • Lon: {ipData.lon.toFixed(6)}
              </div>
              <a
                href={`https://www.google.com/maps/@${ipData.lat},${ipData.lon},12z`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                View on Google Maps →
              </a>
            </div>

            {/* Network Information */}
            <div className="bg-white p-2 rounded-lg border border-gray-200">
              <div className="flex items-center mb-1">
                <Wifi className="w-3 h-3 text-green-500 mr-1" />
                <div className="text-xs text-gray-500 font-medium">Network & ISP</div>
              </div>
              <div className="text-sm font-semibold text-gray-800 mb-0.5">{ipData.isp}</div>
              <div className="text-xs text-gray-600 space-y-0.5">
                {ipData.org && <div>Org: {ipData.org}</div>}
                {ipData.as && <div>AS: {ipData.as}</div>}
              </div>
            </div>

            {/* Timezone Info */}
            <div className="bg-white p-2 rounded-lg border border-gray-200">
              <div className="flex items-center mb-1">
                <Clock className="w-3 h-3 text-purple-500 mr-1" />
                <div className="text-xs text-gray-500 font-medium">Time Information</div>
              </div>
              <div className="text-xs text-gray-800 space-y-0.5">
                <div className="font-semibold">{ipData.timezone}</div>
                <div>Offset: {formatOffset(ipData.offset)}</div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-2">
              {/* Mobile Network */}
              {ipData.mobile !== undefined && (
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 font-medium mb-0.5">Mobile Network</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {ipData.mobile ? 'Yes' : 'No'}
                  </div>
                </div>
              )}

              {/* Proxy/VPN */}
              {ipData.proxy !== undefined && (
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 font-medium mb-0.5">Proxy/VPN</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {ipData.proxy ? 'Yes' : 'No'}
                  </div>
                </div>
              )}

              {/* Hosting Provider */}
              {ipData.hosting !== undefined && (
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 font-medium mb-0.5">Hosting</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {ipData.hosting ? 'Yes' : 'No'}
                  </div>
                </div>
              )}
            </div>

            {/* Domain & Reverse DNS */}
            {ipData.reverse && (
              <div className="bg-white p-2 rounded-lg border border-gray-200">
                <div className="flex items-center mb-1">
                  <Server className="w-3 h-3 text-gray-500 mr-1" />
                  <div className="text-xs text-gray-500 font-medium">Reverse DNS</div>
                </div>
                <div className="text-xs font-mono text-gray-800">{ipData.reverse}</div>
              </div>
            )}

            {/* Currency */}
            {ipData.currency && (
              <div className="bg-white p-2 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 font-medium mb-0.5">Currency</div>
                <div className="text-sm font-semibold text-gray-800">
                  {ipData.currency} ({ipData.currencySymbol || 'N/A'})
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IPLookup;