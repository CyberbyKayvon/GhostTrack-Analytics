import React, { useState, useEffect } from 'react';
import { Activity, Users, Eye, Shield } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import AddSiteModal from '../components/common/AddSiteModal';
import StatCard from '../components/common/StatCard';
import EventsFeed from '../components/dashboard/EventsFeed';
import LatestVisits from '../components/dashboard/LatestVisits';
import TrafficSources from '../components/dashboard/TrafficSources';
import IPLookup from '../components/dashboard/IPLookup';
import TodayStats from '../components/dashboard/TodayStats';
import { analyticsAPI } from '../services/api';
import HeatmapViewer from '../components/dashboard/Heatmap';
import { getAllSites, initializeSites, setLastViewedSite, getLastViewedSite } from '../utils/siteManager';

const Dashboard = () => {
  // Initialize sites from localStorage
  useEffect(() => {
    initializeSites();
  }, []);

  const [sites, setSites] = useState(getAllSites());

  // Remember last viewed site, or default to first site
  const lastViewedSite = getLastViewedSite();
  const initialSite = sites.find(s => s.id === lastViewedSite)?.id || sites[0]?.id || 'kayvontennis-com';

  const [currentSiteId, setCurrentSiteId] = useState(initialSite);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [siteStatuses, setSiteStatuses] = useState({});

  const [stats, setStats] = useState({
    total_events: 0,
    unique_visitors: 0,
    page_views: 0,
    bot_detections: 0,
    suspicious_activity: 0
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset state immediately when currentSiteId changes
    setStats({
      total_events: 0,
      unique_visitors: 0,
      page_views: 0,
      bot_detections: 0,
      suspicious_activity: 0
    });
    setEvents([]);
    setLoading(true);

    const fetchDashboardData = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          analyticsAPI.getStats(currentSiteId),
          analyticsAPI.getEvents(currentSiteId, 50)
        ]);

        setStats({
          total_events: statsRes.data.total_events || 0,
          unique_visitors: statsRes.data.unique_visitors || 0,
          page_views: statsRes.data.page_views || 0,
          bot_detections: statsRes.data.bot_detections || 0,
          suspicious_activity: statsRes.data.suspicious_activity || 0
        });

        setEvents(eventsRes.data.events || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [currentSiteId]);

  // Check connection status for all sites
  useEffect(() => {
    const checkSiteStatuses = async () => {
      const statuses = {};

      for (const site of sites) {
        try {
          const response = await analyticsAPI.getStats(site.id);
          const totalEvents = response.data.total_events || 0;

          if (totalEvents > 0) {
            statuses[site.id] = 'active';
          } else {
            statuses[site.id] = 'waiting';
          }
        } catch (error) {
          statuses[site.id] = 'waiting';
        }
      }

      setSiteStatuses(statuses);
    };

    checkSiteStatuses();
    // Check status every 30 seconds
    const interval = setInterval(checkSiteStatuses, 30000);
    return () => clearInterval(interval);
  }, [sites]);

  const handleSiteAdded = (newSite) => {
    // Reload sites from localStorage
    const updatedSites = getAllSites();
    setSites(updatedSites);

    // Switch to the new site and remember it
    setCurrentSiteId(newSite.id);
    setLastViewedSite(newSite.id);
  };

  const handleSiteChange = (siteId) => {
    setCurrentSiteId(siteId);
    setLastViewedSite(siteId); // Remember the last viewed site
  };

  const handleSiteDeleted = (deletedSiteId) => {
    // Reload sites from localStorage
    const updatedSites = getAllSites();
    setSites(updatedSites);

    // If the deleted site was the current one, switch to first available
    if (deletedSiteId === currentSiteId) {
      const newSiteId = updatedSites[0]?.id;
      if (newSiteId) {
        setCurrentSiteId(newSiteId);
        setLastViewedSite(newSiteId);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar
        currentSiteId={currentSiteId}
        onSiteChange={handleSiteChange}
        sites={sites}
        siteStatuses={siteStatuses}
        onAddSite={() => setIsAddSiteModalOpen(true)}
        onSiteDeleted={handleSiteDeleted}
      />

      <AddSiteModal
        isOpen={isAddSiteModalOpen}
        onClose={() => setIsAddSiteModalOpen(false)}
        onSiteAdded={handleSiteAdded}
      />

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* ROW 1 - Primary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Events"
            value={stats.total_events}
            icon={Activity}
            gradient="bg-gradient-to-br from-purple-500 to-purple-700"
          />
          <StatCard
            title="Unique Visitors"
            value={stats.unique_visitors}
            icon={Users}
            gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          />
          <StatCard
            title="Page Views"
            value={stats.page_views}
            icon={Eye}
            gradient="bg-gradient-to-br from-green-500 to-green-700"
          />
          <StatCard
            title="Suspicious Activity"
            value={stats.suspicious_activity}
            icon={Shield}
            gradient="bg-gradient-to-br from-red-500 to-red-700"
          />
        </div>

        {/* ROW 2 - Today's Activity (LEFT) & Recent Events (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TodayStats siteId={currentSiteId} />
          <EventsFeed events={events} />
        </div>

        {/* ROW 3 - Latest Users (FULL WIDTH) */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <LatestVisits siteId={currentSiteId} />
        </div>

        {/* ROW 4 - Traffic Sources (LEFT HALF) & IP Tracker (RIGHT HALF) - EQUAL HEIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <TrafficSources siteId={currentSiteId} />
          <IPLookup />
        </div>

        {/* ROW 5 - Heatmap (FULL WIDTH) */}
        <div className="grid grid-cols-1 gap-6 mt-6">
          <HeatmapViewer siteId={currentSiteId} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;