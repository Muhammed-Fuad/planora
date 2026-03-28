"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard/user"); 
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎉 Booking Successful</h1>
        <p className="text-slate-300">
          You have successfully joined the event.
        </p>
        <p className="text-slate-500 mt-2 text-sm">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}
