"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, Mail, Phone, User, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Event = {
  id: string;
  title: string;
  shortDescription: string | null;
  detailedDescription: string | null;
  startDateTime: Date;
  endDateTime: Date;
  category: string | null;
  city: string | null;
  country: string | null;
  eventMode: string | null;
  venueName: string | null;
  address: string | null;
  ticketPrice: number | null;
  maxAttendees: number | null;
  supportEmail: string | null;
  contactPhone: string | null;
  OrganizerName: string | null;
  createdAt: Date;
};

export default function ViewApprovedEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/view-events');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const handleBackClick = () => {
    router.push('/dashboard/admin');
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 overflow-hidden flex flex-col">
      {/* Header with Back Button */}
      <div className="py-6 px-8 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-bold text-white">A</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin</h1>
              <p className="text-sm text-slate-400">Approved Events</p>
            </div>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">All Approved Events</h2>
            <div className="text-slate-400 text-sm">
              Total Events: <span className="text-green-400 font-semibold">{events.length}</span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-slate-800 rounded-xl shadow-2xl p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto text-blue-400 animate-spin mb-4" />
              <p className="text-white text-lg">Loading events...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl shadow-2xl p-6 text-center">
              <p className="text-red-400">{error}</p>
              <button
                onClick={fetchEvents}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Events Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.length === 0 ? (
                <div className="col-span-full bg-slate-800 rounded-xl shadow-2xl p-12 text-center">
                  <p className="text-white text-lg font-medium">No approved events yet</p>
                  <p className="text-slate-400 text-sm mt-2">Events will appear here once approved.</p>
                </div>
              ) : (
                events.map((event) => {
                  const isExpanded = expandedEventId === event.id;
                  
                  return (
                    <div 
                      key={event.id} 
                      className={`bg-slate-800 rounded-xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all ${
                        isExpanded ? 'col-span-full' : ''
                      }`}
                    >
                      <div className="border-l-4 border-green-500 p-6">
                        {/* Basic Info */}
                        <div className="mb-4">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="text-xl font-bold text-white flex-1">{event.title}</h3>
                            <span className="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-400 font-medium whitespace-nowrap">
                              Approved
                            </span>
                          </div>
                          
                          {event.shortDescription && (
                            <p className="text-slate-300 text-sm mb-3 line-clamp-2">{event.shortDescription}</p>
                          )}

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-300">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span>{event.city}, {event.country}</span>
                            </div>
                            <div>
                              <p className="text-slate-400">Start Date</p>
                              <p className="text-white font-medium">{formatDate(event.startDateTime)}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Category</p>
                              <p className="text-white font-medium">{event.category || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Ticket Price</p>
                              <p className="text-green-400 font-bold">
                                {event.ticketPrice ? `$${event.ticketPrice}` : 'Free'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-6 pt-6 border-t border-slate-700 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Left Column */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-white font-semibold mb-2">Event Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <p className="text-slate-400">End Date</p>
                                      <p className="text-white">{formatDate(event.endDateTime)}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-400">Event Mode</p>
                                      <p className="text-white">{event.eventMode || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-400">Venue</p>
                                      <p className="text-white">{event.venueName || 'N/A'}</p>
                                    </div>
                                    {event.address && (
                                      <div>
                                        <p className="text-slate-400">Address</p>
                                        <p className="text-white">{event.address}</p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-slate-400">Max Attendees</p>
                                      <p className="text-white">{event.maxAttendees || 'Unlimited'}</p>
                                    </div>
                                  </div>
                                </div>

                                {event.detailedDescription && (
                                  <div>
                                    <h4 className="text-white font-semibold mb-2">Description</h4>
                                    <p className="text-slate-300 text-sm">{event.detailedDescription}</p>
                                  </div>
                                )}
                              </div>

                              {/* Right Column - Contact Details */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-white font-semibold mb-3">Contact Information</h4>
                                  <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                                    {event.OrganizerName && (
                                      <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-blue-400" />
                                        <div>
                                          <p className="text-slate-400 text-xs">Organizer</p>
                                          <p className="text-white font-medium">{event.OrganizerName}</p>
                                        </div>
                                      </div>
                                    )}
                                    {event.supportEmail && (
                                      <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-green-400" />
                                        <div>
                                          <p className="text-slate-400 text-xs">Email</p>
                                          <a 
                                            href={`mailto:${event.supportEmail}`}
                                            className="text-blue-400 hover:text-blue-300 transition-colors"
                                          >
                                            {event.supportEmail}
                                          </a>
                                        </div>
                                      </div>
                                    )}
                                    {event.contactPhone && (
                                      <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-purple-400" />
                                        <div>
                                          <p className="text-slate-400 text-xs">Phone</p>
                                          <a 
                                            href={`tel:${event.contactPhone}`}
                                            className="text-blue-400 hover:text-blue-300 transition-colors"
                                          >
                                            {event.contactPhone}
                                          </a>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* View More Button */}
                        <button
                          onClick={() => toggleExpand(event.id)}
                          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                        >
                          <span className="text-sm font-medium">
                            {isExpanded ? 'Show Less' : 'View More Details'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 px-6 border-t border-slate-700">
        <div className="flex items-center gap-3 justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full"></div>
          <div>
            <p className="font-medium text-sm text-white">Admin User</p>
            <p className="text-slate-400 text-xs">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}