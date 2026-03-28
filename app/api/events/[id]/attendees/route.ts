import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/events/[id]/attendees
//
// Schema relationship:
//   Event  →  Booking[]  →  Attendee[]
//
// A single Booking holds contact info (email, phone) for the person who made
// the booking, and can include multiple Attendees (name, age) under it.
//
// This endpoint flattens everything so the frontend gets one row per attendee:
//   { id, name, age, email, phone, bookingId, bookingStatus, totalAmount, registeredAt }
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params — required in Next.js 15+
    const { id } = await params;

    // Validate the event ID
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Make sure the event actually exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Fetch all bookings for this event, including their attendees
    const bookings = await prisma.booking.findMany({
      where: {
        eventId: id,
      },
      include: {
        attendees: true,  // Attendee[] under each Booking
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Flatten: one row per Attendee, carrying the parent Booking's contact info
    //
    // Example: Booking A (email, phone) has 2 attendees → 2 rows in the output,
    // both sharing the same email/phone from the booking.
    const attendees = bookings.flatMap((booking) =>
      booking.attendees.map((attendee) => ({
        // Attendee-level fields (from Attendee table)
        id:            attendee.id,
        name:          attendee.name,
        age:           attendee.age,
        // Booking-level contact fields (from Booking table)
        email:         booking.email,
        phone:         booking.phone,
        // Booking meta
        bookingId:     booking.id,
        bookingStatus: booking.status,      // PENDING | PAID | CANCELLED
        totalAmount:   booking.totalAmount,
        registeredAt:  booking.createdAt,
      }))
    );

    return NextResponse.json(
      {
        attendees,
        total: attendees.length,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching attendees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/events/[id]/attendees?bookingId=xxx
//
// Removes an entire booking and all its attendees.
// The onDelete: Cascade defined on Attendee.bookingId automatically deletes
// all child Attendee rows when the parent Booking is deleted — no manual
// cleanup needed.
//
// Usage: DELETE /api/events/EVT123/attendees?bookingId=BKG456
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate the event ID
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Read bookingId from query string
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId query parameter is required' },
        { status: 400 }
      );
    }

    // Make sure the booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Make sure the booking belongs to the event in the URL
    if (existingBooking.eventId !== id) {
      return NextResponse.json(
        { error: 'Booking does not belong to this event' },
        { status: 403 }
      );
    }

    // Delete the booking — all Attendees under it are deleted via onDelete: Cascade
    await prisma.booking.delete({
      where: { id: bookingId },
    });

    return NextResponse.json(
      { message: 'Booking and all its attendees removed successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error removing booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}