import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: "PENDING", // 👈 PUBLIC ONLY
      },
      orderBy: {
        startDateTime: "asc",
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

      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Public Events Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
