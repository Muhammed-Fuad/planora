"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import {
  Sun,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Users,
} from "lucide-react";
import { apiClient } from "@/app/lib/apiClient";

const eventTypes = [
  { id: "concerts", label: "Concerts", icon: "🎵" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "conferences", label: "Conferences", icon: "🎤" },
  { id: "workshops", label: "Workshops", icon: "🛠️" },
  { id: "networking", label: "Networking", icon: "🤝" },
  { id: "festivals", label: "Festivals", icon: "🎉" },
  { id: "art", label: "Art & Culture", icon: "🎨" },
  { id: "food", label: "Food & Drink", icon: "🍕" },
  { id: "tech", label: "Tech Events", icon: "💻" },
  { id: "outdoor", label: "Outdoor", icon: "🏕️" },
];

export type RegisterState = {
  error?: string;
  success?: boolean;
};

const RegisterPage = () => {
  // Form state for interests (client-side only)
  const [interests, setInterests] = useState<string[]>([]);

  const handleInterestChange = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  // Server action using useActionState
  const [state, registerAction, isPending] = useActionState(
    async (
      prevState: RegisterState,
      formData: FormData
    ): Promise<RegisterState> => {
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;
      // const interestsData = formData.get("interests") as string;

      // Validation
      if (password !== confirmPassword) {
        return { error: "Passwords do not match" };
      }

      if (password.length < 8) {
        return { error: "Password must be at least 8 characters" };
      }

      // const parsedInterests = interestsData ? JSON.parse(interestsData) : [];
      // if (parsedInterests.length === 0) {
      //   return { error: "Please select at least one interest" };
      // }

      try {
        await apiClient.register({
          name,
          email,
          password,
          // interests: parsedInterests,
        });
        window.location.href = "/dashboard";
        return { success: true };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Registration failed",
        };
      }
    },
    { error: undefined, success: undefined }
  );

  return (
    <main className="h-screen w-screen bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left side - Branding */}
          <div className="text-center lg:text-left space-y-6 lg:self-start lg:pt-12">
            <div className="inline-flex items-center gap-2.5 lg:flex">
              <div className="rounded-xl p-2.5 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 shadow-2xl shadow-purple-500/50">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Planora
                </h1>
                <p className="text-sm text-slate-400">
                  Discover amazing events
                </p>
              </div>
            </div>

            <div className="hidden lg:block space-y-4 pt-4">
              <h2 className="text-3xl font-bold text-white leading-tight">
                Join the platform for<br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  personalized event discovery
                </span>
              </h2>
              
              <div className="space-y-3 pt-3">
                <div className="flex items-start gap-2.5 p-2.5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-0.5">Personalized Events</h4>
                    <p className="text-sm text-slate-400">Get recommendations based on your interests</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-0.5">Smart Planning</h3>
                    <p className="text-sm text-slate-400">Never miss an event with intelligent reminders</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0 border border-pink-500/30">
                    <Users className="w-4 h-4 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-0.5">Connect & Share</h3>
                    <p className="text-sm text-slate-400">Invite friends and plan together</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Register Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-slate-400">Join Planora and discover amazing events</p>
              </div>

              {/* Error Message */}
              {state?.error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {state.error}
                </div>
              )}

              <form action={registerAction} className="space-y-4">
                {/* Hidden field for interests */}
                <input
                  type="hidden"
                  name="interests"
                  value={JSON.stringify(interests)}
                />

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        id="name"
                        type="text"
                        name="name"
                        required
                        placeholder="Enter your full name"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-xs"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        id="password"
                        type="password"
                        name="password"
                        required
                        placeholder="Min 8 characters"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-xs"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        required
                        placeholder="Confirm password"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Interests - Commented Out */}
                {/* <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Select Your Interests
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {eventTypes.map((event) => (
                      <label
                        key={event.id}
                        className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl cursor-pointer border-2 transition-all hover:shadow-md ${
                          interests.includes(event.id)
                            ? "border-purple-500 bg-purple-500/10 shadow-md"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={interests.includes(event.id)}
                          onChange={() => handleInterestChange(event.id)}
                          className="sr-only"
                        />
                        <span className="text-2xl">{event.icon}</span>
                        <span
                          className={`text-xs font-medium text-center ${
                            interests.includes(event.id)
                              ? "text-purple-300"
                              : "text-slate-400"
                          }`}
                        >
                          {event.label}
                        </span>
                        {interests.includes(event.id) && (
                          <CheckCircle2 className="w-4 h-4 text-purple-400 absolute top-2 right-2" />
                        )}
                      </label>
                    ))}
                  </div>
                </div> */}

                {/* Terms */}
                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500/50"
                  />
                  <span className="text-sm text-slate-400">
                    I agree to the{" "}
                    <a
                      href="/terms"
                      className="font-semibold text-purple-400 hover:text-purple-300"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="font-semibold text-purple-400 hover:text-purple-300"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </div>

                {/* Register Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                {/* Login link */}
                <p className="text-center text-sm text-slate-400 pt-2">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;