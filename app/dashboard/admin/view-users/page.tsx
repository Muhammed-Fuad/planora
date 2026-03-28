"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
};

export default function ViewUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/view-users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setDeleting(userId);
      const response = await fetch(`/api/admin/view-users?id=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Remove user from local state
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleBackClick = () => {
    router.push('/dashboard/admin');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 overflow-hidden flex flex-col">
      {/* Header with Back Button */}
      <div className="py-6 px-8 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-bold text-white">A</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin</h1>
              <p className="text-sm text-slate-400">View Users</p>
            </div>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto px-12 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">All Users</h2>
            <div className="text-slate-400 text-sm">
              Total Users: <span className="text-white font-semibold">{users.length}</span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-slate-800 rounded-xl shadow-2xl p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto text-blue-400 animate-spin mb-4" />
              <p className="text-white text-lg">Loading users...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl shadow-2xl p-6 text-center">
              <p className="text-red-400">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Users Table */}
          {!loading && !error && (
            <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
              {users.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-400 text-lg">No users found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Username</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-700 transition-colors">
                        <td className="px-6 py-4 text-sm text-white font-medium">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">{user.email}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deleting === user.id}
                            className="px-5 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleting === user.id ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deleting...
                              </span>
                            ) : (
                              'Delete'
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
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