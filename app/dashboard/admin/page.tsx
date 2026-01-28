"use client"

import React, { useState } from 'react';
import { 
  Activity, Users, MapPin, Calendar, TrendingUp, 
  AlertCircle, CheckCircle, Clock, Search, Filter,
  Eye, Edit, Trash2, Ban, Shield, BarChart3, Globe
} from 'lucide-react';

type ActivityItem = {
  id: string;
  type: 'scraper' | 'organizer' | 'admin' | 'report';
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
};

type Event = {
  id: string;
  name: string;
  location: { lat: number; lng: number; city: string };
  status: 'approved' | 'pending' | 'reported';
  organizer: string;
  date: string;
};

type Organizer = {
  id: string;
  name: string;
  email: string;
  eventsCount: number;
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'feed' | 'map' | 'analytics' | 'approvals'>('feed');
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const activities: ActivityItem[] = [
    { id: '1', type: 'scraper', message: 'Scraper added 12 new events (Bangalore)', timestamp: '2 min ago', status: 'success' },
    { id: '2', type: 'organizer', message: 'Organizer XYZ Events uploaded 3 events', timestamp: '5 min ago', status: 'success' },
    { id: '3', type: 'admin', message: 'Admin approved Tech Meetup 2026', timestamp: '10 min ago', status: 'success' },
    { id: '4', type: 'report', message: 'User reported event: Fake location', timestamp: '15 min ago', status: 'error' },
    { id: '5', type: 'scraper', message: 'Scraper failed: Connection timeout', timestamp: '20 min ago', status: 'error' },
    { id: '6', type: 'organizer', message: 'New organizer registration: Tech Hub India', timestamp: '25 min ago', status: 'warning' },
  ];

  const events: Event[] = [
    { id: '1', name: 'Tech Conference 2025', location: { lat: 12.9716, lng: 77.5946, city: 'Bangalore' }, status: 'approved', organizer: 'Tech Hub', date: '2025-02-15' },
    { id: '2', name: 'Music Festival', location: { lat: 13.0827, lng: 80.2707, city: 'Chennai' }, status: 'pending', organizer: 'Music Corp', date: '2025-03-20' },
    { id: '3', name: 'Art Exhibition', location: { lat: 19.0760, lng: 72.8777, city: 'Mumbai' }, status: 'reported', organizer: 'Art Gallery', date: '2025-04-10' },
  ];

  const organizers: Organizer[] = [
    { id: '1', name: 'Tech Hub India', email: 'tech@hub.com', eventsCount: 24, status: 'active', joinDate: '2024-01-15' },
    { id: '2', name: 'XYZ Events', email: 'xyz@events.com', eventsCount: 12, status: 'pending', joinDate: '2024-12-20' },
    { id: '3', name: 'Music Corp', email: 'music@corp.com', eventsCount: 8, status: 'active', joinDate: '2024-06-10' },
  ];

  const analytics = {
    peakSearchTimes: ['9 AM - 11 AM', '6 PM - 9 PM'],
    mostSavedEvents: ['Tech Conference 2025', 'Music Festival', 'Art Exhibition'],
    abandonedBookings: 156,
    cityEngagement: [
      { city: 'Bangalore', engagement: 85 },
      { city: 'Mumbai', engagement: 72 },
      { city: 'Chennai', engagement: 68 },
      { city: 'Delhi', engagement: 65 },
    ]
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': case 'active': case 'success': return 'text-green-600 bg-green-50';
      case 'pending': case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'reported': case 'suspended': case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'approved': case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'pending': case 'warning': return <Clock className="h-4 w-4" />;
      case 'reported': case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Planora Admin Command Center
              </h1>
              <p className="text-sm text-slate-600 mt-1">Real-time monitoring & control</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, organizers..."
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                <Filter className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            {[
              { id: 'feed', label: 'Live Feed', icon: Activity },
              { id: 'map', label: 'Event Map', icon: Globe },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'approvals', label: 'Approvals', icon: Shield }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Live Activity Feed */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Feed */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                Live Activity Feed
              </h2>
              <div className="space-y-3">
                {activities.map(activity => (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                          {getStatusIcon(activity.status)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.type)}`}>
                        {activity.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Context Panel */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Context Panel</h3>
              {selectedActivity ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700">{selectedActivity.message}</p>
                    <p className="text-xs text-slate-500 mt-2">{selectedActivity.timestamp}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      <Ban className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Click on an activity to see details</p>
              )}
            </div>
          </div>
        )}

        {/* Event Map View */}
        {activeTab === 'map' && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-600" />
              Event Map View
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map placeholder */}
              <div className="lg:col-span-2 h-96 bg-slate-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">Interactive Map</p>
                  <p className="text-sm text-slate-500">Events plotted by location & status</p>
                </div>
              </div>

              {/* Event List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">Events by Status</h3>
                {events.map(event => (
                  <div key={event.id} className="p-4 border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </div>
                    <h4 className="font-medium text-sm text-slate-900">{event.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{event.location.city}</p>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded">
                        <Eye className="h-3 w-3 inline mr-1" />
                        View
                      </button>
                      <button className="flex-1 px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded">
                        <Edit className="h-3 w-3 inline mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Search Times */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Peak Search Times
              </h3>
              <div className="space-y-3">
                {analytics.peakSearchTimes.map((time, idx) => (
                  <div key={idx} className="p-4 bg-indigo-50 rounded-lg">
                    <p className="font-medium text-indigo-900">{time}</p>
                    <div className="w-full bg-indigo-200 h-2 rounded-full mt-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${90 - idx * 10}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Saved Events */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-slate-900 mb-4">Most Saved Events</h3>
              <div className="space-y-3">
                {analytics.mostSavedEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">{event}</span>
                    <span className="text-xs font-bold text-indigo-600">#{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* City Engagement */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-slate-900 mb-4">City-wise Engagement</h3>
              <div className="space-y-4">
                {analytics.cityEngagement.map(city => (
                  <div key={city.city}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{city.city}</span>
                      <span className="text-sm font-bold text-indigo-600">{city.engagement}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${city.engagement}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Abandoned Bookings */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-slate-900 mb-4">Booking Insights</h3>
              <div className="text-center">
                <p className="text-5xl font-bold text-red-600">{analytics.abandonedBookings}</p>
                <p className="text-sm text-slate-600 mt-2">Abandoned Bookings (This Month)</p>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-800">↑ 12% from last month</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approvals Section */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            {/* Pending Organizers */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Pending Organizer Approvals
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Events</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizers.map(org => (
                      <tr key={org.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{org.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{org.email}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{org.eventsCount}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(org.status)}`}>
                            {org.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Events */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Pending Event Approvals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.filter(e => e.status === 'pending').map(event => (
                  <div key={event.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl">
                    <h4 className="font-semibold text-slate-900 mb-2">{event.name}</h4>
                    <p className="text-sm text-slate-600 mb-1">📍 {event.location.city}</p>
                    <p className="text-sm text-slate-600 mb-3">🏢 {event.organizer}</p>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                        Approve
                      </button>
                      <button className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}