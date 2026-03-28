"use client";

import React, { useState, useEffect } from "react";
import {
  Brain, CloudSun, X, RefreshCw, ThumbsUp,
  TrendingUp, MapPin, ChevronRight, Loader2,
  ArrowRight, IndianRupee, Calendar, Clock, Star
} from "lucide-react";

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
  distanceKm?: number;
};

type WeatherCondition = {
  temperature: number;
  description: string;
  icon: string;
  recommendedCategories: string[];
  recommendationReason: string;
};

type UserProfile = {
  id: string;
  name: string;
  interests: string[];
};

type Props = {
  events: Event[];
  user: UserProfile;
  weather: WeatherCondition | null;
  nearbyEvents: Event[];
  weatherEvents: Event[];
  onViewEvent: (event: Event) => void;
  locationLoading: boolean;
  locationError: string;
  onRequestLocation: () => void;
  userLocation: { lat: number; lng: number } | null;
  onClose: () => void;
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

function getEventImage(event: Event) {
  if (event.banner) return event.banner;
  return categoryImages[event.category?.toLowerCase()] || categoryImages.default;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
}

// Full event card (same style as main page)
function EventCard({ event, onView }: { event: Event; onView: (e: Event) => void }) {
  return (
    <article
      onClick={() => onView(event)}
      className="group bg-white/5 rounded-3xl overflow-hidden backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden bg-slate-900">
        <img
          src={getEventImage(event)}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => { (e.target as HTMLImageElement).src = categoryImages.default; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-slate-900 shadow-xl capitalize">
            {event.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-base text-white mb-3 line-clamp-2 group-hover:text-purple-400 transition-colors min-h-[2.8rem]">
          {event.title}
        </h3>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
            <span className="line-clamp-1">{event.venueName}, {event.city}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Calendar className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
            <span>{formatDate(event.startDateTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Clock className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
            <span>{formatTime(event.startDateTime)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-1">
            {!event.ticketPrice || event.ticketPrice === 0 ? (
              <span className="text-lg font-bold text-green-400">FREE</span>
            ) : (
              <>
                <IndianRupee className="h-4 w-4 text-green-400" />
                <span className="text-lg font-bold text-white">{event.ticketPrice}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
            View <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function SmartRecommendations({
  events,
  user,
  weather,
  weatherEvents,
  onViewEvent,
  onClose,
}: Props) {
  const [aiEvents, setAiEvents] = useState<Event[]>([]);
  const [reasoning, setReasoning] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "weather">("ai");

  const fetchAIRecommendations = async () => {
    if (events.length === 0 || aiLoading) return;
    setAiLoading(true);

    try {
      const eventsSnapshot = events.slice(0, 30).map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        city: e.city,
        ticketPrice: e.ticketPrice,
        date: e.startDateTime,
      }));

      const prompt = `You are an event recommendation engine. Return ONLY a JSON object, no explanation, no markdown.

User: ${user.name}, interests: ${user.interests.join(", ") || "general events"}

Events: ${JSON.stringify(eventsSnapshot)}

Respond with exactly this JSON structure:
{"recommendedIds":["id1","id2","id3","id4","id5","id6"],"reasoning":"one sentence"}

Use only IDs from the list above. Pick 6 best matches.`;

      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "API error " + response.status);
      }

      const text = (data.text ?? "").trim();
      if (!text) throw new Error("Empty response from AI");

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response: " + text.slice(0, 200));
      const parsed = JSON.parse(jsonMatch[0]);

      const recommended = parsed.recommendedIds
        .map((id: string) => events.find((e) => e.id === id))
        .filter(Boolean) as Event[];

      setAiEvents(recommended);
      setReasoning(parsed.reasoning || "");
    } catch (e) {
      console.error("AI recommendation error", e);
      // Fallback: interest-based
      const fallback = events
        .filter((ev) =>
          user.interests.some((i) =>
            ev.category?.toLowerCase().includes(i.toLowerCase()) ||
            ev.title?.toLowerCase().includes(i.toLowerCase())
          )
        )
        .slice(0, 6);
      setAiEvents(fallback.length ? fallback : events.slice(0, 6));
      setReasoning("Based on your interests and profile.");
    } finally {
      setAiLoading(false);
      setAiLoaded(true);
    }
  };

  useEffect(() => {
  // Guard 1: Don't fetch if already loading or already loaded
  if (events.length > 0 && !aiLoaded && !aiLoading) {
    fetchAIRecommendations();
  }
}, [events.length, aiLoaded, aiLoading]); // Add aiLoading to the dependency array

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const displayEvents = activeTab === "ai" ? aiEvents : weatherEvents.slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            {/* Left: title */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Smart Picks</h2>
                <p className="text-xs text-slate-400">Personalized for {user.name}</p>
              </div>
            </div>

            {/* Center: tabs */}
            <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/10">
              <button
                onClick={() => setActiveTab("ai")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "ai"
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Brain className="h-4 w-4" />
                AI Picks
              </button>
              <button
                onClick={() => setActiveTab("weather")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "weather"
                    ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <CloudSun className="h-4 w-4" />
                {weather ? `${weather.icon} ${weather.description}` : "Weather"}
              </button>
            </div>

            {/* Right: refresh + close */}
            <div className="flex items-center gap-3">
              {activeTab === "ai" && (
                <button
                  onClick={fetchAIRecommendations}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 text-sm"
                >
                  <RefreshCw className={`h-4 w-4 ${aiLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              )}
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Reasoning / weather banner */}
        {activeTab === "ai" && reasoning && !aiLoading && (
          <div className="flex items-start gap-3 mb-8 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <ThumbsUp className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-indigo-200 leading-relaxed">{reasoning}</p>
          </div>
        )}
        {activeTab === "weather" && weather && (
          <div className="flex items-start gap-3 mb-8 p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20">
            <TrendingUp className="h-5 w-5 text-sky-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-sky-200 leading-relaxed">{weather.recommendationReason}</p>
          </div>
        )}

        {/* Loading */}
        {aiLoading && activeTab === "ai" && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
              <Brain className="absolute inset-0 m-auto h-7 w-7 text-indigo-400" />
            </div>
            <p className="text-slate-400">Analyzing your preferences...</p>
          </div>
        )}

        {/* Events grid */}
        {!aiLoading && (
          <>
            {displayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                  <Brain className="h-10 w-10 text-slate-500" />
                </div>
                <p className="text-white font-semibold text-xl">No recommendations yet</p>
                <p className="text-slate-400 text-sm">
                  {activeTab === "ai" ? "Try refreshing to get personalized picks" : "Enable location to see weather-based picks"}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    {activeTab === "ai" ? "Recommended for you" : "Best for today's weather"}
                  </h3>
                  <span className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold border border-purple-500/30">
                    {displayEvents.length} picks
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onView={(ev) => { onViewEvent(ev); onClose(); }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}