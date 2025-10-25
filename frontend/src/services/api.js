import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyticsAPI = {
  getStats: (siteId = 'ghosttrack-test-dashboard') =>
    api.get(`/analytics/stats?site_id=${siteId}`),

  getEvents: (siteId, limit = 50) =>
    api.get(`/analytics/events?site_id=${siteId}&limit=${limit}`),

  getEventsByType: (siteId, startDate, endDate) =>
    api.get(`/analytics/events/by-type?site_id=${siteId}&start_date=${startDate}&end_date=${endDate}`),

  getTrafficSources: (siteId = 'ghosttrack-test-dashboard') =>
    api.get(`/analytics/traffic-sources?site_id=${siteId}`),
};

export const threatsAPI = {
  getAlerts: (siteId) =>
    api.get(`/threats/alerts?site_id=${siteId}`),

  getSuspiciousActivity: (siteId) =>
    api.get(`/threats/suspicious?site_id=${siteId}`),
};

export default api;