"use client";

import React, { useState } from 'react';
import { 
  Calendar, MapPin, Globe, Upload, DollarSign, Users, 
  Phone, Tag, Image as ImageIcon, 
  Clock, CheckCircle, AlertCircle, X, ArrowLeft
} from 'lucide-react';

type EventMode = 'offline' | 'online' | 'hybrid';
type TicketType = 'free' | 'paid';

export default function CreateEventPage() {
  const [eventMode, setEventMode] = useState<EventMode>('offline');
  const [ticketType, setTicketType] = useState<TicketType>('free');
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const categories = [
    'Music', 'Tech', 'Workshop', 'Cultural', 'Religious', 
    'Sports', 'Business', 'Education', 'Food & Drink', 'Art', 'Other'
  ];

  const platforms = [
    'Zoom', 'Google Meet', 'Microsoft Teams', 'YouTube Live', 
    'Facebook Live', 'Instagram Live', 'Discord', 'Other'
  ];

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + galleryPreviews.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!data.title) newErrors.title = 'Event title is required';
    if (!data.OrganizerName)  newErrors.OrganizerName = 'Organizer name is required';
    if (!data.shortDescription) newErrors.shortDescription = 'Short description is required';
    if (!data.category) newErrors.category = 'Category is required';
    if (!data.startDateTime) newErrors.startDateTime = 'Start date & time is required';
    if (!data.endDateTime) newErrors.endDateTime = 'End date & time is required';
    
    // Date validation
    const startDate = new Date(data.startDateTime as string);
    const endDate = new Date(data.endDateTime as string);
    if (startDate >= endDate) {
      newErrors.endDateTime = 'End time must be after start time';
    }
    if (startDate < new Date()) {
      newErrors.startDateTime = 'Event cannot be in the past';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          eventMode,
          ticketType,
          banner: bannerPreview,
          gallery: galleryPreviews,
        }),
      });

      if (!response.ok) throw new Error('Failed to create event');

      const result = await response.json();
      alert('Event created successfully! It will be reviewed by our team.');
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create New Event
            </h1>
            <p className="text-sm text-slate-600">Fill in the details to create your event</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Basic Event Info */}
          <section className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-indigo-600" />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Enter event title"
                    className={`w-full px-3 py-2.5 rounded-lg border-2 ${errors.title ? 'border-red-500' : 'border-slate-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all`}
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Organizer Name *
                  </label>
                  <input
                    type="text"
                    name="OrganizerName"
                    required
                    placeholder="Enter organizer name"
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Short Description * (1-2 lines)
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  required
                  maxLength={150}
                  placeholder="Brief description for event cards"
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  name="detailedDescription"
                  required
                  rows={4}
                  placeholder="Provide detailed information about your event"
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Tags / Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="e.g., networking, startup, tech"
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 2. Date & Time */}
          <section className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Date & Time
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="startDateTime"
                  required
                  className={`w-full px-3 py-2.5 rounded-lg border-2 ${errors.startDateTime ? 'border-red-500' : 'border-slate-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all`}
                />
                {errors.startDateTime && <p className="text-red-600 text-sm mt-1">{errors.startDateTime}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="endDateTime"
                  required
                  className={`w-full px-3 py-2.5 rounded-lg border-2 ${errors.endDateTime ? 'border-red-500' : 'border-slate-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all`}
                />
                {errors.endDateTime && <p className="text-red-600 text-sm mt-1">{errors.endDateTime}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Timezone
                </label>
                <input
                  type="text"
                  name="timezone"
                  defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* 3. Location / Mode */}
          <section className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600" />
              Location & Mode
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Event Mode *
              </label>
              <div className="flex gap-3">
                {(['offline', 'online', 'hybrid'] as EventMode[]).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setEventMode(mode)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                      eventMode === mode
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {(eventMode === 'offline' || eventMode === 'hybrid') && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      name="venueName"
                      required={eventMode === 'offline' || eventMode === 'hybrid'}
                      placeholder="Enter venue name"
                      className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required={eventMode === 'offline' || eventMode === 'hybrid'}
                      placeholder="Street address"
                      className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required={eventMode === 'offline' || eventMode === 'hybrid'}
                      placeholder="City"
                      className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required={eventMode === 'offline' || eventMode === 'hybrid'}
                      placeholder="State"
                      className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      required={eventMode === 'offline' || eventMode === 'hybrid'}
                      defaultValue="India"
                      placeholder="Country"
                      className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Google Maps Link
                    </label>
                    <input
                      type="url"
                      name="mapsLink"
                      placeholder="Maps URL"
                      className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {(eventMode === 'online' || eventMode === 'hybrid') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Platform *
                  </label>
                  <select
                    name="platform"
                    required={eventMode === 'online' || eventMode === 'hybrid'}
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  >
                    <option value="">Select platform</option>
                    {platforms.map(platform => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Event Link *
                  </label>
                  <input
                    type="url"
                    name="eventLink"
                    required={eventMode === 'online' || eventMode === 'hybrid'}
                    placeholder="Meeting link (hidden until start time)"
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </section>

          {/* 4. Event Media */}
          <section className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-indigo-600" />
              Event Media
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Event Banner (16:9)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label htmlFor="banner-upload" className="cursor-pointer">
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Banner preview" className="max-h-32 mx-auto rounded" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-6 w-6 text-slate-400" />
                        <p className="text-xs text-slate-600">Upload banner</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Gallery Images (Max 5)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    className="hidden"
                    id="gallery-upload"
                  />
                  <label htmlFor="gallery-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-slate-400" />
                      <p className="text-xs text-slate-600">Upload gallery</p>
                    </div>
                  </label>
                </div>
                {galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    {galleryPreviews.map((preview, idx) => (
                      <div key={idx} className="relative">
                        <img src={preview} alt={`Gallery ${idx + 1}`} className="w-full h-16 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Promo Video URL
                </label>
                <input
                  type="url"
                  name="promoVideoUrl"
                  placeholder="YouTube/Instagram URL"
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* 5. Ticketing & Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ticketing */}
            <section className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                Ticketing
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Ticket Type *
                  </label>
                  <div className="flex gap-3">
                    {(['free', 'paid'] as TicketType[]).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTicketType(type)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                          ticketType === type
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {ticketType === 'paid' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Price *
                        </label>
                        <input
                          type="number"
                          name="ticketPrice"
                          required={ticketType === 'paid'}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Currency
                        </label>
                        <select
                          name="currency"
                          defaultValue="INR"
                          className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Registration Deadline
                      </label>
                      <input
                        type="datetime-local"
                        name="registrationDeadline"
                        className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Ticket URL
                      </label>
                      <input
                        type="url"
                        name="ticketUrl"
                        placeholder="External ticketing link"
                        className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      />
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Capacity & Rules */}
            <section className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Capacity & Rules
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Max Attendees
                  </label>
                  <input
                    type="number"
                    name="maxAttendees"
                    min="1"
                    placeholder="Unlimited if blank"
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Age Restriction
                  </label>
                  <input
                    type="text"
                    name="ageRestriction"
                    placeholder="e.g., 18+, All ages"
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Dress Code
                  </label>
                  <input
                    type="text"
                    name="dressCode"
                    placeholder="e.g., Casual, Formal"
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Special Instructions
                  </label>
                  <input
                    type="text"
                    name="specialInstructions"
                    placeholder="Any requirements"
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* 6. Contact & Support */}
          <section className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-indigo-600" />
              Contact & Support
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  placeholder="+91 1234567890"
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Support Email
                </label>
                <input
                  type="email"
                  name="supportEmail"
                  placeholder="support@event.com"
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  placeholder="https://website.com"
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Social Media
                </label>
                <input
                  type="text"
                  name="socialMedia"
                  placeholder="@handle"
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Terms & Submit */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  id="terms"
                  required
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="terms" className="text-sm text-slate-700">
                  I agree to the terms and conditions and confirm all event details are accurate *
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Clock className="h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Create Event
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Event Review Process</p>
                  <p>Your event will be reviewed by our team within 24-48 hours. You'll receive an email once approved.</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}