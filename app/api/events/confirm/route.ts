import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function POST(req: Request) {
  try {
    const { eventId, email, phone, attendees } = await req.json();

    if (!attendees || attendees.length === 0) {
      return NextResponse.json(
        { error: "No attendees provided" },
        { status: 400 }
      );
    }

    const tickets = attendees.length;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.maxAttendees === null) {
      return NextResponse.json(
        { error: "Event not available" },
        { status: 404 }
      );
    }

    if (event.currentAttendees + tickets > event.maxAttendees) {
      return NextResponse.json(
        { error: "Not enough seats" },
        { status: 400 }
      );
    }

    const ticketPrice =
      event.ticketType === "FREE" || event.ticketPrice === null
        ? 0
        : event.ticketPrice;

    const isFreeEvent = ticketPrice === 0;
    const totalAmount = tickets * ticketPrice;

    const booking = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          eventId,
          email,
          phone,
          totalAmount,
          status: isFreeEvent ? "PAID" : "PENDING",
          expiresAt: isFreeEvent
            ? null
            : new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      await tx.attendee.createMany({
        data: attendees.map((a: any) => ({
          bookingId: booking.id,
          name: a.name,
          age: Number(a.age),
        })),
      });

      // ✅ increment only for FREE events
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

      return booking;
    });

    if (isFreeEvent) {
      return NextResponse.json({
        type: "FREE",
        bookingId: booking.id,
      });
    }

    return NextResponse.json({
      type: "PAID",
      bookingId: booking.id,
      amount: totalAmount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Booking failed" },
      { status: 500 }
    );
  }
}
