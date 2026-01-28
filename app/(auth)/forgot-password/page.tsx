"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Reset link sent →", email);
    // connect API later
  };

  return (
    <div className="center" style={{ minHeight: "80vh" }}>
      <div className="card" style={{ width: "100%", maxWidth: "420px" }}>
        <h2 className="text-center">Forgot Password</h2>
        <p className="text-muted text-center">We’ll send a reset link</p>

        <form onSubmit={submit} style={{ marginTop: "1rem" }}>
          <div style={{ marginBottom: ".8rem" }}>
            <label className="small text-muted">Email</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button className="btn btn-primary w-full" type="submit">
            Send Reset Link
          </button>
        </form>

        <p className="small text-center" style={{ marginTop: "1rem" }}>
          Back to <Link href="/auth/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
