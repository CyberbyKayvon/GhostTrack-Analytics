import React, { useState, useEffect } from 'react';
import { Activity, Users, Eye, Shield, Clock, FileText, MapPin, Plus } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import StatCard from '../components/common/StatCard';
import EventsChart from '../components/dashboard/EventsChart';
import EventsFeed from '../components/dashboard/EventsFeed';
import LatestVisits from '../components/dashboard/LatestVisits';
import TrafficSources from '../components/dashboard/TrafficSources';
import { analyticsAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_events: 0,
    unique_visitors: 0,
    page_views: 0,
    bot_detections: 0,
    avg_duration: '2m 34s',
    add_to_cart: 0,
    tracked_ips: 156,
    suspicious_activity: 0
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        analyticsAPI.getStats(),
        analyticsAPI.getEvents('ghosttrack-test-dashboard', 50)
      ]);

      setStats({
        total_events: statsRes.data.total_events || 0,
        unique_visitors: statsRes.data.unique_visitors || 0,
        page_views: statsRes.data.page_views || 0,
        bot_detections: statsRes.data.bot_detections || 0,
        avg_duration: '2m 34s',
        add_to_cart: eventsRes.data.events?.filter(e => e.event_type === 'add_to_cart').length || 0,
        tracked_ips: 156,
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
        {/* First Row - Primary Stats */}
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

        {/* Second Row - Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Avg Visit Duration"
            value={stats.avg_duration}
            icon={Clock}
            gradient="bg-gradient-to-br from-orange-500 to-orange-700"
          />
          <StatCard
            title="Add to Cart"
            value={stats.add_to_cart}
            icon={FileText}
            gradient="bg-gradient-to-br from-teal-500 to-teal-700"
          />
          <StatCard
            title="Tracked IPs"
            value={stats.tracked_ips}
            icon={MapPin}
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
          />
          <div className="bg-gradient-to-br from-gray-500 to-gray-700 p-6 rounded-xl shadow-lg flex items-center justify-between group hover:shadow-xl transition-all cursor-pointer">
            <div className="flex-1">
              <p className="text-white text-opacity-90 text-sm font-medium mb-1">Add Metric</p>
              <Plus className="w-12 h-12 text-white opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Latest Visits & Events Chart - Same Height Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LatestVisits />
          <EventsChart data={events} />
        </div>

        {/* Traffic Sources & Recent Events - Aligned Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TrafficSources />
          <EventsFeed events={events} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;