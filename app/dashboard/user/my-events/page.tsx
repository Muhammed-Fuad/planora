"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  IndianRupee,
  Plus,
  Clock,
  Search,
  Eye,
  Trash2,
  X,
  Download,
  Users,
  Mail,
  Phone,
  Tag,
  AlertTriangle,
  Globe,
  DollarSign,
} from "lucide-react";
import UserShell from "../userShell";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type Event = {
  id: string;
  title: string;
  shortDescription: string;
  startDateTime: string;
  venueName?: string | null;
  city?: string | null;
  country?: string | null;
  category: string;
  ticketPrice: number;
  banner?: string | null;
  description?: string | null;
  endDateTime?: string | null;
  capacity?: number | null;
  organizer?: string | null;
};

type Attendee = {
  id: string;
  name: string;
  age?: number | null;
  email: string;
  phone?: string | null;
  bookingId?: string;
  bookingStatus?: string | null;
  totalAmount?: number | null;
  registeredAt: string;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  interests: string[];
  joinedDate: string;
  avatar?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const categoryImages: Record<string, string> = {
  music:    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
  art:      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
  sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
  tech:     "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
  default:  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
};

const getEventImage = (event: Event) =>
  event.banner ||
  categoryImages[event.category?.toLowerCase()] ||
  categoryImages.default;

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

// ─── PDF Generator — direct .pdf file download via jsPDF + autoTable ────────

async function downloadAttendeePDF(event: Event, attendees: Attendee[]) {
  // Dynamically import jsPDF and autotable so they don't bloat the initial bundle
  const { default: jsPDF }   = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // ── Header bar ──
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 0, 297, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(event.title, 14, 14);

  // ── Meta info row ──
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  const venue    = [event.venueName, event.city, event.country].filter(Boolean).join(", ") || "Online";
  const price    = !event.ticketPrice || event.ticketPrice === 0 ? "Free" : `Rs.${event.ticketPrice}`;
  const dateStr  = formatDate(event.startDateTime);
  doc.text(`Date: ${dateStr}   |   Venue: ${venue}   |   Ticket: ${price}   |   Total Attendees: ${attendees.length}`, 14, 30);

  // ── Table ──
  autoTable(doc, {
    startY: 35,
    head: [["Sl.No", "Name", "Age", "Email", "Phone", "Status", "Registered On"]],
    body: attendees.length > 0
      ? attendees.map((a, i) => [
          i + 1,
          a.name,
          a.age ?? "—",
          a.email,
          a.phone ?? "—",
          a.bookingStatus ?? "PENDING",
          new Date(a.registeredAt).toLocaleDateString("en-IN"),
        ])
      : [["", "No attendees registered yet.", "", "", "", "", ""]],
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 30, 30],
    },
    alternateRowStyles: {
      fillColor: [245, 247, 255],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 16 },  // Sl.No
      2: { halign: "center", cellWidth: 14 },  // Age
      5: { halign: "center", cellWidth: 24 },  // Status
      6: { halign: "center", cellWidth: 30 },  // Registered On
    },
    didDrawCell: (data) => {
      // Colour the Status cell text based on value
      if (data.section === "body" && data.column.index === 5) {
        const status = String(data.cell.raw ?? "");
        const color: [number, number, number] =
          status === "PAID"      ? [5, 150, 105]  :   // green
          status === "CANCELLED" ? [220, 38, 38]  :   // red
                                   [161, 98, 7];      // yellow
        doc.setTextColor(...color);
        doc.setFont("helvetica", "bold");
        doc.text(
          status,
          data.cell.x + data.cell.width / 2,
          data.cell.y + data.cell.height / 2 + 1,
          { align: "center" }
        );
        // Reset for next cell
        doc.setTextColor(30, 30, 30);
        doc.setFont("helvetica", "normal");
      }
    },
    // Footer row with total
    foot: [["", "", "", "", "", "Total", String(attendees.length)]],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: "bold",
      fontSize: 9,
    },
  });

  // ── Footer line ──
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(
    `Generated on ${new Date().toLocaleString("en-IN")}   |   ${event.title}`,
    14,
    pageHeight - 6
  );

  // ── Direct download — no print dialog, no blank page ──
  const fileName = `${event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_attendees.pdf`;
  doc.save(fileName);
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteModal({
  event,
  onConfirm,
  onCancel,
  deleting,
}: {
  event: Event;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-red-500/20">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <h3 className="text-white font-semibold text-lg">Delete Event</h3>
        </div>
        <p className="text-slate-300 text-sm mb-1">Are you sure you want to delete</p>
        <p className="text-white font-medium mb-5">"{event.title}"?</p>
        <p className="text-slate-400 text-xs mb-6">
          This action cannot be undone. All attendee registrations associated with this event will also be removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-sm font-medium transition"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View / Detail Modal (Full Screen) ───────────────────────────────────────
// Layout: LEFT = event image + details | RIGHT = attendees list

function ViewModal({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  const [attendees, setAttendees]           = useState<Attendee[]>([]);
  const [loadingAttendees, setLoading]      = useState(true);
  const [attendeeError, setAttendeeError]   = useState("");

  useEffect(() => {
    async function fetchAttendees() {
      try {
        setLoading(true);
        const res = await fetch(`/api/events/${event.id}/attendees`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch attendees");
        const data = await res.json();
        setAttendees(Array.isArray(data.attendees) ? data.attendees : []);
      } catch (err) {
        setAttendeeError(err instanceof Error ? err.message : "Failed to load attendees");
      } finally {
        setLoading(false);
      }
    }
    fetchAttendees();
  }, [event.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* Modal container */}
      <div className="relative z-10 w-full max-w-6xl max-h-[92vh] bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-indigo-400 bg-indigo-500/15 px-2.5 py-1 rounded-full">
              {event.category}
            </span>
            <h2 className="text-white font-bold text-lg">{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Two-column body ── */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

          {/* ── LEFT: Event image + details ── */}
          <div className="md:w-[42%] flex flex-col border-r border-white/10 overflow-y-auto">
            {/* Banner */}
            <img
              src={getEventImage(event)}
              alt={event.title}
              className="w-full h-52 object-cover shrink-0"
            />

            {/* Details */}
            <div className="p-5 flex flex-col gap-4 flex-1">
              {event.shortDescription && (
                <p className="text-slate-300 text-sm leading-relaxed">
                  {event.shortDescription}
                </p>
              )}

              <div className="space-y-3 text-sm">
                {/* Date & Time */}
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/8">
                  <Calendar className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">{formatDate(event.startDateTime)}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {formatTime(event.startDateTime)}
                      {event.endDateTime ? ` – ${formatTime(event.endDateTime)}` : ""}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/8">
                  <MapPin className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">{event.venueName || "Online"}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {[event.city, event.country].filter(Boolean).join(", ") || "—"}
                    </p>
                  </div>
                </div>

                {/* Ticket Price */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/8">
                  <IndianRupee className="h-4 w-4 text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-slate-400 text-xs">Ticket Price</p>
                    <p className="text-white font-semibold">
                      {!event.ticketPrice || event.ticketPrice === 0
                        ? "Free"
                        : `₹${event.ticketPrice}`}
                    </p>
                  </div>
                </div>

                {/* Capacity */}
                {event.capacity && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/8">
                    <Users className="h-4 w-4 text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-slate-400 text-xs">Capacity</p>
                      <p className="text-white font-semibold">{event.capacity}</p>
                    </div>
                  </div>
                )}

                {/* Organizer */}
                {event.organizer && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/8">
                    <Tag className="h-4 w-4 text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-slate-400 text-xs">Organizer</p>
                      <p className="text-white font-semibold">{event.organizer}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Attendees ── */}
          <div className="md:flex-1 flex flex-col overflow-hidden">
            {/* Attendees header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-400" />
                Joined Users
                {!loadingAttendees && (
                  <span className="text-sm text-slate-400 font-normal">
                    ({attendees.length})
                  </span>
                )}
              </h3>

              {!loadingAttendees && !attendeeError && (
                <button
                  onClick={() => void downloadAttendeePDF(event, attendees)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </button>
              )}
            </div>

            {/* Attendees list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingAttendees ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />
                ))
              ) : attendeeError ? (
                <p className="text-red-400 text-sm px-1">{attendeeError}</p>
              ) : attendees.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <Users className="h-10 w-10 text-slate-600 mb-3" />
                  <p className="text-slate-400 text-sm">No attendees yet.</p>
                </div>
              ) : (
                attendees.map((a, index) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3 hover:bg-white/8 transition"
                  >
                    {/* Sl.No badge */}
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                      {index + 1}
                    </div>

                    {/* Avatar initial */}
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600/40 to-purple-600/40 flex items-center justify-center text-white font-semibold text-sm shrink-0 border border-white/10">
                      {a.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm truncate">{a.name}</p>
                        {a.age && (
                          <span className="text-xs text-slate-500 shrink-0">· {a.age}y</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                          <Mail className="h-3 w-3" />
                          {a.email}
                        </span>
                        {a.phone && (
                          <span className="flex items-center gap-1 text-slate-400 text-xs">
                            <Phone className="h-3 w-3" />
                            {a.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status + Date */}
                    <div className="text-right shrink-0">
                      {a.bookingStatus && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            a.bookingStatus === "PAID"
                              ? "bg-green-500/15 text-green-400"
                              : a.bookingStatus === "CANCELLED"
                              ? "bg-red-500/15 text-red-400"
                              : "bg-yellow-500/15 text-yellow-400"
                          }`}
                        >
                          {a.bookingStatus}
                        </span>
                      )}
                      <p className="text-slate-500 text-xs mt-1">
                        {new Date(a.registeredAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyEventsPage() {
  const router = useRouter();

  const [user, setUser]               = useState<UserProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [events, setEvents]           = useState<Event[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [viewingEvent, setViewingEvent]   = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user/profile", { credentials: "include" });
        if (!res.ok) { router.push("/login"); return; }
        setUser(await res.json());
      } catch { router.push("/login"); }
    }
    fetchUser();
  }, [router]);

  useEffect(() => { fetchMyEvents(); }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events/my", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingEvent) return;
    try {
      setDeleteInProgress(true);
      const res = await fetch(`/api/events/${deletingEvent.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete event");
      setEvents((prev) => prev.filter((e) => e.id !== deletingEvent.id));
      setDeletingEvent(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteInProgress(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  const filteredEvents = events.filter((event) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      event.title.toLowerCase().includes(q) ||
      event.venueName?.toLowerCase().includes(q) ||
      event.city?.toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === "all" ||
      event.category?.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!user) return null;

  return (
    <UserShell
      user={user}
      profileOpen={profileOpen}
      setProfileOpen={setProfileOpen}
      onLogout={handleLogout}
    >
      <div className="min-h-screen bg-slate-950">

        {/* ── Header ── */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 py-5 px-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">My Events</h1>
              <p className="text-slate-400 mt-1">Manage and edit your created events</p>
            </div>
            <button
              onClick={() => router.push("/dashboard/user/create-event")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="max-w-7xl mx-auto px-2 py-4 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 text-white border border-white/10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10"
          >
            {["all", "music", "food", "art", "sports", "tech", "business"].map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-white">
                {c.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* ── Events Grid ── */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          {loading ? (
            <p className="text-white">Loading...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : filteredEvents.length === 0 ? (
            <p className="text-slate-400">No events found.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
                >
                  <img
                    src={getEventImage(event)}
                    alt={event.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-white font-bold text-lg mb-2">{event.title}</h3>
                    <div className="text-slate-400 text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {formatDate(event.startDateTime)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {formatTime(event.startDateTime)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        {event.venueName || "Online"}
                        {event.city ? `, ${event.city}` : ""}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-1 text-white">
                        {!event.ticketPrice || event.ticketPrice === 0 ? (
                          <span className="text-2xl font-bold text-green-400">FREE</span>
                        ) : (
                          <>
                            <IndianRupee className="h-5 w-5 text-green-400" />
                            <span className="text-2xl font-bold text-white">{event.ticketPrice}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingEvent(event)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition text-sm font-medium"
                        >
                          <Eye size={15} />
                          View
                        </button>
                        <button
                          onClick={() => setDeletingEvent(event)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 transition text-sm font-medium"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── View Modal ── */}
      {viewingEvent && (
        <ViewModal event={viewingEvent} onClose={() => setViewingEvent(null)} />
      )}

      {/* ── Delete Modal ── */}
      {deletingEvent && (
        <DeleteModal
          event={deletingEvent}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingEvent(null)}
          deleting={deleteInProgress}
        />
      )}
    </UserShell>
  );
}