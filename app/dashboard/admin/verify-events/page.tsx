"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Event = {
  id: string;
  title: string;
  shortDescription: string | null;
  startDateTime: Date;
  endDateTime: Date;
  category: string | null;
  city: string | null;
  country: string | null;
  banner: string | null;
  eventMode: string | null;
  venueName: string | null;
  ticketPrice: number | null;
  maxAttendees: number | null;
  createdAt: Date;
};

export default function ViewEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/verify-events');
      
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

  const handleEventAction = async (eventId: string, action: 'accept' | 'reject') => {
    const actionText = action === 'accept' ? 'approve' : 'reject';
    
    if (!window.confirm(`Are you sure you want to ${actionText} this event?`)) {
      return;
    }

    try {
      setProcessing(eventId);
      const response = await fetch(`/api/admin/verify-events?id=${eventId}&action=${action}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Failed to ${actionText} event`);
      }

      // Remove event from local state
      setEvents(events.filter(event => event.id !== eventId));
    } catch (err) {
      console.error(`Error ${actionText}ing event:`, err);
      alert(`Failed to ${actionText} event. Please try again.`);
    } finally {
      setProcessing(null);
    }
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
              <p className="text-sm text-slate-400">View Events Details</p>
            </div>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto px-12 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Pending Events</h2>
            <div className="text-slate-400 text-sm">
              Total Pending: <span className="text-yellow-400 font-semibold">{events.length}</span>
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

          {/* Events List */}
          {!loading && !error && (
            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="bg-slate-800 rounded-xl shadow-2xl p-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
                  <p className="text-white text-lg font-medium">All events have been reviewed!</p>
                  <p className="text-slate-400 text-sm mt-2">No pending events at the moment.</p>
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow">
                    <div className="border-l-4 border-yellow-500 p-6">
                      <div className="flex justify-between items-start gap-6">
                        {/* Event Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-white">{event.title}</h3>
                            <span className="px-3 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
                              Pending Review
                            </span>
                          </div>
                          
                          {event.shortDescription && (
                            <p className="text-slate-300 text-sm mb-4">{event.shortDescription}</p>
                          )}

                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div>
                              <p className="text-slate-400">Start Date</p>
                              <p className="text-white font-medium">{formatDate(event.startDateTime)}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">End Date</p>
                              <p className="text-white font-medium">{formatDate(event.endDateTime)}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Location</p>
                              <p className="text-white font-medium">
                                {event.venueName || 'N/A'}, {event.city}, {event.country}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Category</p>
                              <p className="text-white font-medium">{event.category || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Event Mode</p>
                              <p className="text-white font-medium">{event.eventMode || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Max Attendees</p>
                              <p className="text-white font-medium">{event.maxAttendees || 'Unlimited'}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Ticket Price</p>
                              <p className="text-green-400 font-bold">
                                {event.ticketPrice ? `$${event.ticketPrice}` : 'Free'}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Submitted</p>
                              <p className="text-slate-300">{formatDate(event.createdAt)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => handleEventAction(event.id, 'accept')}
                            disabled={processing === event.id}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
                          >
                            {processing === event.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Accept
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleEventAction(event.id, 'reject')}
                            disabled={processing === event.id}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
                          >
                            {processing === event.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
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