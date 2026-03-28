// useSmartRecommendations.ts
// Hook that combines AI, location, and weather recommendations

import { useState, useEffect, useCallback } from "react";

export type WeatherCondition = {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
  description: string;
  icon: string;
  recommendedCategories: string[];
  recommendationReason: string;
};

export type LocationData = {
  lat: number;
  lng: number;
  city?: string;
};

export type EventWithDistance = {
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

// WMO weather interpretation codes → categories
function getWeatherRecommendation(
  code: number,
  temp: number,
  isDay: boolean
): { categories: string[]; reason: string; description: string; icon: string } {
  // Night time
  if (!isDay) {
    return {
      categories: ["music", "food", "art"],
      reason: "Perfect night for indoor events and nightlife",
      description: "Night",
      icon: "🌙",
    };
  }

  // Hot & sunny (temp > 28°C)
  if (temp > 28 && (code <= 3)) {
    return {
      categories: ["sports", "music", "food"],
      reason: `It's a hot ${Math.round(temp)}°C day — great for outdoor events & water activities!`,
      description: "Hot & Sunny",
      icon: "☀️",
    };
  }

  // Clear / partly cloudy & pleasant
  if (code <= 3 && temp >= 18 && temp <= 28) {
    return {
      categories: ["sports", "art", "music", "food"],
      reason: `Beautiful ${Math.round(temp)}°C weather — perfect for any outdoor event!`,
      description: "Pleasant",
      icon: "🌤️",
    };
  }

  // Rainy / thunderstorm
  if (code >= 51 && code <= 99) {
    return {
      categories: ["tech", "business", "art", "food"],
      reason: "Rainy outside — ideal for indoor workshops, exhibitions & food events",
      description: "Rainy",
      icon: "🌧️",
    };
  }

  // Cloudy / overcast
  if (code >= 4 && code <= 48) {
    return {
      categories: ["tech", "business", "art"],
      reason: "Overcast sky — a great day for indoor tech and culture events",
      description: "Cloudy",
      icon: "☁️",
    };
  }

  // Cold
  if (temp < 10) {
    return {
      categories: ["food", "tech", "business", "art"],
      reason: `It's cold at ${Math.round(temp)}°C — stay cozy with indoor events`,
      description: "Cold",
      icon: "🥶",
    };
  }

  return {
    categories: ["music", "food", "art", "sports", "tech"],
    reason: "All kinds of events await you today!",
    description: "Mixed",
    icon: "🌈",
  };
}

export function useWeather(location: LocationData | null) {
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location) return;

    async function fetchWeather() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location!.lat}&longitude=${location!.lng}&current=temperature_2m,weather_code,is_day&timezone=auto`
        );
        const data = await res.json();
        const temp = data.current.temperature_2m;
        const code = data.current.weather_code;
        const isDay = data.current.is_day === 1;

        const rec = getWeatherRecommendation(code, temp, isDay);
        setWeather({
          temperature: temp,
          weatherCode: code,
          isDay,
          description: rec.description,
          icon: rec.icon,
          recommendedCategories: rec.categories,
          recommendationReason: rec.reason,
        });
      } catch (e) {
        console.error("Weather fetch failed", e);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [location?.lat, location?.lng]);

  return { weather, loading };
}

export function useGeolocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  return { location, error, loading, requestLocation };
}

// Haversine distance in km
export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}