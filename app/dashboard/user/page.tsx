"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Search, MapPin, Calendar, ArrowRight, MessageCircle, X,
  Star, Users, Music, Utensils, Palette,
  Gamepad2, Trophy, Briefcase, Sparkles, Clock,
  IndianRupee, ChevronDown, ChevronLeft, ChevronRight,
  Brain, Navigation, Loader2
} from "lucide-react";
import UserShell from "./userShell";
import { useRouter } from "next/navigation";
import SmartRecommendations from "./SmartRecommendations";
import { useGeolocation, useWeather, getDistanceKm } from "./useSmartRecommendations";

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
  lat?: number;
  lng?: number;
  distanceKm?: number;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinedDate: string;
  interests: string[];
  avatar?: string;
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

const EVENTS_PER_PAGE = 9;
const NEARBY_RADIUS_KM = 50;

export default function Page() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Smart Picks full-page overlay
  const [showSmartPicks, setShowSmartPicks] = useState(false);

  // Nearby events view
  const [showNearbyView, setShowNearbyView] = useState(false);

  const { location, error: locationError, loading: locationLoading, requestLocation } = useGeolocation();
  const { weather } = useWeather(location);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when Smart Picks overlay is open
  useEffect(() => {
    document.body.style.overflow = showSmartPicks ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showSmartPicks]);

  /* Fetch user profile */
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setUserLoading(true);
        const response = await fetch("/api/user/profile", {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          if (response.status === 401) { router.push("/login"); return; }
          throw new Error("Failed to fetch user profile");
        }
        const userData: UserProfile = await response.json();
        setUser(userData);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Unable to load user profile");
      } finally {
        setUserLoading(false);
      }
    }
    fetchUserProfile();
  }, [router]);

  /* Fetch events */
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/events/show", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`Failed to fetch events: ${response.status}`);
        const eventsList: Event[] = await response.json();
        setEvents(eventsList);
        setResults(eventsList);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Unable to load events from database");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  /* Filter */
  useEffect(() => {
    if (showNearbyView) return; // nearby view manages its own list
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
    setCurrentPage(1);
  }, [query, events, selectedCategory, showNearbyView]);

  /* Nearby events sorted by distance asc */
  const nearbyEvents = useMemo(() => {
    if (!location) return [];
    return events
      .map((ev) => {
        if (!ev.lat || !ev.lng) return null;
        const dist = getDistanceKm(location.lat, location.lng, ev.lat, ev.lng);
        return dist <= NEARBY_RADIUS_KM ? { ...ev, distanceKm: dist } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.distanceKm! - b!.distanceKm!) as Event[];
  }, [location, events]);

  /* Weather-based events */
  const weatherEvents = useMemo(() => {
    if (!weather) return [];
    return events.filter((ev) =>
      weather.recommendedCategories.includes(ev.category?.toLowerCase())
    );
  }, [weather, events]);

  /* What to show in the grid */
  const displayEvents = showNearbyView ? nearbyEvents : results;
  const totalPages = Math.ceil(displayEvents.length / EVENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const currentEvents = displayEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE);

  const handleViewEvent = (event: Event) => {
    router.push(`/dashboard/user/${event.id}`);
  };

  const getEventImage = (event: Event) => {
    if (event.banner) return event.banner;
    return categoryImages[event.category?.toLowerCase()] || categoryImages.default;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !user) return;
    router.push("/dashboard/user/ask-ai");
    setChatMessage("");
  };

  const scrollToEvents = () => {
    document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNearbyClick = () => {
    if (!location) {
      requestLocation();
      return;
    }
    setShowNearbyView(true);
    setCurrentPage(1);
    document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth" });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Unable to load user profile</p>
          <button onClick={() => router.push("/login")} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <UserShell user={user} profileOpen={profileOpen} setProfileOpen={setProfileOpen} onLogout={handleLogout}>
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
        @keyframes overlayIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-gradient { background-size: 200% 200%; animation: gradient 3s ease infinite; }
        .rotating-text span { opacity: 0; animation: textRotate 16s ease-in-out infinite; }
        .rotating-text span:nth-child(1) { animation-delay: 0s; }
        .rotating-text span:nth-child(2) { animation-delay: 4s; }
        .rotating-text span:nth-child(3) { animation-delay: 8s; }
        .rotating-text span:nth-child(4) { animation-delay: 12s; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .overlay-in { animation: overlayIn 0.25s ease forwards; }
        html { scroll-behavior: smooth; }
      `}</style>

      <main className="min-h-screen bg-slate-950 overflow-x-hidden">

        {/* ── SMART PICKS FULL-PAGE OVERLAY ── */}
        {showSmartPicks && !loading && user && (
          <div className="overlay-in">
            <SmartRecommendations
              events={events}
              user={user}
              weather={weather}
              nearbyEvents={nearbyEvents}
              weatherEvents={weatherEvents}
              onViewEvent={handleViewEvent}
              locationLoading={locationLoading}
              locationError={locationError}
              onRequestLocation={requestLocation}
              userLocation={location}
              onClose={() => setShowSmartPicks(false)}
            />
          </div>
        )}

        {/* ── HERO SECTION ── */}
        <div className="relative min-h-[75vh] flex items-center justify-center overflow-hidden">
          {/* Backgrounds */}
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
              backgroundImage: "url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: `translateY(${scrollY * 0.5}px)`,
            }}
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

          {/* ── WEATHER WIDGET — flush top right ── */}
          <div className="absolute top-0 right-0 z-20">
            {weather ? (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-black/30 backdrop-blur-xl rounded-bl-2xl border-b border-l border-white/10 shadow-xl">
                <span className="text-2xl leading-none">{weather.icon}</span>
                <div className="text-right">
                  <p className="text-white font-semibold text-sm leading-tight">{weather.description}</p>
                  <p className="text-slate-300 text-xs">{Math.round(weather.temperature)}°C</p>
                </div>
              </div>
            ) : (
              <button
                onClick={requestLocation}
                disabled={locationLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-black/30 backdrop-blur-xl rounded-bl-2xl border-b border-l border-white/10 text-sm text-slate-300 hover:bg-black/50 transition-all disabled:opacity-50"
              >
                {locationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4 text-emerald-400" />}
                {locationLoading ? "Locating..." : "Get Weather"}
              </button>
            )}
          </div>

          {/* Hero content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <div className="mb-6" style={{ transform: `translateY(${scrollY * -0.2}px)` }}>
              <div className="mb-6">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight flex flex-wrap justify-center items-center gap-3 md:gap-4">
                  <span className="text-white">Discover</span>
                  <span className="relative inline-block rotating-text" style={{ width: "750px", height: "1.2em" }}>
                    <span className="absolute inset-0 flex items-center justify-start bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient whitespace-nowrap">Exciting Activities</span>
                    <span className="absolute inset-0 flex items-center justify-start bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient whitespace-nowrap">Hidden Gems</span>
                    <span className="absolute inset-0 flex items-center justify-start bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient whitespace-nowrap">New Connections</span>
                    <span className="absolute inset-0 flex items-center justify-start bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient whitespace-nowrap">Amazing Events</span>
                  </span>
                </h2>
              </div>
              <p className="text-slate-300 text-lg md:text-xl mb-6 max-w-3xl mx-auto leading-relaxed">
                Join thousands of attendees to find and book the perfect events for you
              </p>
            </div>

            {/* Search bar */}
            <div className="max-w-4xl mx-auto mb-6" style={{ transform: `translateY(${scrollY * -0.1}px)` }}>
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="relative mb-6">
                  <MessageCircle className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Looking for something fun? Ask about any activity or event"
                    className="w-full pl-14 pr-28 py-5 rounded-2xl border-0 bg-white/10 backdrop-blur-sm text-white placeholder-slate-400 text-base shadow-xl focus:ring-4 focus:ring-purple-500/50 outline-none transition-all"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <button
                      onClick={handleSendMessage}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                    >
                      <Search className="h-4 w-4" />
                      Ask
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="text-xs text-slate-400 mr-2 self-center">Popular:</span>
                  {["Music concerts", "Tech workshops", "Food festivals"].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => { setChatMessage(suggestion); handleSendMessage(); }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white font-medium transition-all backdrop-blur-sm border border-white/10"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={scrollToEvents} className="inline-flex flex-col items-center gap-2 text-white/60 hover:text-white transition-all animate-bounce">
              <span className="text-sm">Explore Events</span>
              <ChevronDown className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* ── EVENTS SECTION ── */}
        <div id="events-section" className="relative bg-slate-950 py-20">
          {/* Sticky category bar */}
          <div className="sticky top-20 z-40 bg-slate-950/95 backdrop-blur-xl border-y border-white/5 mb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 py-6 overflow-x-auto scrollbar-hide">
                {eventCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id && !showNearbyView;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setShowNearbyView(false); setCurrentPage(1); }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium whitespace-nowrap transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                          : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
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
            {/* Section header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-3xl font-bold text-white">
                  {showNearbyView ? "Nearby Events" : selectedCategory === "all" ? "All Events" : eventCategories.find((c) => c.id === selectedCategory)?.name}
                </h3>
                <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold border border-purple-500/30">
                  {displayEvents.length} events
                </span>
                {showNearbyView && (
                  <button
                    onClick={() => { setShowNearbyView(false); setCurrentPage(1); }}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back to all
                  </button>
                )}
              </div>

              {/* Right: Smart Picks + Search */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSmartPicks(true)}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all border bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 text-purple-300 border-purple-500/30 hover:from-indigo-600/30 hover:via-purple-600/30 hover:to-pink-600/30 disabled:opacity-50"
                >
                  <Brain className="h-4 w-4" />
                  Smart Picks
                </button>

                <div className="relative max-w-xs hidden md:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search events..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* ── NEARBY EVENTS ROW — just under the heading ── */}
            <div className="flex items-center gap-3 mb-10">
              {!showNearbyView ? (
                <button
                  onClick={handleNearbyClick}
                  disabled={locationLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    location
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                      : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200"
                  } disabled:opacity-50`}
                >
                  {locationLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  {locationLoading
                    ? "Getting location..."
                    : location
                    ? `Nearby Events (${nearbyEvents.length})`
                    : "Nearby Events"}
                </button>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <Navigation className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <p className="text-sm text-emerald-200">
                    Showing <span className="font-bold">{nearbyEvents.length} events</span> within {NEARBY_RADIUS_KM} km · sorted by distance
                  </p>
                </div>
              )}
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
                {currentEvents.length === 0 ? (
                  <div className="bg-white/5 border-2 border-white/10 p-20 rounded-3xl text-center backdrop-blur-sm">
                    <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-8 flex items-center justify-center">
                      {showNearbyView ? <Navigation className="h-12 w-12 text-slate-400" /> : <Search className="h-12 w-12 text-slate-400" />}
                    </div>
                    <p className="text-white font-semibold text-2xl mb-3">
                      {showNearbyView ? "No events nearby" : "No events found"}
                    </p>
                    <p className="text-slate-400 mb-8">
                      {showNearbyView ? `No events within ${NEARBY_RADIUS_KM} km of your location` : "Try adjusting your search or filters"}
                    </p>
                    <button
                      onClick={() => { setShowNearbyView(false); setQuery(""); setSelectedCategory("all"); }}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-lg hover:shadow-purple-500/50 transition-all font-semibold"
                    >
                      {showNearbyView ? "View All Events" : "Clear Filters"}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {currentEvents.map((event, idx) => (
                        <article
                          key={event.id}
                          className="group bg-white/5 rounded-3xl overflow-hidden backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                          <div className="relative h-64 overflow-hidden bg-slate-900">
                            <img
                              src={getEventImage(event)}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              onError={(e) => { (e.target as HTMLImageElement).src = categoryImages.default; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                            <div className="absolute top-4 left-4">
                              <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-slate-900 shadow-xl capitalize">
                                {event.category}
                              </span>
                            </div>
                            {event.distanceKm !== undefined && (
                              <div className="absolute top-4 left-32">
                                <span className="px-3 py-2 bg-emerald-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white shadow-xl flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.distanceKm < 1 ? "<1" : Math.round(event.distanceKm)} km
                                </span>
                              </div>
                            )}
                            {weather && weather.recommendedCategories.includes(event.category?.toLowerCase()) && (
                              <div className="absolute bottom-4 left-4">
                                <span className="px-3 py-1.5 bg-sky-500/80 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-lg flex items-center gap-1">
                                  {weather.icon} Weather Pick
                                </span>
                              </div>
                            )}
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
                                {!event.ticketPrice || event.ticketPrice === 0 ? (
                                  <span className="text-2xl font-bold text-green-400">FREE</span>
                                ) : (
                                  <>
                                    <IndianRupee className="h-5 w-5 text-green-400" />
                                    <span className="text-2xl font-bold text-white">{event.ticketPrice}</span>
                                  </>
                                )}
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

                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-6 mt-12">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-2">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                                  currentPage === pageNum
                                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </UserShell>
  );
}