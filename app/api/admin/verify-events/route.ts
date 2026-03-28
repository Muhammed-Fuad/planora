import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: "PENDING", // 👈 Only fetch pending events
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        startDateTime: true,
        endDateTime: true,
        category: true,
        city: true,
        country: true,
        banner: true,
        eventMode: true,
        venueName: true,
        ticketPrice: true,
        maxAttendees: true,
        createdAt: true,
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Fetch Pending Events Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("id");
    const action = searchParams.get("action"); // "accept" or "reject"

    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 }
      );
    }

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { message: "Valid action (accept or reject) is required" },
        { status: 400 }
      );
    }

    // Update event status based on action
    const newStatus = action === "accept" ? "APPROVED" : "REJECTED";

    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        status: newStatus,
      },
    });

    return NextResponse.json(
      { 
        message: `Event ${action}ed successfully`,
        event: updatedEvent 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Event Status Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}