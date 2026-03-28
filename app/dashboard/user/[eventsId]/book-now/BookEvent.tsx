"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Ticket,
  Users,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  Mail,
  Phone,
  User,
  Calendar,
  Plus,
  Minus,
} from "lucide-react";

type Attendee = {
  name: string;
  age: string;
};

type Props = {
  eventId: string;
};

export default function BookEventPage({ eventId }: Props) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [count, setCount] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([
    { name: "", age: "" },
  ]);
  const [loading, setLoading] = useState(false);

  /* ---------- Validation ---------- */
  const isStep1Valid =
    email.trim() !== "" && phone.trim() !== "" && email.includes("@");

  const isStep2Valid = attendees.every(
    (att) => att.name.trim() !== "" && Number(att.age) > 0
  );

  const canProceed =
    step === 1 ? isStep1Valid : step === 2 ? isStep2Valid : true;

  /* ---------- Handlers ---------- */
  const handleCountChange = (value: number) => {
    const newCount = Math.max(1, Math.min(10, value));
    setCount(newCount);

    setAttendees((prev) => {
      const updated = [...prev];
      if (newCount > prev.length) {
        for (let i = prev.length; i < newCount; i++) {
          updated.push({ name: "", age: "" });
        }
      } else {
        updated.length = newCount;
      }
      return updated;
    });
  };

  const handleAttendeeChange = (
    index: number,
    field: keyof Attendee,
    value: string
  ) => {
    const updated = [...attendees];
    updated[index] = { ...updated[index], [field]: value };
    setAttendees(updated);
  };

  const handleSubmit = async () => {
    if (!isStep1Valid || !isStep2Valid) return;

    setLoading(true);

    try {
      const res = await fetch("/api/events/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          email,
          phone,
          attendees,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // FREE EVENT
      if (data.type === "FREE") {
        router.push(`/success/${data.bookingId}`);
        return;
      }

      // PAID EVENT
      router.push(`/payment/${data.bookingId}`);
    } catch (error) {
      alert("Network error. Please try again.");
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="h-screen bg-black flex items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-2xl h-full max-h-[95vh] flex flex-col py-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors duration-200 group flex-shrink-0"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Event</span>
        </button>

        {/* Main Card */}
        <div className="bg-zinc-950 flex-1 overflow-y-auto p-6 md:p-8 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col">
          {/* Progress Indicator */}
          <div className="mb-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 text-sm ${
                    step >= 1
                      ? "bg-zinc-100 text-black"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {step > 1 ? <CheckCircle2 size={16} /> : "1"}
                </div>
                <span
                  className={`font-medium text-sm ${
                    step >= 1 ? "text-zinc-100" : "text-zinc-600"
                  }`}
                >
                  Contact
                </span>
              </div>

              <div className="flex-1 h-0.5 mx-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-zinc-100 transition-all duration-500 ${
                    step >= 2 ? "w-full" : "w-0"
                  }`}
                />
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 text-sm ${
                    step >= 2
                      ? "bg-zinc-100 text-black"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {step > 2 ? <CheckCircle2 size={16} /> : "2"}
                </div>
                <span
                  className={`font-medium text-sm ${
                    step >= 2 ? "text-zinc-100" : "text-zinc-600"
                  }`}
                >
                  Attendees
                </span>
              </div>
            </div>
          </div>

          {/* STEP 1: Contact Info */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300 flex-1 overflow-y-auto">
              <div className="flex-shrink-0">
                <h2 className="text-xl font-bold text-zinc-100 mb-1 flex items-center gap-2">
                  <Ticket size={20} />
                  Contact Information
                </h2>
                <p className="text-zinc-500 text-sm">
                  We'll send your booking confirmation here
                </p>
              </div>

              {/* Ticket Count */}
              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Number of Tickets
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCountChange(count - 1)}
                    disabled={count <= 1}
                    className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-zinc-100 transition-all duration-200"
                  >
                    <Minus size={18} />
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-3xl font-bold text-zinc-100">{count}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {count === 1 ? "ticket" : "tickets"}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCountChange(count + 1)}
                    disabled={count >= 10}
                    className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-zinc-100 transition-all duration-200"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                    size={18}
                  />
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-100 focus:border-zinc-100 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                    size={18}
                  />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-100 focus:border-zinc-100 transition-all duration-200"
                  />
                </div>
              </div>

              {!isStep1Valid && (email || phone) && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-400 text-xs">
                    Please enter a valid email address and phone number
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Attendees */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300 flex-1 overflow-y-auto">
              <div className="flex-shrink-0">
                <h2 className="text-xl font-bold text-zinc-100 mb-1 flex items-center gap-2">
                  <Users size={20} />
                  Attendee Details
                </h2>
                <p className="text-zinc-500 text-sm">
                  Tell us who's coming to the event
                </p>
              </div>

              <div className="space-y-3">
                {attendees.map((a, i) => (
                  <div
                    key={i}
                    className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-2"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                        <span className="text-zinc-400 font-semibold text-xs">
                          {i + 1}
                        </span>
                      </div>
                      <span className="text-zinc-500 text-xs font-medium">
                        Attendee {i + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="md:col-span-2">
                        <div className="relative">
                          <User
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                            size={16}
                          />
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={a.name}
                            onChange={(e) =>
                              handleAttendeeChange(i, "name", e.target.value)
                            }
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-100 focus:border-zinc-100 transition-all duration-200 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="relative">
                          <Calendar
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                            size={16}
                          />
                          <input
                            type="number"
                            placeholder="Age"
                            value={a.age}
                            onChange={(e) =>
                              handleAttendeeChange(i, "age", e.target.value)
                            }
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-100 focus:border-zinc-100 transition-all duration-200 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!isStep2Valid && attendees.some((a) => a.name || a.age) && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-400 text-xs">
                    Please fill in all attendee details with valid names and ages
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Footer */}
          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 disabled:opacity-0 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft size={18} />
              <span className="font-medium text-sm">Back</span>
            </button>

            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-zinc-100 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all duration-200 text-sm"
              >
                <span>Next Step</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canProceed}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-zinc-100 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all duration-200 text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}