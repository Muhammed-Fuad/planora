import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET(req: Request) {
  try {
    console.log("📥 Payment info request received");
    
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");

    console.log("  - Booking ID:", bookingId);

    if (!bookingId) {
      console.log("❌ No booking ID provided");
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    console.log("  → Fetching booking from database...");

    // Fetch booking with event details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: {
          select: {
            title: true,           // ✅ Changed from 'name' to 'title'
            ticketUrl: true,       // UPI ID from event
            ticketPrice: true,
            ticketType: true,
          },
        },
      },
    });

    console.log("  → Booking found:", booking ? "YES" : "NO");

    if (!booking) {
      console.log("❌ Booking not found in database");
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    console.log("  - Booking status:", booking.status);
    console.log("  - Total amount:", booking.totalAmount);
    console.log("  - Event title:", booking.event.title);  // ✅ Changed from 'name' to 'title'
    console.log("  - UPI ID:", booking.event.ticketUrl);

    // Check if booking is already paid
    if (booking.status === "PAID") {
      console.log("❌ Booking already paid");
      return NextResponse.json(
        { error: "This booking has already been paid" },
        { status: 400 }
      );
    }

    // Check if this is a free event (shouldn't reach payment page)
    if (booking.totalAmount === 0) {
      console.log("❌ Free event - no payment needed");
      return NextResponse.json(
        { error: "This is a free event, no payment required" },
        { status: 400 }
      );
    }

    console.log("✅ Payment info returned successfully");

    // Return payment information
    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      eventName: booking.event.title,  // ✅ Changed from 'name' to 'title'
      ticketUrl: booking.event.ticketUrl || "", // UPI ID
      amount: booking.totalAmount,
      status: booking.status,
    });

  } catch (error: any) {
    console.error("❌ Payment info error:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);

    return NextResponse.json(
      { 
        error: "Failed to fetch payment information",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}