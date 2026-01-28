import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, Phone, Mail, IndianRupee } from 'lucide-react';

// Fetch event by ID from your API
async function getEventById(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/events/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const event = await response.json();
    return event;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventsId: string }>;
}) {
  const { eventsId } = await params;
  const event = await getEventById(eventsId);

  if (!event) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          href="/dashboard/user"
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-3 transition-colors text-sm"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Events
        </Link>

        <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          <div className="grid lg:grid-cols-5 gap-0">
            {/* Left Column - Image & Map (2 columns) */}
            <div className="lg:col-span-2 flex flex-col">
              {/* Event Image */}
              <div className="relative h-64 lg:h-80 w-full bg-slate-800">
                {event.banner ? (
                  <Image
                    src={event.banner}
                    alt={event.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-6xl">🎉</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-slate-900 capitalize shadow-lg">
                    {event.category}
                  </span>
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-3 right-3">
                  <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
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
                </div>
              </div>

              {/* Google Map */}
              <div className="flex-1 bg-slate-800 relative min-h-[200px]">
                {event.mapUrl ? (
                  <iframe
                    src={event.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-xs">Map location unavailable</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Event Details (3 columns) */}
            <div className="lg:col-span-3 p-6 flex flex-col">
              {/* Title & Description */}
              <div className="mb-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  {event.title}
                </h1>
                <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
                  {event.shortDescription}
                </p>
              </div>

              {/* Event Info Grid - Compact */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Start Date/Time */}
                <div className="flex items-start gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                  <Calendar className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Start</p>
                    <p className="text-white text-xs font-semibold">{formatDate(event.startDateTime)}</p>
                    <p className="text-slate-300 text-[11px]">{formatTime(event.startDateTime)}</p>
                  </div>
                </div>

                {/* End Date/Time */}
                <div className="flex items-start gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                  <Clock className="h-4 w-4 text-pink-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">End</p>
                    <p className="text-white text-xs font-semibold">{formatDate(event.endDateTime || event.startDateTime)}</p>
                    <p className="text-slate-300 text-[11px]">{formatTime(event.endDateTime || event.startDateTime)}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                  <MapPin className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Venue</p>
                    <p className="text-white text-xs font-semibold line-clamp-1">{event.venueName}</p>
                    <p className="text-slate-300 text-[11px] line-clamp-1">{event.city}, {event.country}</p>
                  </div>
                </div>

                {/* Capacity */}
                <div className="flex items-start gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                  <Users className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Capacity</p>
                    <p className="text-white text-xs font-semibold">{event.current_attendees || 0} / {event.maxAttendees}</p>
                    <p className="text-slate-300 text-[11px]">{Math.round(((event.current_attendees || 0) / event.maxAttendees) * 100)}% filled</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar - Compact */}
              <div className="mb-4">
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((event.current_attendees || 0) / event.maxAttendees) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="mb-4 flex-1">
                <h2 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">About Event</h2>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {event.detailedDescription || event.shortDescription}
                </p>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 p-2.5 bg-white/5 rounded-lg border border-white/10">
                  <Phone className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide">Contact</p>
                    <a href={`tel:${event.contactPhone || '+91-1234567890'}`} className="text-white text-xs font-medium hover:text-purple-400 transition-colors">
                      {event.contactPhone || '+91-1234567890'}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-white/5 rounded-lg border border-white/10">
                  <Mail className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide">Support</p>
                    <a href={`mailto:${event.supportEmail || 'support@event.com'}`} className="text-white text-xs font-medium hover:text-purple-400 transition-colors line-clamp-1">
                      {event.supportEmail || 'support@event.com'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                    href={`${event.id}/book-now`}
                    className="flex-1 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
                            hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 
                            text-white font-bold py-3 px-6 rounded-xl transition duration-200 
                            text-sm shadow-lg hover:shadow-xl hover:shadow-purple-500/50"
                >
                    Book Now – ₹{event.ticketPrice}
                </Link>

                <button
                    className="px-6 py-3 border-2 border-white/20 hover:border-purple-500 
                            text-white hover:text-purple-400 font-semibold rounded-xl 
                            transition duration-200 hover:bg-white/5 text-sm"
                >
                    Wishlist
                </button>
                </div>


              {/* Additional Info - Ultra Compact */}
              <div className="mt-3 text-center">
                <p className="text-[10px] text-slate-400 flex items-center justify-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="text-green-400">⚡</span> Limited seats
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-blue-400">🎟️</span> Instant confirm
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-400">💯</span> Refundable
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}