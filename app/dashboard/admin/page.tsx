"use client";

import React, { useState } from 'react';
import { Users, Calendar, CheckCircle, BookOpen, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('');
  const router = useRouter();

  const menuItems = [
    { id: 'users', label: 'View Users', icon: Users, color: 'bg-blue-500', path: '/dashboard/admin/view-users' },
    { id: 'events', label: 'View Events Details', icon: Calendar, color: 'bg-purple-500', path: '/dashboard/admin/view-events' },
    { id: 'verify-events', label: 'Verify Events', icon: CheckCircle, color: 'bg-green-500', path: '/dashboard/admin/verify-events' },
    { id: 'verify-bookings', label: 'Verify Bookings', icon: BookOpen, color: 'bg-orange-500', path: '/dashboard/admin/verify-bookings' },
    { id: 'statistics', label: 'Site Statistics', icon: BarChart3, color: 'bg-pink-500', path: '/dashboard/admin/statistics' },
  ];

  const handleMenuClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 overflow-hidden flex flex-col">
      {/* Logo - Top */}
      <div className="py-6 px-8 border-b border-slate-700">
        <div className="flex items-center gap-3 justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
            <span className="text-3xl font-bold text-white">A</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin</h1>
            <p className="text-sm text-slate-400">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Menu Grid - 3 in first row, 2 in second row */}
      <div className="flex-1 flex items-center justify-center px-12 py-8">
        <div className="grid grid-cols-3 gap-10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.path)}
                className={`flex items-center gap-4 p-6 rounded-xl transition-all duration-200 w-64 ${
                  activeSection === item.id
                    ? 'bg-slate-700 shadow-2xl scale-105'
                    : 'bg-slate-800 hover:bg-slate-700 hover:scale-105 hover:shadow-xl'
                }`}
              >
                <div className={`w-14 h-14 ${item.color} rounded-lg flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-medium text-left leading-tight text-white">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Info - Bottom */}
      <div className="py-4 px-6 border-t border-slate-700">
        <div className="flex items-center gap-3 justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full"></div>
          <div>
            <p className="font-medium text-sm text-white">Admin User</p>
            <p className="text-slate-400 text-xs">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}