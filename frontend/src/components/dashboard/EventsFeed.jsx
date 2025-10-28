import React from 'react';
import { Activity, MousePointer, Eye, ShoppingCart, AlertTriangle, Shield, Search, Smartphone, Tablet, Monitor, Instagram } from 'lucide-react';
import { UAParser } from 'ua-parser-js';

// Chrome SVG Icon Component
const ChromeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#4285F4"/>
    <path d="M12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6Z" fill="#FFFFFF"/>
    <circle cx="12" cy="12" r="4" fill="#4285F4"/>
    <path d="M12 2C17.5228 2 22 6.47715 22 12H18C18 8.68629 15.3137 6 12 6V2Z" fill="#EA4335"/>
    <path d="M2 12C2 6.47715 6.47715 2 12 2V6C8.68629 6 6 8.68629 6 12H2Z" fill="#FBBC04"/>
    <path d="M12 18V22C6.47715 22 2 17.5228 2 12H6C6 15.3137 8.68629 18 12 18Z" fill="#34A853"/>
    <path d="M22 12C22 17.5228 17.5228 22 12 22V18C15.3137 18 18 15.3137 18 12H22Z" fill="#4285F4"/>
  </svg>
);

// Safari SVG Icon Component
const SafariIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#0066CC" strokeWidth="1.5" fill="white"/>
    <path d="M12 3L12.5 5.5M12 21L11.5 18.5M21 12L18.5 12.5M3 12L5.5 11.5" stroke="#0066CC" strokeWidth="1" strokeLinecap="round"/>
    <path d="M17.5 6.5L16 8M6.5 17.5L8 16M17.5 17.5L16 16M6.5 6.5L8 8" stroke="#0066CC" strokeWidth="1" strokeLinecap="round"/>
    <path d="M12 12L15 9L12 15L9 15L12 12Z" fill="#FF0000"/>
    <path d="M12 12L9 15L12 9L15 9L12 12Z" fill="#0066CC"/>
    <circle cx="12" cy="12" r="1" fill="#0066CC"/>
  </svg>
);

const EventsFeed = ({ events }) => {
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'pageview':
        return <Eye className="w-4 h-4" />;
      case 'click':
        return <MousePointer className="w-4 h-4" />;
      case 'add_to_cart':
        return <ShoppingCart className="w-4 h-4" />;
      case 'suspicious_activity':
      case 'suspicious_behavior':
        return <AlertTriangle className="w-4 h-4" />;
      case 'rapid_test':
        return <Activity className="w-4 h-4" />;
      case 'search':
        return <Search className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'pageview':
        return 'bg-blue-100 text-blue-600';
      case 'click':
        return 'bg-purple-100 text-purple-600';
      case 'add_to_cart':
        return 'bg-green-100 text-green-600';
      case 'suspicious_activity':
      case 'suspicious_behavior':
        return 'bg-red-100 text-red-600';
      case 'rapid_test':
        return 'bg-orange-100 text-orange-600';
      case 'search':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatEventType = (eventType) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTimeLocal = (timestamp) => {
    try {
      let date;
      if (timestamp.endsWith('Z') || timestamp.includes('+')) {
        date = new Date(timestamp);
      } else {
        date = new Date(timestamp + 'Z');
      }

      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;

      const minutesStr = minutes < 10 ? '0' + minutes : minutes;

      return `${hours}:${minutesStr} ${ampm}`;
    } catch (e) {
      return 'N/A';
    }
  };

  const formatDateLocal = (timestamp) => {
    try {
      let date;
      if (timestamp.endsWith('Z') || timestamp.includes('+')) {
        date = new Date(timestamp);
      } else {
        date = new Date(timestamp + 'Z');
      }

      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();

      const monthStr = month < 10 ? '0' + month : month;
      const dayStr = day < 10 ? '0' + day : day;

      return `${monthStr}/${dayStr}/${year}`;
    } catch (e) {
      return 'N/A';
    }
  };

  // IMPROVED: Clean page name - handles long Instagram URLs
  const getPageName = (url) => {
    if (!url) return 'Unknown';

    try {
      const urlObj = new URL(url);

      // Special handling for Instagram referrals
      if (url.includes('fbclid=') || url.includes('igshid=') || url.includes('utm_')) {
        // Clean up tracking parameters and get base page
        const path = urlObj.pathname;
        const segments = path.split('/').filter(s => s);

        if (segments.length > 0) {
          const pageName = segments[segments.length - 1].replace(/\.(html|htm)$/i, '');
          return pageName.charAt(0).toUpperCase() + pageName.slice(1);
        }

        return urlObj.hostname.replace('www.', '');
      }

      // Normal URL processing
      const pageName = urlObj.pathname.split('/').pop() || 'Home';
      return pageName.replace('.html', '').replace(/\.(htm|php)$/i, '') || 'Homepage';
    } catch (e) {
      // Fallback for malformed URLs
      const cleaned = url.split('/').pop()?.split('?')[0] || 'Unknown';
      return cleaned.length > 20 ? cleaned.substring(0, 17) + '...' : cleaned;
    }
  };

  // IMPROVED: Detect Instagram browser and show icon
  const detectBrowserAndDevice = (userAgent) => {
    if (!userAgent) {
      return {
        browserIcon: <Activity className="w-3 h-3" />,
        browserName: 'Unknown',
        browserColor: 'bg-gray-100 text-gray-500',
        deviceIcon: <Monitor className="w-3 h-3" />,
        deviceType: 'desktop'
      };
    }

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    let browserName = result.browser.name || 'Unknown';
    const deviceType = result.device.type || 'desktop';

    // SPECIAL: Detect Instagram in-app browser
    if (userAgent.includes('Instagram')) {
      browserName = 'Instagram';
    }

    // Get browser icon
    let browserIcon, browserColor;

    if (browserName === 'Instagram') {
      browserIcon = <Instagram className="w-3 h-3" />;
      browserColor = 'bg-pink-100 text-pink-700';
    } else if (browserName.toLowerCase().includes('edge')) {
      browserIcon = <div className="text-sm">🌊</div>;
      browserColor = 'bg-cyan-100 text-cyan-700';
    } else if (browserName.toLowerCase().includes('chrome')) {
      browserIcon = <ChromeIcon className="w-3 h-3" />;
      browserColor = 'bg-blue-100 text-blue-700';
    } else if (browserName.toLowerCase().includes('firefox')) {
      browserIcon = <div className="text-sm">🦊</div>;
      browserColor = 'bg-orange-100 text-orange-700';
    } else if (browserName.toLowerCase().includes('safari')) {
      browserIcon = <SafariIcon className="w-3 h-3" />;
      browserColor = 'bg-blue-100 text-blue-700';
    } else if (browserName.toLowerCase().includes('opera')) {
      browserIcon = <div className="text-sm">🎭</div>;
      browserColor = 'bg-red-100 text-red-700';
    } else {
      browserIcon = <Activity className="w-3 h-3" />;
      browserColor = 'bg-gray-100 text-gray-500';
    }

    // Get device icon based on type
    let deviceIcon;
    if (deviceType === 'mobile') {
      deviceIcon = <Smartphone className="w-3 h-3" />;
    } else if (deviceType === 'tablet') {
      deviceIcon = <Tablet className="w-3 h-3" />;
    } else {
      deviceIcon = <Monitor className="w-3 h-3" />;
    }

    return {
      browserIcon,
      browserName,
      browserColor,
      deviceIcon,
      deviceType
    };
  };

  // IMPROVED: Get IP from multiple possible fields with extensive logging
  const getIP = (event) => {
    // Try ALL possible field names
    const ip = event.ip ||
               event.ip_address ||
               event.visitor_ip ||
               event.client_ip ||
               event.ipAddress ||
               event.visitor?.ip ||
               event.visitor?.ip_address;

    // Enhanced logging - shows ALL event fields
    console.log('=== EVENT IP DEBUG ===');
    console.log('Full event object:', event);
    console.log('Event IP lookup results:', {
      event_id: event.id || 'unknown',
      FOUND_IP: ip,
      tried_ip: event.ip,
      tried_ip_address: event.ip_address,
      tried_visitor_ip: event.visitor_ip,
      tried_client_ip: event.client_ip,
      tried_ipAddress: event.ipAddress,
      tried_visitor_obj: event.visitor,
      all_event_keys: Object.keys(event)
    });

    // If still no IP, try to extract from event_data or metadata
    if (!ip && event.event_data) {
      try {
        const data = typeof event.event_data === 'string'
          ? JSON.parse(event.event_data)
          : event.event_data;
        const extractedIp = data.ip || data.client_ip || data.ip_address;
        console.log('Tried event_data:', extractedIp);
        return extractedIp || 'N/A';
      } catch (e) {
        console.log('Error parsing event_data:', e);
        return 'N/A';
      }
    }

    return ip || 'N/A';
  };

  // Create session map for numbering
  const sessionMap = React.useMemo(() => {
    const map = new Map();
    let counter = 1;

    // Sort events by timestamp to assign session numbers chronologically
    const sortedEvents = [...events].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateA - dateB;
    });

    sortedEvents.forEach(event => {
      if (event.session_id && !map.has(event.session_id)) {
        map.set(event.session_id, counter.toString().padStart(3, '0'));
        counter++;
      }
    });

    return map;
  }, [events]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Activity className="w-6 h-6 mr-2 text-purple-500" />
        Recent Events
      </h3>

      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-400 flex-1 flex items-center justify-center">
          No events recorded yet.
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pr-2" style={{ maxHeight: '400px' }}>
          {events.slice(0, 10).map((event, index) => {
            const { browserIcon, browserName, browserColor, deviceIcon, deviceType } = detectBrowserAndDevice(event.user_agent);
            const sessionNumber = sessionMap.get(event.session_id) || '???';
            const ipAddress = getIP(event);

            return (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${getEventColor(event.event_type)} flex-shrink-0`}>
                      {getEventIcon(event.event_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm mb-1">
                        {formatEventType(event.event_type)}
                      </div>
                      <div className="text-xs text-gray-500 mb-1 truncate">
                        Page: {getPageName(event.url)}
                      </div>
                      {/* Browser, Device, Session */}
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                        <div className={`text-xs flex items-center space-x-1 px-2 py-0.5 rounded ${browserColor}`}>
                          {browserIcon}
                          <span>{browserName}</span>
                        </div>
                        <div className="text-xs flex items-center space-x-1 px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                          {deviceIcon}
                          <span className="capitalize">{deviceType}</span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          Session #{sessionNumber}
                        </div>
                      </div>
                      {/* IP Address - ALWAYS SHOWN (even if N/A for debugging) */}
                      <div className={`text-xs font-mono px-2 py-1 rounded inline-block border font-semibold ${
                        ipAddress && ipAddress !== 'N/A'
                          ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                          : 'text-gray-500 bg-gray-50 border-gray-200'
                      }`}>
                        🌐 IP: {ipAddress}
                      </div>
                    </div>
                  </div>
                  {/* RIGHT SIDE - TIME AND DATE ONLY */}
                  <div className="text-right flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                    <div className="text-sm font-bold text-blue-600">
                      {formatTimeLocal(event.timestamp)}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {formatDateLocal(event.timestamp)}
                    </div>
                    {event.is_bot && (
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Bot
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsFeed;