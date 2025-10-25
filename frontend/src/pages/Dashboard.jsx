import React, { useState, useEffect } from 'react';
import { Activity, Users, Eye, AlertTriangle } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import StatCard from '../components/common/StatCard';
import EventsChart from '../components/dashboard/EventsChart';
import EventsFeed from '../components/dashboard/EventsFeed';
import SecurityAlerts from '../components/dashboard/SecurityAlerts';
import { analyticsAPI, threatsAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_events: 0,
    unique_visitors: 0,
    page_views: 0,
    bot_detections: 0
  });
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, eventsRes, alertsRes] = await Promise.all([
        analyticsAPI.getStats(),
        analyticsAPI.getEvents('ghosttrack-test-dashboard', 20),
        threatsAPI.getAlerts('ghosttrack-test-dashboard')
      ]);

      setStats(statsRes.data);
      setEvents(eventsRes.data.events || []);
      setAlerts(alertsRes.data.alerts || []);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            title="Bot Detections"
            value={stats.bot_detections}
            icon={AlertTriangle}
            gradient="bg-gradient-to-br from-red-500 to-red-700"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <EventsChart data={[]} />
          <EventsFeed events={events} />
        </div>

        <SecurityAlerts alerts={alerts} />
      </div>
    </div>
  );
};

export default Dashboard;