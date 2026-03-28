"use client";

import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Users, Search, Filter, Heart, ExternalLink, Ticket, CreditCard, User as UserIcon, ArrowLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type JoinedEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  attendees: number;
  imageUrl?: string;
  bookedDate: string;
  ticketNumber?: string;
  status: "upcoming" | "past" | "cancelled";
  // Additional booking info
  bookingStatus?: string;
  totalAmount?: number;
  numberOfAttendees?: number;
  eventMode?: string;
  organizerName?: string;
};

export default function JoinedEventsPage() {
  const [events, setEvents] = useState<JoinedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past">("all");
  const [sortBy, setSortBy] = useState<"date" | "bookingDate">("date");
  const router = useRouter();

  // Fetch joined events from database API
  useEffect(() => {
    const fetchJoinedEvents = async () => {
      try {
        setLoading(true);
        
        const response = await fetch("/api/user/joined-events");
        
        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.status}`);
        }
        
        const data = await response.json();
        setEvents(data);
        
      } catch (error) {
        console.error("Error fetching joined events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedEvents();
  }, []);

  // Filter and sort events
  const filteredEvents = events
    .filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === "all" || event.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return new Date(b.bookedDate).getTime() - new Date(a.bookedDate).getTime();
      }
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button & Header */}
        <div className="mb-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                My Bookings
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Events you've registered for and booked
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-4">
            <span className="px-3 py-1.5 bg-slate-800/50 rounded-full border border-white/10">
              <span className="font-semibold text-indigo-400">{filteredEvents.length}</span> bookings
            </span>
            <span className="px-3 py-1.5 bg-slate-800/50 rounded-full border border-white/10">
              <span className="font-semibold text-green-400">
                {filteredEvents.filter(e => e.status === "upcoming").length}
              </span> upcoming
            </span>
            <span className="px-3 py-1.5 bg-slate-800/50 rounded-full border border-white/10">
              <span className="font-semibold text-slate-400">
                {filteredEvents.filter(e => e.status === "past").length}
              </span> past
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Filter by Status */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="date">Sort by Event Date</option>
              <option value="bookingDate">Sort by Booking Date</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
              <Heart className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
            <p className="text-slate-400 text-sm mb-6">
              {searchQuery || filterStatus !== "all" 
                ? "Try adjusting your search or filters" 
                : "You haven't booked any events yet"}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <a
                href="/dashboard/user/scraped-events"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all font-medium"
              >
                Discover Events
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-xl overflow-hidden border border-white/10 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
                onClick={() => router.push(`/dashboard/user/events/${event.id}`)}
              >
                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-xl border
                    ${event.status === "upcoming" 
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                      : event.status === "past"
                      ? "bg-slate-600/20 text-slate-400 border-slate-500/30"
                      : "bg-red-500/20 text-red-300 border-red-500/30"
                    }
                  `}>
                    {event.status === "upcoming" ? "Upcoming" : event.status === "past" ? "Past" : "Cancelled"}
                  </span>
                  
                  {/* Booking Status Badge */}
                  {event.bookingStatus === "PAID" && (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-xl bg-green-500/20 text-green-300 border border-green-500/30">
                      Paid
                    </span>
                  )}
                  {event.bookingStatus === "PENDING" && (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-xl bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                      Pending
                    </span>
                  )}
                </div>

                {/* Image */}
                {event.imageUrl && (
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Category and Event Mode */}
                  <div className="flex gap-1.5 mb-2">
                    <span className="inline-block px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md text-xs font-medium border border-indigo-500/20">
                      {event.category}
                    </span>
                    {event.eventMode && (
                      <span className="inline-block px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-md text-xs font-medium border border-purple-500/20">
                        {event.eventMode}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {event.title}
                  </h3>

                  {/* Organizer */}
                  {event.organizerName && (
                    <p className="text-xs text-slate-400 mb-2">
                      by {event.organizerName}
                    </p>
                  )}

                  {/* Description */}
                  <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Calendar className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                      <span>{formatDate(event.date)}</span>
                      <Clock className="h-3.5 w-3.5 text-indigo-400 ml-1 flex-shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <MapPin className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Users className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                      <span>{event.attendees} attendees</span>
                      {event.numberOfAttendees && event.numberOfAttendees > 1 && (
                        <>
                          <span className="text-slate-500">•</span>
                          <UserIcon className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                          <span>{event.numberOfAttendees} tickets</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Ticket className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{formatDate(event.bookedDate)}</span>
                      </div>
                      {event.ticketNumber && (
                        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          {event.ticketNumber.substring(0, 8)}
                        </span>
                      )}
                    </div>

                    {/* Total Amount */}
                    {event.totalAmount !== undefined && event.totalAmount > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-3">
                        <CreditCard className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                        <span className="font-semibold text-green-400">
                          {formatCurrency(event.totalAmount)}
                        </span>
                      </div>
                    )}

                    {/* Details Button */}
                    <button
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all text-xs font-medium group"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/user/events/${event.id}`);
                      }}
                    >
                      <span>View Details</span>
                      <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}