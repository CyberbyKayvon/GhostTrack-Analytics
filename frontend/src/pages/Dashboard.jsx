import React, { useState, useEffect } from 'react';
import { Activity, Users, Eye, Shield } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import StatCard from '../components/common/StatCard';
import EventsFeed from '../components/dashboard/EventsFeed';
import LatestVisits from '../components/dashboard/LatestVisits';
import TrafficSources from '../components/dashboard/TrafficSources';
import IPLookup from '../components/dashboard/IPLookup';
import TodayStats from '../components/dashboard/TodayStats';
import { analyticsAPI } from '../services/api';

const Dashboard = () => {
  const [currentSiteId, setCurrentSiteId] = useState('kayvontennis-com');

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
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [currentSiteId]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

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
          <TodayStats events={events} stats={stats} />
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
      </div>
    </div>
  );
};

export default Dashboard;