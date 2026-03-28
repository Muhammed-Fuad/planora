"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Home, Calendar, Plus, History, Sparkles, Loader, Menu, X, Cloud, MapPin, Navigation } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function PlanoraAIChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage.content },
          ],
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message || "I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error calling chat API:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { icon: Calendar, text: "Find music concerts this weekend", color: "from-purple-500 to-pink-500", glow: "shadow-purple-500/50" },
    { icon: Cloud, text: "What's the weather for outdoor events?", color: "from-blue-500 to-cyan-500", glow: "shadow-blue-500/50" },
    { icon: Navigation, text: "Best route to downtown venue", color: "from-green-500 to-emerald-500", glow: "shadow-green-500/50" },
    { icon: MapPin, text: "Food festivals near me", color: "from-orange-500 to-red-500", glow: "shadow-orange-500/50" },
  ];

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard/user" },
    { icon: Calendar, label: "My Events", path: "/dashboard/user/my-events" },
    { icon: Plus, label: "Create Event", path: "/dashboard/user/create-event" },
    { icon: History, label: "History", path: "/dashboard/user/history" },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-purple-500/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Planora
              </h1>
              <p className="text-xs text-gray-400">AI Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Navigation — scrollable if many items, but content here is short */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 transition-all group border border-transparent hover:border-purple-500/30"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-800/50 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-pink-600 flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-purple-500/50">
                <item.icon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <span className="font-medium text-gray-300 group-hover:text-white">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-purple-500/20 flex-shrink-0">
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 backdrop-blur-sm">
          <p className="text-xs font-medium text-purple-400 mb-1">💡 Pro Tip</p>
          <p className="text-xs text-gray-400">
            Ask me about weather, routes, or nearby events for the best recommendations!
          </p>
        </div>
      </div>
    </div>
  );

  return (
    // KEY FIX: h-screen + overflow-hidden on the root so nothing on the page scrolls
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex overflow-hidden relative">

      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* ── SIDEBAR (Desktop) — fixed height, never scrolls with chat ── */}
      <aside
        className={`
          hidden lg:flex flex-col flex-shrink-0
          relative z-50
          bg-gray-900/50 backdrop-blur-xl
          border-r border-purple-500/20 shadow-2xl
          transition-all duration-300
          h-full                          /* fills the full viewport height */
          ${sidebarOpen ? "w-72" : "w-0 overflow-hidden"}
        `}
      >
        {sidebarOpen && (
          <div className="w-72 h-full">
            <SidebarContent />
          </div>
        )}
      </aside>

      {/* ── SIDEBAR (Mobile) — slide-in, fixed position ── */}
      <aside
        className={`
          fixed lg:hidden inset-y-0 left-0 z-50
          w-72 h-full
          bg-gray-900/95 backdrop-blur-xl
          border-r border-purple-500/20 shadow-2xl
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* ── MAIN CONTENT — flex column, fills remaining width ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">

        {/* Header — fixed at top, never scrolls */}
        <div className="flex-shrink-0 bg-gray-900/50 backdrop-blur-xl border-b border-purple-500/20 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 flex items-center justify-center transition-all border border-purple-500/30"
              >
                <Menu className="h-5 w-5 text-purple-400" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Planora AI</h1>
                  <p className="text-xs text-gray-400">Your intelligent event assistant</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Messages — the ONLY scrollable area ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-purple-500/50">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  How can I help you today?
                </h2>
                <p className="text-gray-400 mb-10 max-w-md mx-auto text-sm">
                  Ask me about events, weather, travel routes, or anything else you need for planning!
                </p>

                <div className="space-y-4 max-w-2xl mx-auto">
                  <p className="text-sm font-semibold text-gray-300 mb-5">Try asking:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quickPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(prompt.text)}
                        className="p-4 bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 rounded-xl text-left transition-all group relative overflow-hidden"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${prompt.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                        <div className="relative flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${prompt.color} flex items-center justify-center shadow-lg ${prompt.glow} flex-shrink-0`}>
                            <prompt.icon className="h-5 w-5 text-white" />
                          </div>
                          <p className="text-xs font-medium text-gray-300 group-hover:text-white pt-2">
                            {prompt.text}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/50">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[70%] rounded-xl px-4 py-3 shadow-lg ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-purple-500/50"
                          : "bg-gray-800/50 backdrop-blur-sm text-gray-100 border border-purple-500/20"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1.5 ${message.role === "user" ? "text-purple-200" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    {message.role === "user" && (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center flex-shrink-0 border border-gray-600/50">
                        <User className="h-4 w-4 text-gray-200" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/50">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl px-4 py-3 shadow-lg">
                      <div className="flex items-center gap-2">
                        <Loader className="h-3.5 w-3.5 text-purple-400 animate-spin" />
                        <span className="text-sm text-gray-300">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* ── Input bar — fixed at bottom, never scrolls ── */}
        <div className="flex-shrink-0 bg-gray-900/80 backdrop-blur-xl border-t border-purple-500/20 z-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-1.5 shadow-2xl shadow-purple-500/20">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask about events, weather, routes, or anything..."
                  className="flex-1 px-4 py-2.5 bg-transparent text-gray-100 placeholder-gray-500 text-sm outline-none"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Press Enter to send
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}