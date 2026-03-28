import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: "PENDING", // 👈 Only fetch pending bookings
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
            ticketPrice: true,
          },
        },
        attendees: {
          select: {
            id: true,
            name: true,
            age: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Fetch Pending Bookings Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");
    const action = searchParams.get("action"); // "accept" or "reject"

    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 }
      );
    }

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { message: "Valid action (accept or reject) is required" },
        { status: 400 }
      );
    }

    // Update booking status based on action
    const newStatus = action === "accept" ? "PAID" : "CANCELLED";

    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: newStatus,
      },
    });

    return NextResponse.json(
      { 
        message: `Booking ${action}ed successfully`,
        booking: updatedBooking 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Booking Status Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}