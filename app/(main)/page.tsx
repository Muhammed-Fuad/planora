"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  MessageCircle,
  X,
  Star,
  Users,
  Music,
  Utensils,
  Palette,
  Gamepad2,
  Trophy,
  Briefcase,
  Sparkles,
  Clock,
  IndianRupee,
  ChevronDown,
} from "lucide-react";
import { apiClient } from "../lib/apiClient";

type Event = {
  id: string;
  title: string;
  shortDescription: string;
  startDateTime: string;
  venueName: string;
  city: string;
  country: string;
  category: string;
  ticketPrice: number;
  banner?: string;
  maxAttendees: number;
  current_attendees?: number;
};

const eventCategories = [
  { id: "all", name: "All Events", icon: Sparkles, color: "indigo" },
  { id: "music", name: "Music", icon: Music, color: "purple" },
  { id: "food", name: "Food & Drink", icon: Utensils, color: "orange" },
  { id: "art", name: "Art & Culture", icon: Palette, color: "pink" },
  { id: "sports", name: "Sports", icon: Trophy, color: "green" },
  { id: "tech", name: "Tech", icon: Gamepad2, color: "blue" },
  { id: "business", name: "Business", icon: Briefcase, color: "slate" },
];

const categoryImages: Record<string, string> = {
  music: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  food: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
  art: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
  tech: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
  default: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
};

export default function Page() {
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
  async function fetchEvents() {
    try {
      setLoading(true);

      const eventsList = await apiClient.getPublicEvents();

      setEvents(eventsList);
      setResults(eventsList);
    } catch (err) {
      console.error(err);
      setError("Unable to load events");
    } finally {
      setLoading(false);
    }
  }

  fetchEvents();
}, []);


  useEffect(() => {
    const q = query.trim().toLowerCase();
    let filtered = events.filter(
      (ev) =>
        q === "" ||
        ev.title?.toLowerCase().includes(q) ||
        ev.venueName?.toLowerCase().includes(q) ||
        ev.city?.toLowerCase().includes(q) ||
        ev.shortDescription?.toLowerCase().includes(q)
    );

    if (selectedCategory !== "all") {
      filtered = filtered.filter((ev) => ev.category?.toLowerCase() === selectedCategory);
    }

    setResults(filtered);
  }, [query, events, selectedCategory]);

  const handleViewEvent = (event: Event) => {
    setShowLoginPrompt(true);
  };

  const handleSendMessage = () => {
    setShowLoginPrompt(true);
  };

  const getEventImage = (event: Event) => {
    if (event.banner) return event.banner;
    return categoryImages[event.category?.toLowerCase()] || categoryImages.default;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events-section');
    eventsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-slate-950 overflow-x-hidden">
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes textRotate {
          0% { opacity: 0; transform: translateY(20px); }
          8% { opacity: 1; transform: translateY(0); }
          17% { opacity: 1; transform: translateY(0); }
          25% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .rotating-text span {
          opacity: 0;
          animation: textRotate 16s ease-in-out infinite;
        }
        
        .rotating-text span:nth-child(1) {
          animation-delay: 0s;
        }
        
        .rotating-text span:nth-child(2) {
          animation-delay: 4s;
        }
        
        .rotating-text span:nth-child(3) {
          animation-delay: 8s;
        }
        
        .rotating-text span:nth-child(4) {
          animation-delay: 12s;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* FIXED HEADER */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrollY > 50 
            ? 'bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl p-2.5 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 shadow-2xl shadow-purple-500/50">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Planora
                </h1>
                <p className="text-xs text-slate-400">
                  Discover amazing events
                </p>
              </div>
            </div>

            <nav className="flex gap-4 md:gap-6 items-center text-sm font-medium">
              <a
                href="/login"
                className="text-slate-300 hover:text-white transition-colors hidden md:block"
              >
                Discover
              </a>
              <a
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all font-semibold"
              >
                Sign in
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      
      <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
        </div>

        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        ></div>

        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div 
            className="mb-6"
            style={{
              transform: `translateY(${scrollY * -0.2}px)`,
            }}
          >
            <br></br>
            <br></br>
            <br></br>
      
            <div className="mb-6">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight flex flex-wrap justify-center items-center gap-3 md:gap-4">
                <span className="text-white">Discover</span>
                <span className="relative inline-block rotating-text" style={{ width: '750px', height: '1.2em' }}>
                  <span className="absolute inset-0 flex items-center justify-start bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient whitespace-nowrap">
                    Exciting Activities
                  </span>
                  <span className="absolute inset-0 flex items-center justify-start bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient whitespace-nowrap">
                    Hidden Gems
                  </span>
                  <span className="absolute inset-0 flex items-center justify-start bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient whitespace-nowrap">
                    New Connections
                  </span>
                  <span className="absolute inset-0 flex items-center justify-start bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient whitespace-nowrap">
                    Amazing Events
                  </span>
                </span>
              </h2>
            </div>
            <p className="text-slate-300 text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of attendees to find and book the perfect events for you
            </p>
          </div>
          
          <div 
            className="max-w-4xl mx-auto mb-8"
            style={{
              transform: `translateY(${scrollY * -0.1}px)`,
            }}
          >
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="relative mb-6">
                <MessageCircle className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                <input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Looking for something fun? Ask about any activity or event you're interested in"
                  className="w-full pl-16 pr-40 py-6 rounded-2xl border-0 bg-white/10 backdrop-blur-sm text-white placeholder-slate-400 text-lg shadow-xl focus:ring-4 focus:ring-purple-500/50 outline-none transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <button
                    onClick={handleSendMessage}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                  >
                    <Search className="h-5 w-5" />
                    Ask
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                <span className="text-xs text-slate-400 mr-2 self-center">Popular:</span>
                {["Music concerts", "Tech workshops", "Food festivals"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setChatMessage(suggestion);
                      handleSendMessage();
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white font-medium transition-all backdrop-blur-sm border border-white/10"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={scrollToEvents}
            className="inline-flex flex-col items-center gap-2 text-white/60 hover:text-white transition-all animate-bounce"
          >
            <span className="text-sm">Explore Events</span>
            <ChevronDown className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* EVENTS SECTION */}
      <div id="events-section" className="relative bg-slate-950 py-20">
        <div className="sticky top-20 z-40 bg-slate-950/95 backdrop-blur-xl border-y border-white/5 mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 py-6 overflow-x-auto scrollbar-hide">
              {eventCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{cat.name}</span>
                    {isSelected && cat.id !== "all" && (
                      <span className="ml-1 px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                        {results.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <h3 className="text-3xl font-bold text-white">
                {selectedCategory === "all" ? "All Events" : eventCategories.find(c => c.id === selectedCategory)?.name}
              </h3>
              <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold border border-purple-500/30">
                {results.length} events
              </span>
            </div>

            <div className="relative max-w-md hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm transition-all"
              />
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white/5 rounded-3xl overflow-hidden backdrop-blur-sm border border-white/10 animate-pulse">
                  <div className="h-64 bg-white/10"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    <div className="h-3 bg-white/10 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border-2 border-red-500/20 p-12 rounded-3xl text-center backdrop-blur-sm">
              <div className="w-20 h-20 bg-red-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <X className="h-10 w-10 text-red-400" />
              </div>
              <p className="font-semibold text-red-400 text-xl mb-2">⚠️ {error}</p>
              <p className="text-sm text-red-300/70">Please check your connection and try again</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {results.length === 0 ? (
                <div className="bg-white/5 border-2 border-white/10 p-20 rounded-3xl text-center backdrop-blur-sm">
                  <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-8 flex items-center justify-center">
                    <Search className="h-12 w-12 text-slate-400" />
                  </div>
                  <p className="text-white font-semibold text-2xl mb-3">No events found</p>
                  <p className="text-slate-400 mb-8">Try adjusting your search or filters</p>
                  <button
                    onClick={() => {
                      setQuery("");
                      setSelectedCategory("all");
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-lg hover:shadow-purple-500/50 transition-all font-semibold"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.map((event, idx) => (
                    <article
                      key={event.id}
                      className="group bg-white/5 rounded-3xl overflow-hidden backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
                      style={{
                        animationDelay: `${idx * 100}ms`,
                      }}
                    >
                      <div className="relative h-64 overflow-hidden bg-slate-900">
                        <img
                          src={getEventImage(event)}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = categoryImages.default;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
                        
                        <div className="absolute top-4 left-4">
                          <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-slate-900 shadow-xl capitalize">
                            {event.category}
                          </span>
                        </div>

                        <div className="absolute top-4 right-4">
                          <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl">
                            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="font-bold text-xl text-white mb-4 line-clamp-2 group-hover:text-purple-400 transition-colors min-h-[3.5rem]">
                          {event.title}
                        </h3>
                        
                        <div className="space-y-3 mb-5">
                          <div className="flex items-center gap-3 text-sm text-slate-300">
                            <MapPin className="h-4 w-4 text-purple-400 flex-shrink-0" />
                            <span className="line-clamp-1">{event.venueName}, {event.city}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm text-slate-300">
                            <Calendar className="h-4 w-4 text-purple-400 flex-shrink-0" />
                            <span>{formatDate(event.startDateTime)}</span>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-slate-300">
                            <Clock className="h-4 w-4 text-purple-400 flex-shrink-0" />
                            <span>{formatTime(event.startDateTime)}</span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-400 line-clamp-2 mb-5 leading-relaxed">
                          {event.shortDescription}
                        </p>

                        <div className="flex items-center justify-between pt-5 border-t border-white/10">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-5 w-5 text-green-400" />
                            <span className="text-2xl font-bold text-white">{event.ticketPrice}</span>
                          </div>
                          
                          <button 
                            onClick={() => handleViewEvent(event)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all group"
                          >
                            View
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl my-8 border border-white/10">
            <div className="relative h-80 rounded-t-3xl overflow-hidden">
              <img
                src={getEventImage(selectedEvent)}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"
              >
                <X className="h-6 w-6 text-white" />
              </button>
              <div className="absolute bottom-6 left-8">
                <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-bold text-slate-900 capitalize shadow-xl">
                  {selectedEvent.category}
                </span>
              </div>
            </div>
            
            <div className="p-8">
              <h2 className="text-4xl font-bold text-white mb-8">
                {selectedEvent.title}
              </h2>

              <div className="grid md:grid-cols-2 gap-5 mb-8">
                <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <Calendar className="h-6 w-6 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Date & Time</p>
                    <p className="font-semibold text-white text-lg">{formatDate(selectedEvent.startDateTime)}</p>
                    <p className="text-sm text-slate-300">{formatTime(selectedEvent.startDateTime)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <MapPin className="h-6 w-6 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Venue</p>
                    <p className="font-semibold text-white text-lg">{selectedEvent.venueName}</p>
                    <p className="text-sm text-slate-300">{selectedEvent.city}, {selectedEvent.country}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <IndianRupee className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Price</p>
                    <p className="text-3xl font-bold text-white">₹{selectedEvent.ticketPrice}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <Users className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Capacity</p>
                    <p className="font-semibold text-white text-lg">{selectedEvent.maxAttendees} attendees</p>
                    <p className="text-sm text-slate-300">{selectedEvent.current_attendees || 0} registered</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">About this event</h3>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {selectedEvent.shortDescription}
                </p>
              </div>

              {selectedEvent.maxAttendees && (
                <div className="flex items-center gap-3 p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl mb-8 border border-purple-500/20">
                  <Users className="h-6 w-6 text-purple-400" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-300">
                        <span className="font-bold text-white">{selectedEvent.current_attendees || 0}</span> / {selectedEvent.maxAttendees} spots filled
                      </span>
                      <span className="text-sm font-semibold text-purple-400">
                        {Math.round(((selectedEvent.current_attendees || 0) / selectedEvent.maxAttendees) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(((selectedEvent.current_attendees || 0) / selectedEvent.maxAttendees) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 px-8 py-4 rounded-2xl border-2 border-white/10 text-white font-semibold hover:bg-white/5 transition-all"
                >
                  Close
                </button>
                <button
                  className="flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN PROMPT MODAL */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-10 max-w-md w-full shadow-2xl border border-white/10">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full mx-auto mb-6 flex items-center justify-center border border-purple-500/30">
                <MessageCircle className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Sign in Required</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Please sign in to use our AI-powered event assistant and get personalized recommendations!
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 px-6 py-4 rounded-2xl border-2 border-white/10 text-white font-semibold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <a
                  href="/login"
                  className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all text-center"
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}