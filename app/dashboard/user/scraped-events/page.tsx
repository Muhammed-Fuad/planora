"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  MapPin,
  ArrowRight,
  X,
  Sparkles,
  Music,
  Utensils,
  Palette,
  Trophy,
  Gamepad2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  IndianRupee,
} from "lucide-react";
import { useRouter } from "next/navigation";
import UserShell from "../userShell";

/* ================= TYPES ================= */
type EventItem = {
  name: string;
  location: string;
  date: string;
  rate?: string;
  description: string;
  event_url?: string;
  category?: string | null;
  image_url?: string | null;
  attendees?: number;
  rating?: string;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  interests: string[];
  joinedDate: string;
  avatar?: string;
};

/* ================= CONSTANTS ================= */
const eventCategories = [
  { id: "all", name: "All Events", icon: Sparkles, color: "indigo" },
  { id: "music", name: "Music", icon: Music, color: "purple" },
  { id: "food", name: "Food & Drink", icon: Utensils, color: "orange" },
  { id: "art", name: "Art & Culture", icon: Palette, color: "pink" },
  { id: "sports", name: "Sports", icon: Trophy, color: "green" },
  { id: "tech", name: "Tech", icon: Gamepad2, color: "blue" },
  { id: "business", name: "Business", icon: Briefcase, color: "slate" },
];

const categoryImages: Record<string, string[]> = {
  music: [
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
  ],
  food: [
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  ],
  art: [
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
    "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80",
    "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800&q=80",
    "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80",
  ],
  sports: [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
    "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80",
  ],
  tech: [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
  ],
  business: [
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80",
  ],
};

const EVENTS_PER_PAGE = 15;

/* ================= COMPONENT ================= */
export default function EventDiscoveryPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  /* ================= AUTH ================= */
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user/profile", { credentials: "include" });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        setUser(await res.json());
      } catch {
        router.push("/login");
      }
    }
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  /* ================= EVENTS ================= */
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/venues");
      if (!res.ok) throw new Error("Failed to fetch events");

      const data = await res.json();

      const venues: EventItem[] = Array.isArray(data?.venues)
        ? data.venues
        : Array.isArray(data)
        ? data
        : [];

      const categoryList = ["music", "food", "art", "sports", "tech", "business"];

      const enriched = venues.map((e, index) => ({
        ...e,
        category: e.category ?? categoryList[index % categoryList.length],
        rating: e.rating ?? (Math.random() * 2 + 3).toFixed(1),
        attendees: e.attendees ?? Math.floor(Math.random() * 500) + 50,
      }));

      setEvents(enriched);
      setFilteredEvents(enriched);
    } catch (err) {
      console.error("Fetch events failed:", err);
      setError("Unable to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* ================= FILTER ================= */
  useEffect(() => {
    let result = [...events];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((e) => e.category === selectedCategory);
    }

    setFilteredEvents(result);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, events]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const currentEvents = filteredEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE);

  const getEventImage = (e: EventItem) => {
    if (e.image_url) return e.image_url;
    const category = e.category || "default";
    const images = categoryImages[category] || categoryImages.default;
    const hash = e.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return images[hash % images.length];
  };

  const handleViewEvent = (event: EventItem) => {
    if (event.event_url) {
      window.open(event.event_url, "_blank");
    }
  };

  if (!user) return null;

  return (
    <UserShell
      user={user}
      profileOpen={profileOpen}
      setProfileOpen={setProfileOpen}
      onLogout={handleLogout}
    >
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="min-h-screen bg-slate-950">
        {/* CATEGORY FILTER BAR */}
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
                        ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                        : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{cat.name}</span>
                    {isSelected && cat.id !== "all" && (
                      <span className="ml-1 px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                        {filteredEvents.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* HEADER ROW */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <h3 className="text-3xl font-bold text-white">
                {selectedCategory === "all"
                  ? "All Events"
                  : eventCategories.find((c) => c.id === selectedCategory)?.name}
              </h3>
              <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold border border-purple-500/30">
                {filteredEvents.length} events
              </span>
            </div>

            <div className="relative max-w-md hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm transition-all"
              />
            </div>
          </div>

          {/* LOADING SKELETON */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 animate-pulse"
                >
                  <div className="h-64 bg-white/10" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                    <div className="h-4 bg-white/10 rounded w-2/3" />
                    <div className="h-6 bg-white/10 rounded w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="bg-red-500/10 border-2 border-red-500/20 p-12 rounded-3xl text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <X className="h-10 w-10 text-red-400" />
              </div>
              <p className="font-semibold text-red-400 text-xl mb-2">⚠️ {error}</p>
              <p className="text-sm text-red-300/70">Please check your connection and try again</p>
              <button
                onClick={fetchEvents}
                className="mt-6 px-6 py-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {/* EVENTS GRID */}
          {!loading && !error && (
            <>
              {currentEvents.length === 0 ? (
                <div className="bg-white/5 border-2 border-white/10 p-20 rounded-3xl text-center">
                  <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-8 flex items-center justify-center">
                    <Search className="h-12 w-12 text-slate-400" />
                  </div>
                  <p className="text-white font-semibold text-2xl mb-3">No events found</p>
                  <p className="text-slate-400 mb-8">Try adjusting your search or filters</p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-lg hover:shadow-purple-500/50 transition-all font-semibold"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentEvents.map((event, idx) => (
                      <article
                        key={idx}
                        onClick={() => handleViewEvent(event)}
                        className="group bg-slate-900/50 rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 cursor-pointer"
                      >
                        {/* IMAGE */}
                        <div className="relative h-56 overflow-hidden bg-slate-900">
                          <img
                            src={getEventImage(event)}
                            alt={event.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = categoryImages.default[0];
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                          {/* Category badge */}
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-md text-xs font-bold text-slate-900 shadow-lg capitalize">
                              {event.category}
                            </span>
                          </div>

                          {/* Event name overlay */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="font-bold text-lg text-white line-clamp-2 group-hover:text-purple-300 transition-colors leading-snug">
                              {event.name}
                            </h3>
                          </div>
                        </div>

                        {/* CARD BODY */}
                        <div className="p-5 space-y-3">
                          {/* Date — rendered directly from API string */}
                          <div className="flex items-start gap-2 text-sm text-slate-300">
                            <Calendar className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                            <span className="leading-snug">
                              {event.date || "Date TBA"}
                            </span>
                          </div>

                          {/* Location */}
                          <div className="flex items-start gap-2 text-sm text-slate-300">
                            <MapPin className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1 capitalize">
                              {event.location || "Location TBA"}
                            </span>
                          </div>

                          {/* Price + CTA */}
                          <div className="flex items-center justify-between pt-3 border-t border-white/10">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="h-4 w-4 text-green-400" />
                              <span className="text-base font-bold text-white">
                                {event.rate || "Free"}
                              </span>
                            </div>

                            {event.event_url && (
                              <span className="flex items-center gap-1 text-xs text-purple-400 group-hover:text-purple-300 font-medium transition-colors">
                                View Event
                                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* PAGINATION */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-14">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
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
    </UserShell>
  );
}