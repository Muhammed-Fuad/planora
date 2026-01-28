"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  IndianRupee,
  Edit,
  Plus,
  Clock,
  Search,
} from "lucide-react";
import UserShell from "../userShell";
import { useRouter } from "next/navigation";

type Event = {
  id: string;
  title: string;
  shortDescription: string;
  startDateTime: string;
  venueName?: string | null;
  city?: string | null;
  country?: string | null;
  category: string;
  ticketPrice: number;
  banner?: string | null;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  interests: string[];
  joinedDate: string;
  avatar?: string;
};

const categoryImages: Record<string, string> = {
  music: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  food: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
  art: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
  tech: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
  default: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
};

export default function MyEventsPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  /* 🔐 Fetch logged-in user */
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user/profile", {
          credentials: "include",
        });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch {
        router.push("/login");
      }
    }
    fetchUser();
  }, [router]);

  /* 📦 Fetch user events */
  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events/my", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (eventId: string) => {
    router.push(`/events/edit/${eventId}`);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  const getEventImage = (event: Event) =>
    event.banner ||
    categoryImages[event.category?.toLowerCase()] ||
    categoryImages.default;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const filteredEvents = events.filter((event) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      event.title.toLowerCase().includes(q) ||
      event.venueName?.toLowerCase().includes(q) ||
      event.city?.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === "all" ||
      event.category?.toLowerCase() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (!user) return null;

  return (
    <UserShell
      user={user}
      profileOpen={profileOpen}
      setProfileOpen={setProfileOpen}
      onLogout={handleLogout}
    >
      <div className="min-h-screen bg-slate-950">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 py-5 px-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">My Events</h1>
              <p className="text-slate-400 mt-1">
                Manage and edit your created events
              </p>
            </div>

            <button
                onClick={() => router.push("/dashboard/user/create-event")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Create Event
              </button>

          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-2 py-4 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 text-white border border-white/10"
            />
          </div>

          <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10"
            >
              {["all", "music", "food", "art", "sports", "tech", "business"].map((c) => (
                <option
                  key={c}
                  value={c}
                  className="bg-slate-900 text-white"
                >
                  {c.toUpperCase()}
                </option>
              ))}
            </select>

        </div>

        {/* Events */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          {loading ? (
            <p className="text-white">Loading...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : filteredEvents.length === 0 ? (
            <p className="text-slate-400">No events found.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
                >
                  <img
                    src={getEventImage(event)}
                    alt={event.title}
                    className="h-48 w-full object-cover"
                  />

                  <div className="p-5">
                    <h3 className="text-white font-bold text-lg mb-2">
                      {event.title}
                    </h3>

                    <div className="text-slate-400 text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {formatDate(event.startDateTime)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {formatTime(event.startDateTime)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        {event.venueName || "Online"}
                        {event.city ? `, ${event.city}` : ""}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-1 text-white">
                        {/* If ticketPrice is null, undefined, or 0, show "FREE" */}
                          {!event.ticketPrice || event.ticketPrice === 0 ? (
                            <span className="text-2xl font-bold text-green-400">FREE</span>
                          ) : (
                            <>
                              <IndianRupee className="h-5 w-5 text-green-400" />
                              <span className="text-2xl font-bold text-white">
                                {event.ticketPrice}
                              </span>
                            </>
                          )}
                      </div>

                      <button
                        onClick={() => handleEdit(event.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 transition"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UserShell>
  );
}
