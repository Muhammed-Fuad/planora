"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Users, Calendar, DollarSign, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Attendee = {
  id: string;
  name: string;
  age: number;
};

type Event = {
  id: string;
  title: string;
  startDateTime: Date;
  ticketPrice: number | null;
};

type User = {
  id: string;
  name: string;
  email: string;
} | null;

type Booking = {
  id: string;
  email: string;
  phone: string;
  totalAmount: number;
  status: string;
  paymentProof: string | null;
  createdAt: Date;
  event: Event;
  attendees: Attendee[];
  user: User;
};

export default function VerifyBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/verify-bookings');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to fetch bookings: ${response.status}`);
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'accept' | 'reject') => {
    const actionText = action === 'accept' ? 'approve' : 'reject';
    
    if (!window.confirm(`Are you sure you want to ${actionText} this booking?`)) {
      return;
    }

    try {
      setProcessing(bookingId);
      const response = await fetch(`/api/admin/verify-bookings?id=${bookingId}&action=${action}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Failed to ${actionText} booking`);
      }

      // Remove booking from local state
      setBookings(bookings.filter(booking => booking.id !== bookingId));
    } catch (err) {
      console.error(`Error ${actionText}ing booking:`, err);
      alert(`Failed to ${actionText} booking. Please try again.`);
    } finally {
      setProcessing(null);
    }
  };

  const handleBackClick = () => {
    router.push('/dashboard/admin');
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <p className="text-sm text-slate-400">Verify Bookings</p>
            </div>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Pending Bookings List */}
      <div className="flex-1 overflow-y-auto px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Pending Bookings for Verification</h2>
            <div className="text-slate-400 text-sm">
              Pending: <span className="text-orange-400 font-semibold">{bookings.length}</span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-slate-800 rounded-xl shadow-2xl p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto text-blue-400 animate-spin mb-4" />
              <p className="text-white text-lg">Loading bookings...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl shadow-2xl p-6 text-center">
              <p className="text-red-400">{error}</p>
              <button
                onClick={fetchBookings}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Bookings List */}
          {!loading && !error && (
            <div className="space-y-6">
              {bookings.length === 0 ? (
                <div className="bg-slate-800 rounded-xl shadow-2xl p-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
                  <p className="text-white text-lg font-medium">All bookings have been verified!</p>
                  <p className="text-slate-400 text-sm mt-2">No pending bookings at the moment.</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow">
                    <div className="border-l-4 border-orange-500">
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-white">Booking #{booking.id.slice(0, 8)}</h3>
                              <span className="px-3 py-1 text-xs rounded-full bg-orange-500/20 text-orange-400 font-medium">
                                Pending Payment Verification
                              </span>
                            </div>
                            <p className="text-slate-400 text-sm">
                              Submitted on {formatDate(booking.createdAt)}
                            </p>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleBookingAction(booking.id, 'accept')}
                              disabled={processing === booking.id}
                              className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
                            >
                              {processing === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  Accept
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleBookingAction(booking.id, 'reject')}
                              disabled={processing === booking.id}
                              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
                            >
                              {processing === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Left Column - Event & Customer Info */}
                          <div className="lg:col-span-1 space-y-4">
                            <div className="bg-slate-900/50 rounded-lg p-4">
                              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                Event Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <p className="text-slate-400">Event</p>
                                  <p className="text-white font-medium">{booking.event.title}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Date</p>
                                  <p className="text-white">{formatDate(booking.event.startDateTime)}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Ticket Price</p>
                                  <p className="text-green-400 font-bold">
                                    ${booking.event.ticketPrice || 0}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-slate-900/50 rounded-lg p-4">
                              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-400" />
                                Payment Info
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <p className="text-slate-400">Customer Name</p>
                                  <p className="text-white font-medium">{booking.user?.name || 'Guest'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Email</p>
                                  <p className="text-white">{booking.email}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Phone</p>
                                  <p className="text-white">{booking.phone}</p>
                                </div>
                                <div className="pt-2 border-t border-slate-700">
                                  <p className="text-slate-400">Total Amount</p>
                                  <p className="text-green-400 font-bold text-lg">${booking.totalAmount}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Middle Column - Attendees */}
                          <div className="lg:col-span-1">
                            <div className="bg-slate-900/50 rounded-lg p-4 h-full">
                              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-400" />
                                Attendees ({booking.attendees.length})
                              </h4>
                              <div className="space-y-3">
                                {booking.attendees.map((attendee, index) => (
                                  <div 
                                    key={attendee.id} 
                                    className="bg-slate-800 rounded-lg p-3 border border-slate-700"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-white font-medium">{attendee.name}</p>
                                        <p className="text-slate-400 text-sm">Age: {attendee.age}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right Column - Payment Proof */}
                          <div className="lg:col-span-1">
                            <div className="bg-slate-900/50 rounded-lg p-4 h-full">
                              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-yellow-400" />
                                Payment Proof
                              </h4>
                              {booking.paymentProof ? (
                                <div className="space-y-3">
                                  <div 
                                    className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border-2 border-slate-700 cursor-pointer hover:border-blue-500 transition-colors bg-slate-900"
                                    onClick={() => setSelectedImage(booking.paymentProof)}
                                  >
                                    <img
                                      src={`${booking.paymentProof}`}
                                      alt="Payment proof"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23334155"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
                                      }}
                                    />
                                  </div>
                                  <button
                                    onClick={() => setSelectedImage(booking.paymentProof)}
                                    className="w-full px-3 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition-colors"
                                  >
                                    View Full Size
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-40 border-2 border-dashed border-slate-700 rounded-lg">
                                  <p className="text-slate-500 text-sm">No payment proof uploaded</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
            >
              <XCircle className="w-8 h-8" />
            </button>
            <img
              src={`/uploads/payment-proofs/${selectedImage}`}
              alt="Payment proof full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23334155"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="16"%3EImage not found%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        </div>
      )}

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