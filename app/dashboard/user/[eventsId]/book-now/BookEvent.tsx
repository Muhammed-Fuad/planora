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
    const newCount = Math.max(1, value);
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

    const res = await fetch("/api/events/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId, // ✅ SAFE & DEFINED
        email,
        phone,
        attendees,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
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
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-slate-900 p-8 rounded-2xl border border-white/10">

        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white"
        >
          <ArrowLeft size={18} /> Back
        </button>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Ticket /> Contact Info
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <button onClick={() => handleCountChange(count - 1)}>-</button>
                <span className="text-white text-xl">{count}</span>
                <button onClick={() => handleCountChange(count + 1)}>+</button>
              </div>

              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded bg-slate-800 text-white"
              />

              <input
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded bg-slate-800 text-white"
              />
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users /> Attendees
            </h2>

            {attendees.map((a, i) => (
              <div key={i} className="mb-3 flex gap-2">
                <input
                  placeholder="Name"
                  value={a.name}
                  onChange={(e) =>
                    handleAttendeeChange(i, "name", e.target.value)
                  }
                  className="flex-1 p-3 rounded bg-slate-800 text-white"
                />
                <input
                  placeholder="Age"
                  value={a.age}
                  onChange={(e) =>
                    handleAttendeeChange(i, "age", e.target.value)
                  }
                  className="w-20 p-3 rounded bg-slate-800 text-white"
                />
              </div>
            ))}

            {!isStep2Valid && (
              <p className="text-amber-400 text-sm mt-2 flex items-center gap-2">
                <AlertCircle size={14} />
                Fill all attendee details
              </p>
            )}
          </>
        )}

        {/* FOOTER */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="text-slate-400"
          >
            <ChevronLeft /> Back
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className="bg-white text-black px-6 py-2 rounded"
            >
              Next <ChevronRight />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-2 rounded"
            >
              {loading ? "Processing..." : "Confirm & Pay"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
