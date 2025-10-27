import axios from 'axios';

const API_BASE_URL = 'https://ghosttrack-analytics-production.up.railway.app/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyticsAPI = {
  getStats: (siteId = 'kayvontennis-com') =>
    api.get(`/analytics/stats?site_id=${siteId}`),

  getEvents: (siteId = 'kayvontennis-com', limit = 50) =>
    api.get(`/analytics/events?site_id=${siteId}&limit=${limit}`),

  getEventsByType: (siteId, startDate, endDate) =>
    api.get(`/analytics/events/by-type?site_id=${siteId}&start_date=${startDate}&end_date=${endDate}`),

  getTrafficSources: (siteId = 'kayvontennis-com') =>
    api.get(`/analytics/traffic-sources?site_id=${siteId}`),

  getRecentVisitors: (siteId = 'kayvontennis-com', limit = 10) =>
    api.get(`/analytics/recent-visitors?site_id=${siteId}&limit=${limit}`),
};


export const threatsAPI = {
  getAlerts: (siteId = 'kayvontennis-com') =>
    api.get(`/threats/alerts?site_id=${siteId}`),

  getSuspiciousActivity: (siteId = 'kayvontennis-com') =>
    api.get(`/threats/suspicious?site_id=${siteId}`),
};

export default api;