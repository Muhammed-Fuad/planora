"use client";

import Link from "next/link";
import React, { useRef, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Sun,
  User,
  Heart,
  Settings,
  LogOut,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinedDate: string;
  interests: string[];
  avatar?: string;
};

type LayoutProps = {
  user: UserProfile;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  onLogout: () => void;
  children: ReactNode;
};

export default function UserShell({
  user,
  profileOpen,
  setProfileOpen,
  onLogout,
  children,
}: LayoutProps) {
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /* Close profile dropdown when clicking outside */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setProfileOpen]);

  /* ✅ Logout + redirect to main page */
  const handleLogout = async () => {
    try {
      await onLogout();
    } finally {
      router.replace("/"); // ⬅ redirect to landing page
    }
  };

  /* ✅ Navigate to Joined Events page */
  const handleJoinedEventsClick = () => {
    setProfileOpen(false);
    router.push("/dashboard/user/joined-event");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col text-white">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/5 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl p-2 bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Planora
                </h1>
                <p className="text-xs text-slate-400">
                  Discover amazing events
                </p>
              </div>
            </div>

            {/* NAV */}
            <nav className="flex gap-4 md:gap-6 items-center text-sm font-medium">
              {[
                { href: "/dashboard/user", label: "Home" },
                { href: "/dashboard/user/scraped-events", label: "Discover" },
                { href: "/dashboard/user/my-events", label: "My Events" },
                { href: "/dashboard/user/create-event", label: "Create" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-slate-300 hover:text-indigo-400 transition-colors"
                >
                  {item.label}
                </a>
              ))}

              {/* PROFILE */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-white/10 hover:border-indigo-500/40 transition-all"
                >
                  <User className="h-4 w-4 text-indigo-400" />
                  <span className="text-sm font-medium hidden sm:inline">
                    {user.name}
                  </span>
                </button>

                {/* DROPDOWN */}
                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* TOP */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                          <User className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {user.name}
                          </h3>
                          <p className="text-xs text-indigo-100">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-indigo-100 mt-2">
                        Member since {user.joinedDate}
                      </p>
                    </div>

                    {/* BODY */}
                    <div className="p-4 space-y-4">
                      {user.interests?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {user.interests.map((i, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-slate-800 text-indigo-300 rounded-md text-xs"
                            >
                              {i}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="space-y-1 pt-2">
                        <button 
                          onClick={handleJoinedEventsClick}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition"
                        >
                          <Heart className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">Joined Events</span>
                        </button>

                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition">
                          <Settings className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">Settings</span>
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="flex-1">{children}</main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-950 border-t border-white/5 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-2">Planora</h3>
            <p className="text-sm">
              Discover events tailored to your interests.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              <li>Discover</li>
              <li>My Events</li>
              <li>Create Event</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Support</h4>
            <ul className="space-y-1 text-sm">
              <li>Help Center</li>
              <li>FAQ</li>
              <li>Privacy</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Social</h4>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <div
                  key={i}
                  className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                >
                  <Icon className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-xs py-4 border-t border-white/5">
          © {new Date().getFullYear()} Planora. All rights reserved.
        </div>
      </footer>
    </div>
  );
}