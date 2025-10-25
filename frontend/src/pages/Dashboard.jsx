import React, { useState, useEffect } from 'react';
import { Activity, Users, Eye, AlertTriangle, Clock, FileText, MapPin, Shield } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import StatCard from '../components/common/StatCard';
import EventsChart from '../components/dashboard/EventsChart';
import EventsFeed from '../components/dashboard/EventsFeed';
import SecurityAlerts from '../components/dashboard/SecurityAlerts';
import LatestVisits from '../components/dashboard/LatestVisits';
import TrafficSources from '../components/dashboard/TrafficSources';
import { analyticsAPI, threatsAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_events: 0,
    unique_visitors: 0,
    page_views: 0,
    bot_detections: 0,
    avg_duration: '2m 34s',
    pages_per_visit: 3.2,
    tracked_ips: 156,
    suspicious_activity: 0
  });
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);
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

      setStats({
        ...statsRes.data,
        avg_duration: '2m 34s',
        pages_per_visit: 3.2,
        tracked_ips: 156,
        suspicious_activity: eventsRes.data.events?.filter(e => e.event_type === 'suspicious_activity').length || 0
      });
      setEvents(eventsRes.data.events || []);
      setAlerts(alertsRes.data.alerts || []);

      // Generate chart data from events - BETTER APPROACH
const timeData = {};

// Get current hour
const currentHour = new Date().getHours();

// Initialize last 12 hours
for (let i = 11; i >= 0; i--) {
  const hour = (currentHour - i + 24) % 24;
  timeData[hour] = 0;
}

// Count events per hour
(eventsRes.data.events || []).forEach(event => {
  try {
    const eventHour = new Date(event.timestamp).getHours();
    if (timeData[eventHour] !== undefined) {
      timeData[eventHour]++;
    }
  } catch (e) {
    console.error('Error parsing timestamp:', e);
  }
});

// Convert to array and format
const chartPoints = Object.entries(timeData)
  .map(([hour, count]) => ({
    time: `${hour}:00`,
    events: count
  }))
  .sort((a, b) => {
    const hourA = parseInt(a.time);
    const hourB = parseInt(b.time);
    return hourA - hourB;
  });

setChartData(chartPoints);

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
            title="Bot Detections"
            value={stats.bot_detections}
            icon={AlertTriangle}
            gradient="bg-gradient-to-br from-red-500 to-red-700"
          />
        </div>

        {/* Second Row - Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Avg Visit Duration"
            value={stats.avg_duration}
            icon={Clock}
            gradient="bg-gradient-to-br from-orange-500 to-orange-700"
          />
          <StatCard
            title="Pages Per Visit"
            value={stats.pages_per_visit}
            icon={FileText}
            gradient="bg-gradient-to-br from-teal-500 to-teal-700"
          />
          <StatCard
            title="Tracked IPs"
            value={stats.tracked_ips}
            icon={MapPin}
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
          />
          <StatCard
            title="Suspicious Activity"
            value={stats.suspicious_activity}
            icon={Shield}
            gradient="bg-gradient-to-br from-pink-500 to-pink-700"
          />
        </div>

        {/* Charts & Events Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <EventsChart data={chartData} />
          <EventsFeed events={events} />
        </div>

        {/* Security Alerts */}
        <div className="mb-8">
          <SecurityAlerts alerts={alerts} />
        </div>

        {/* Latest Visits & Traffic Sources Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LatestVisits />
          <TrafficSources />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;