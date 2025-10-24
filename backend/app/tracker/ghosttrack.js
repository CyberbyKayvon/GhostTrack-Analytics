// GhostTrack - Privacy-First Analytics Tracker
(function() {
    'use strict';
    
    // Configuration
    const config = {
        url: window.ghostTrackUrl || 'http://localhost:8000/api/v1/events/track',
        siteId: window.ghostTrackSiteId || 'default-site',
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
    
    // Send event to server
    function sendEvent(eventType, metadata = {}) {
        const eventData = {
            site_id: config.siteId,
            event_type: eventType,
            url: window.location.href,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            session_id: getSessionId(),
            metadata: metadata
        };
        
        if (config.debug) {
            console.log('👻 GhostTrack - Sending event:', eventType, eventData);
        }
        
        // Send to server
        fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        })
        .then(response => response.json())
        .then(data => {
            if (config.debug) {
                console.log('✅ GhostTrack - Event tracked:', data);
            }
        })
        .catch(error => {
            if (config.debug) {
                console.error('❌ GhostTrack - Error:', error);
            }
        });
    }
    
    // Public API
    window.ghostTrack = {
        // Track pageview
        pageview: function() {
            sendEvent('pageview', {
                page_title: document.title,
                page_path: window.location.pathname
            });
        },
        
        // Track custom event
        track: function(eventType, metadata = {}) {
            sendEvent(eventType, metadata);
        },
        
        // Update configuration
        config: function(newConfig) {
            Object.assign(config, newConfig);
        }
    };
    
    // Auto-track pageview on load (optional)
    // Uncomment next line to enable:
    // window.addEventListener('load', () => window.ghostTrack.pageview());
    
    if (config.debug) {
        console.log('👻 GhostTrack initialized!', config);
    }
})();