// GhostTrack Analytics - Tracking Script with Persistent Session IDs + Heatmap
//
// Usage:
// <script src="https://your-api.com/tracker/ghosttrack.js"
//         data-ghosttrack
//         data-site-id="my-website"
//         data-api-url="https://your-api.com"
//         data-debug="true">
// </script>
//
// Parameters:
//   data-ghosttrack: Required - marks this as the GhostTrack script
//   data-site-id: Your unique site identifier (default: 'default-site')
//   data-api-url: Your GhostTrack API URL (default: Railway production URL)
//   data-debug: Enable console logging (default: false for silent operation)

(function() {
  'use strict';

  // Get configuration from script tag data attributes or use defaults
  const currentScript = document.currentScript || document.querySelector('script[data-ghosttrack]');
  const SITE_ID = currentScript?.dataset?.siteId || 'default-site';
  const API_BASE = currentScript?.dataset?.apiUrl || 'https://ghosttrack-analytics-production.up.railway.app';
  const DEBUG_MODE = currentScript?.dataset?.debug === 'true';
  const API_ENDPOINT = `${API_BASE}/api/v1/events/track`;
  const HEATMAP_ENDPOINT = `${API_BASE}/api/v1/heatmap/track`;
  const SESSION_STORAGE_KEY = 'ghosttrack_session_id';

  /**
   * Generate a unique session ID
   * This creates a persistent ID stored in localStorage
   */
  function getOrCreateSessionId() {
    // Try to get existing session ID from localStorage
    let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!sessionId) {
      // Generate a new unique session ID
      sessionId = generateUniqueId();
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }

    return sessionId;
  }

  /**
   * Generate a unique ID using timestamp and random values
   */
  function generateUniqueId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomStr}`;
  }

  /**
   * Detect if user is a bot
   */
  function isBot() {
    const botPatterns = [
      /bot/i, /spider/i, /crawl/i, /APIs-Google/i, /AdsBot/i,
      /Googlebot/i, /mediapartners/i, /Google Favicon/i,
      /FeedFetcher/i, /Google-Read-Aloud/i, /DuplexWeb-Google/i,
      /googleweblight/i, /bing/i, /yandex/i, /baidu/i, /duckduck/i,
      /yahoo/i, /ecosia/i, /ia_archiver/i, /semrush/i, /lighthouse/i
    ];

    const userAgent = navigator.userAgent;
    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Track an event
   */
  function trackEvent(eventType, eventData = {}) {
    const sessionId = getOrCreateSessionId();

    const payload = {
      site_id: SITE_ID,
      event_type: eventType,
      url: window.location.href,
      referrer: document.referrer || 'direct',
      user_agent: navigator.userAgent,
      session_id: sessionId,  // CRITICAL: Include persistent session ID
      is_bot: isBot(),
      timestamp: new Date().toISOString(),
      ...eventData
    };

    // Send to API using fetch with credentials: 'omit' for CORS wildcard compatibility
    // NOTE: sendBeacon always includes credentials, so we can't use it with wildcard CORS
    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'omit',  // CRITICAL: Required for CORS wildcard origins
      keepalive: true
    }).catch(err => {
      if (DEBUG_MODE) console.error('Tracking error:', err);
    });
  }

  /**
   * Track heatmap click with coordinates
   */
  function trackHeatmapClick(event) {
    const sessionId = getOrCreateSessionId();

    const payload = {
      site_id: SITE_ID,
      session_id: sessionId,
      page_url: window.location.href,
      x: event.pageX,
      y: event.pageY,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight
    };

    // Send heatmap data
    fetch(HEATMAP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'omit',  // CRITICAL: Don't send credentials for CORS wildcard
      keepalive: true
    }).catch(err => {
      if (DEBUG_MODE) console.error('Heatmap tracking error:', err);
    });
  }

  /**
   * Track page view on load
   */
  function trackPageView() {
    trackEvent('pageview', {
      page_title: document.title,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight
    });
  }

  /**
   * Track all clicks with link destination tracking
   */
  function trackClick(event) {
    let element = event.target;
    const tagName = element.tagName.toLowerCase();

    // Find the closest link (in case they clicked a child element of <a>)
    let linkElement = element.closest('a');
    let linkData = {};

    if (linkElement && linkElement.href) {
      const href = linkElement.href;
      const isPDF = href.toLowerCase().endsWith('.pdf');
      const opensNewTab = linkElement.target === '_blank';
      const isExternal = linkElement.hostname !== window.location.hostname;

      linkData = {
        link_url: href,
        link_text: linkElement.innerText?.substring(0, 100) || null,
        is_pdf: isPDF,
        opens_new_tab: opensNewTab,
        is_external: isExternal
      };

      if (DEBUG_MODE) {
        console.log('Link click detected:', linkData);
      }
    }

    // Track regular click event with link data
    trackEvent('click', {
      element_tag: tagName,
      element_id: element.id || null,
      element_class: element.className || null,
      element_text: element.innerText?.substring(0, 50) || null,
      page_title: document.title,
      ...linkData
    });

    // Track heatmap click
    trackHeatmapClick(event);
  }

  /**
   * Track add to cart (customize selector for your site)
   */
  function setupAddToCartTracking() {
    // Example: Track clicks on buttons with class "add-to-cart"
    document.addEventListener('click', function(e) {
      if (e.target.matches('.add-to-cart, [data-add-to-cart]')) {
        trackEvent('add_to_cart', {
          product_name: e.target.getAttribute('data-product-name') || 'unknown',
          product_id: e.target.getAttribute('data-product-id') || null,
          page_title: document.title
        });
      }
    });
  }

  /**
   * Track suspicious activity (rapid clicking, etc.)
   */
  function setupSuspiciousActivityDetection() {
    let clickCount = 0;
    let clickTimer = null;

    document.addEventListener('click', function() {
      clickCount++;

      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 3000);
      }

      // If more than 10 clicks in 3 seconds, flag as suspicious
      if (clickCount > 10) {
        trackEvent('suspicious_activity', {
          reason: 'rapid_clicking',
          click_count: clickCount,
          page_title: document.title
        });
        clickCount = 0;
        clearTimeout(clickTimer);
      }
    });
  }

  /**
   * Initialize tracking
   */
  function init() {
    if (DEBUG_MODE) {
      console.log('GhostTrack Analytics initialized');
      console.log('Site ID:', SITE_ID);
      console.log('API Endpoint:', API_BASE);
      console.log('Session ID:', getOrCreateSessionId());
    }

    // Track initial pageview
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', trackPageView);
    } else {
      trackPageView();
    }

    // Track all clicks
    document.addEventListener('click', trackClick);

    // Setup custom tracking
    setupAddToCartTracking();
    setupSuspiciousActivityDetection();

    // Track page visibility changes (user leaving) - REMOVED to reduce duplicate events
    // The page_exit event below is sufficient, and click tracking captures link navigation

    // Track before page unload (only track actual page exits, not link clicks)
    let lastClickWasLink = false;
    let lastClickTime = 0;

    // Listen to clicks to detect if user clicked a link
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link && link.href) {
        lastClickWasLink = true;
        lastClickTime = Date.now();
      }
    }, true); // Use capture phase to run before other handlers

    window.addEventListener('beforeunload', function() {
      // Don't track page_exit if user just clicked a link (we already tracked the click)
      const timeSinceClick = Date.now() - lastClickTime;
      if (lastClickWasLink && timeSinceClick < 500) {
        // Skip tracking - the link click event already captured this navigation
        return;
      }

      trackEvent('page_exit', {
        page_title: document.title,
        time_on_page: performance.now()
      });
    });
  }

  // Auto-initialize when script loads
  init();

  // Expose global tracking function for custom events
  window.ghostTrack = {
    track: trackEvent,
    getSessionId: getOrCreateSessionId
  };
})();