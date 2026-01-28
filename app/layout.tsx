// app/layout.tsx
import AuthProvider from "@/app/provider/AuthProvider";
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Planora",
  description: "Discover events tailored to you",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
        {/* Removed the <main> wrapper entirely - let each page control its own layout */}
        <AuthProvider>{ children}</AuthProvider>
      </body>
    </html>
  );
}