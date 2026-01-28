"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function PaymentPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const [qr, setQr] = useState<string>("");
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* 1️⃣ Fetch booking + event payment URL */
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      const res = await fetch(`/api/payment/info?bookingId=${params.bookingId}`);
      const data = await res.json();

      setPaymentUrl(data.paymentUrl);
      setAmount(data.amount);

      if (data.paymentUrl) {
        const qrCode = await QRCode.toDataURL(data.paymentUrl);
        setQr(qrCode);
      }
    };

    fetchPaymentInfo();
  }, [params.bookingId]);

  /* 2️⃣ Submit payment proof */
  const handleSubmit = async () => {
    if (!screenshot) {
      setError("Please upload payment completed screenshot");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("bookingId", params.bookingId);
    formData.append("screenshot", screenshot);

    const res = await fetch("/api/payment/submit-proof", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      window.location.href = "/payment/pending";
    } else {
      setError("Failed to submit payment proof");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-[380px] bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold text-center mb-2">
          Complete Payment
        </h1>

        <p className="text-center text-gray-600 mb-4">
          Scan QR & pay using any UPI app
        </p>

        {/* 🔳 AUTO-GENERATED QR */}
        {qr && (
          <img
            src={qr}
            alt="Payment QR"
            className="mx-auto mb-4 border rounded-lg"
          />
        )}

        <div className="text-center text-sm text-gray-700 mb-4">
          <p>
            <b>Amount:</b> ₹{amount}
          </p>
        </div>

        {/* 📸 PAYMENT COMPLETED IMAGE */}
        <label className="block text-sm font-medium mb-1">
          Upload Payment Completed Screenshot
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
          className="w-full border rounded-md p-2 mb-3"
        />

        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}

        {/* 🚀 SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit for Verification"}
        </button>

        <p className="text-xs text-gray-500 text-center mt-3">
          Payment will be verified by the organizer
        </p>
      </div>
    </div>
  );
}
