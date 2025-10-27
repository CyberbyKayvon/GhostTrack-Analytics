import React, { useState } from 'react';
import { Search, MapPin, Globe, Calendar, Clock, Wifi } from 'lucide-react';
import { analyticsAPI } from '../../services/api';

const IPLookup = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [ipData, setIpData] = useState(null);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    if (!ipAddress) {
      setError('Please enter an IP address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await analyticsAPI.lookupIP(ipAddress);
      setIpData(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to lookup IP address');
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
    <div className="bg-white p-6 rounded-xl shadow-lg">
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
          {loading ? 'Searching...' : 'Track'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Results Section */}
      {ipData && (
        <div className="space-y-3">
          {/* Banner with ASCII art style */}
          <div className="bg-gradient-to-r from-green-900 to-green-700 p-4 rounded-lg text-center">
            <div className="text-green-300 font-mono text-xs mb-2">
              ═════════════════════════════════════
            </div>
            <div className="text-green-400 font-bold text-lg">
              GHOST TRACKER - IP ADDRESS
            </div>
            <div className="text-green-300 font-mono text-xs">
              @CODE BY KAYVON
            </div>
            <div className="text-green-300 font-mono text-xs mt-2">
              ═════════════════════════════════════
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-green-600 font-bold text-sm mb-3 border-b border-green-200 pb-2">
              ═══════════════ SHOW INFORMATION IP ADDRESS ═══════════════
            </h4>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {/* Row 1 */}
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">IP target</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-green-600 font-bold">{ipData.ip}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">Type IP</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800">{ipData.type || 'IPv4'}</span>
              </div>

              {/* Row 2 */}
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">Country</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-green-600 font-semibold">{ipData.country_name}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">Country Code</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800">{ipData.country_code}</span>
              </div>

              {/* Row 3 */}
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">City</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-green-600 font-semibold">{ipData.city}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">Continent</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800">{ipData.continent_name}</span>
              </div>

              {/* Row 4 */}
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">Continent Code</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800">{ipData.continent_code}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">Region</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-green-600 font-semibold">{ipData.region_name}</span>
              </div>

              {/* Row 5 */}
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">Region Code</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800">{ipData.region_code}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">Latitude</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-green-600">{ipData.latitude}</span>
              </div>

              {/* Row 6 */}
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">Longitude</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-green-600">{ipData.longitude}</span>
              </div>
              <div className="flex col-span-2">
                <span className="text-gray-600 font-medium w-32">Maps</span>
                <span className="text-gray-500 mr-2">:</span>
                <a
                  href={`https://www.google.com/maps/@${ipData.latitude},${ipData.longitude},12z`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  https://www.google.com/maps/@{ipData.latitude},{ipData.longitude}
                </a>
              </div>

              {/* Row 7 */}
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">EU</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800">{ipData.is_eu ? 'True' : 'False'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">Postal</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-green-600">{ipData.zip}</span>
              </div>

              {/* Row 8 */}
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">Calling Code</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800">{ipData.country_calling_code}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">Capital</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-green-600 font-semibold">{ipData.country_capital}</span>
              </div>

              {/* Row 9 */}
              <div className="flex col-span-2">
                <span className="text-gray-600 font-medium w-32">Borders</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800">{ipData.country_tld}</span>
              </div>

              {/* Row 10 */}
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">Country Flag</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800">{ipData.country_flag_emoji}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">ASN</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-green-600">{ipData.asn}</span>
              </div>

              {/* Row 11 */}
              <div className="flex col-span-2">
                <span className="text-gray-600 font-medium w-32">ORG</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800 truncate">{ipData.org}</span>
              </div>

              {/* Row 12 */}
              <div className="flex col-span-2">
                <span className="text-gray-600 font-medium w-32">ISP</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800 truncate">{ipData.isp}</span>
              </div>

              {/* Row 13 */}
              <div className="flex col-span-2">
                <span className="text-gray-600 font-medium w-32">Domain</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800">{ipData.org_domain || 'N/A'}</span>
              </div>

              {/* Row 14 */}
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">ID</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800">{ipData.country_code}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">ABBR</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800">{ipData.time_zone?.abbr || 'N/A'}</span>
              </div>

              {/* Row 15 */}
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">DST</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800">{ipData.time_zone?.is_dst ? 'True' : 'False'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">Offset</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-green-600">{ipData.time_zone?.offset}</span>
              </div>

              {/* Row 16 */}
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">UTC</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-gray-800">{ipData.time_zone?.current_time_offset || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 font-medium w-32">Current Time</span>
                <span className="text-gray-500 mr-2">:</span>
                <span className="text-green-600">{ipData.time_zone?.current_time || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions when no data */}
      {!ipData && !loading && !error && (
        <div className="text-center py-8 text-gray-400">
          <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Enter an IP address to view location details</p>
          <p className="text-xs mt-1">Powered by IPGeolocation API</p>
        </div>
      )}
    </div>
  );
};

export default IPLookup;
