"use client";

import { use, useEffect, useState } from "react";
import QRCode from "qrcode";
import { ArrowLeft, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  // ✅ Unwrap the params Promise using React.use()
  const { bookingId } = use(params);
  const router = useRouter();

  const [qr, setQr] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [eventName, setEventName] = useState<string>("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* 1️⃣ Fetch booking + event payment info */
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        const res = await fetch(`/api/events/payment/info?bookingId=${bookingId}`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch payment info");
        }

        const data = await res.json();

        setUpiId(data.ticketUrl || ""); // UPI ID from database
        setAmount(data.amount || 0);
        setEventName(data.eventName || "");

        // Generate QR code from UPI URL
        if (data.ticketUrl) {
          // Create UPI payment URL
          const upiUrl = `upi://pay?pa=${data.ticketUrl}&pn=Event Booking&am=${data.amount}&cu=INR&tn=Booking ${bookingId}`;
          const qrCode = await QRCode.toDataURL(upiUrl);
          setQr(qrCode);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load payment information");
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [bookingId]);

  /* Handle screenshot selection */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError("");
    }
  };

  /* 2️⃣ Submit payment proof */
  const handleSubmit = async () => {
    if (!screenshot) {
      setError("Please upload payment screenshot");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("bookingId", bookingId);
      formData.append("proofImage", screenshot);

      const res = await fetch("/api/events/payment/submit-proof", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        router.push("/success/${data.bookingId}")
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit payment proof");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-400 text-sm">Loading payment details...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-5xl h-full max-h-[95vh] flex flex-col py-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-3 flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors duration-200 group flex-shrink-0"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back</span>
        </button>

        {/* Main Card */}
        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-2xl flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="mb-4 flex-shrink-0">
            <h1 className="text-2xl font-bold text-zinc-100 mb-1">
              Complete Payment
            </h1>
            <p className="text-zinc-500 text-sm">{eventName}</p>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6 flex-1 overflow-hidden">
            {/* Left Column - QR Code & Amount */}
            <div className="space-y-4 overflow-y-auto">
              {/* Amount Display */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <p className="text-zinc-500 text-xs mb-1">Total Amount</p>
                <p className="text-4xl font-bold text-zinc-100 mb-0.5">₹{amount.toFixed(2)}</p>
                <p className="text-zinc-600 text-xs">INR</p>
              </div>

              {/* QR Code Section */}
              {qr && upiId && (
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                  <div className="mb-3">
                    <h3 className="text-zinc-300 font-semibold text-sm mb-0.5">Scan to Pay</h3>
                    <p className="text-zinc-500 text-xs">
                      Use any UPI app to complete payment
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl mb-3">
                    <img
                      src={qr}
                      alt="Payment QR Code"
                      className="w-full h-auto max-w-[200px] mx-auto"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">UPI ID</p>
                    <div className="flex items-center gap-2">
                      <p className="text-zinc-100 text-sm font-mono bg-zinc-800 px-3 py-2 rounded-lg flex-1 truncate">
                        {upiId}
                      </p>
                      <button
                        onClick={() => navigator.clipboard.writeText(upiId)}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 text-xs transition-colors flex-shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Supported Apps */}
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-zinc-500 text-xs mb-2">Supported Apps</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                        <span
                          key={app}
                          className="px-2 py-1 bg-zinc-800 rounded text-zinc-400 text-xs"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Screenshot Upload */}
            <div className="overflow-y-auto">
              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 h-full">
                <div className="mb-4">
                  <h3 className="text-zinc-300 font-semibold text-sm mb-0.5">Upload Payment Proof</h3>
                  <p className="text-zinc-500 text-xs">
                    Submit screenshot after payment
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Upload Area */}
                  {!previewUrl ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-700 rounded-xl hover:border-zinc-600 cursor-pointer transition-colors bg-zinc-900/50 hover:bg-zinc-900"
                      >
                        <Upload size={32} className="text-zinc-600 mb-3" />
                        <p className="text-zinc-400 font-medium text-sm mb-0.5">
                          Choose payment screenshot
                        </p>
                        <p className="text-zinc-600 text-xs">
                          PNG, JPG up to 10MB
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Screenshot preview"
                        className="w-full h-64 object-cover rounded-xl border border-zinc-800"
                      />
                      <button
                        onClick={() => {
                          setScreenshot(null);
                          setPreviewUrl("");
                          URL.revokeObjectURL(previewUrl);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600 transition-colors text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-red-400 text-xs">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !screenshot}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-100 text-black py-2.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all duration-200 text-sm"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Submit for Verification</span>
                      </>
                    )}
                  </button>

                  {/* Info Notes */}
                  <div className="space-y-1.5 pt-3 border-t border-zinc-800">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-zinc-600">
                        Verified within 24 hours
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-zinc-600">
                        Confirmation via email
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-zinc-600">
                        Show transaction details clearly
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
