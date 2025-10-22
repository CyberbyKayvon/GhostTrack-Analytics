(function(window, document) {
    'use strict';
    
    // GhostTrack configuration
    const config = {
        apiUrl: window.ghostTrackUrl || 'http://localhost:8000/api/v1/events/track',
        siteId: window.ghostTrackSiteId || 'demo',
        debug: window.ghostTrackDebug || false
    };
    
    // Generate session ID
    function getSessionId() {
        let sessionId = sessionStorage.getItem('ghosttrack_session');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('ghosttrack_session', sessionId);
        }
        return sessionId;
    }
    
    // Send event to backend
    function sendEvent(eventData) {
        const payload = {
            site_id: config.siteId,
            event_type: eventData.event_type || 'pageview',
            url: window.location.href,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            session_id: getSessionId(),
            metadata: eventData.metadata || {}
        };
        
        if (config.debug) {
            console.log('[GhostTrack] Sending event:', payload);
        }
        
        // Use sendBeacon for reliability
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            navigator.sendBeacon(config.apiUrl, blob);
        } else {
            // Fallback to fetch
            fetch(config.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(err => {
                if (config.debug) console.error('[GhostTrack] Error:', err);
            });
        }
    }
    
    // Track pageview
    function trackPageview() {
        sendEvent({ event_type: 'pageview' });
    }
    
    // Track custom event
    function trackEvent(eventName, metadata) {
        sendEvent({
            event_type: eventName,
            metadata: metadata
        });
    }
    
    // Auto-track pageviews
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageview);
    } else {
        trackPageview();
    }
    
    // Expose API
    window.ghostTrack = {
        track: trackEvent,
        pageview: trackPageview
    };
    
    if (config.debug) {
        console.log('[GhostTrack] Initialized', config);
    }
    
})(window, document);
