import { getCurrentUser } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function POST(req: NextRequest) {
  try {
    // ✅ Get current user using your existing auth function
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to book an event" },
        { status: 401 }
      );
    }

    const { eventId, email, phone, attendees } = await req.json();

    // Validate required fields
    if (!eventId || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate attendees
    if (!Array.isArray(attendees) || attendees.length === 0) {
      return NextResponse.json(
        { error: "No attendees provided" },
        { status: 400 }
      );
    }

    // Validate attendee data
    for (const attendee of attendees) {
      if (!attendee.name || !attendee.age) {
        return NextResponse.json(
          { error: "All attendees must have name and age" },
          { status: 400 }
        );
      }
      if (Number(attendee.age) <= 0) {
        return NextResponse.json(
          { error: "Invalid age provided" },
          { status: 400 }
        );
      }
    }

    const tickets = attendees.length;

    // Execute booking transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get event details
      const event = await tx.event.findUnique({
        where: { id: eventId },
      });

      // Check if event exists and has max attendees set
      if (!event) {
        throw new Error("EVENT_NOT_FOUND");
      }

      if (event.maxAttendees === null) {
        throw new Error("EVENT_NOT_AVAILABLE");
      }

      // Check if enough seats are available
      if (event.currentAttendees + tickets > event.maxAttendees) {
        throw new Error("NOT_ENOUGH_SEATS");
      }

      // Calculate pricing
      const ticketPrice =
        event.ticketType === "FREE" || event.ticketPrice === null
          ? 0
          : event.ticketPrice;

      const isFreeEvent = ticketPrice === 0;
      const totalAmount = tickets * ticketPrice;

      // Create booking with userId from authenticated user
      const booking = await tx.booking.create({
        data: {
          userId: user.id, // ✅ Use authenticated user's ID
          eventId,
          email,
          phone,
          totalAmount,
          status: isFreeEvent ? "PAID" : "PENDING",
        },
      });

      // Create attendee records
      await tx.attendee.createMany({
        data: attendees.map((a: any) => ({
          bookingId: booking.id,
          name: a.name.trim(),
          age: Number(a.age),
        })),
      });

      // Increment seats ONLY for FREE events (immediately confirmed)
      // For PAID events, seats will be incremented after successful payment
      if (isFreeEvent) {
        await tx.event.update({
          where: { id: eventId },
          data: {
            currentAttendees: {
              increment: tickets,
            },
          },
        });
      }

      return { booking, isFreeEvent };
    });

    // Return success response
    return NextResponse.json({
      success: true,
      type: result.isFreeEvent ? "FREE" : "PAID",
      bookingId: result.booking.id,
      amount: result.booking.totalAmount,
      message: result.isFreeEvent
        ? "Booking confirmed successfully!"
        : "Booking created. Please complete payment.",
    });
  } catch (error: any) {
    console.error("Booking error:", error);

    // Handle specific errors
    if (error.message === "EVENT_NOT_FOUND") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (error.message === "EVENT_NOT_AVAILABLE") {
      return NextResponse.json(
        { error: "Event is not available for booking" },
        { status: 400 }
      );
    }

    if (error.message === "NOT_ENOUGH_SEATS") {
      return NextResponse.json(
        {
          error:
            "Not enough seats available. Please reduce the number of tickets.",
        },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A booking with this information already exists" },
        { status: 409 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Booking failed. Please try again.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}