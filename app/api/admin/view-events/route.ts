import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: "APPROVED", // 👈 Only fetch approved events
      },
      orderBy: {
        startDateTime: "asc",
      },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        detailedDescription: true, // ✅ Fixed: was longDescription
        startDateTime: true,
        endDateTime: true,
        category: true,
        city: true,
        country: true,
        eventMode: true,
        venueName: true,
        address: true, // ✅ Fixed: was Address (lowercase 'a')
        ticketPrice: true,
        maxAttendees: true,
        supportEmail: true, // ✅ Fixed: was contactEmail
        contactPhone: true,
        OrganizerName: true, // ✅ Fixed: was organizerName (capital 'O')
        createdAt: true,
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Fetch Approved Events Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}