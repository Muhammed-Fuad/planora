import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";
import { EventMode, TicketType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    /* ========== AUTH ========== */
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    /* ========== REQUIRED FIELD VALIDATION ========== */
    const requiredFields = [
      "title",
      "OrganizerName",
      "shortDescription",
      "category",
      "startDateTime",
      "endDateTime",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    if (!body.termsAccepted) {
      return NextResponse.json(
        { message: "You must accept terms and conditions" },
        { status: 400 }
      );
    }

    /* ========== DATE VALIDATION ========== */
    const start = new Date(body.startDateTime);
    const end = new Date(body.endDateTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { message: "End date must be after start date" },
        { status: 400 }
      );
    }

    if (start < new Date()) {
      return NextResponse.json(
        { message: "Event cannot be in the past" },
        { status: 400 }
      );
    }

    /* ========== ENUM SAFETY ========== */
    const eventMode: EventMode = Object.values(EventMode).includes(
      body.eventMode?.toUpperCase()
    )
      ? body.eventMode.toUpperCase()
      : EventMode.OFFLINE;

    const ticketType: TicketType = Object.values(TicketType).includes(
      body.ticketType?.toUpperCase()
    )
      ? body.ticketType.toUpperCase()
      : TicketType.FREE;

    /* ========== CREATE EVENT ========== */
    const event = await prisma.event.create({
      data: {
        userId: user.id,

        title: body.title.trim(),
        OrganizerName: body.OrganizerName.trim(),

        shortDescription: body.shortDescription.trim(),
        detailedDescription: body.detailedDescription || "",

        category: body.category,
        tags: body.tags
          ? body.tags.split(",").map((t: string) => t.trim())
          : [],

        startDateTime: start,
        endDateTime: end,
        timezone: body.timezone || "Asia/Kolkata",

        eventMode,
        ticketType,

        venueName: body.venueName || "",
        address: body.address || "",
        city: body.city || "",
        state: body.state || "",
        country: body.country || "India",
        mapsLink: body.mapsLink || "",

        platform: body.platform || null,
        eventLink: body.eventLink || null,

        banner: body.banner || "",
        gallery: body.gallery || [],
        promoVideoUrl: body.promoVideoUrl || "",

        ticketPrice:
          ticketType === TicketType.PAID
            ? Number(body.ticketPrice)
            : null,

        currency: body.currency || null,

        registrationDeadline: body.registrationDeadline
          ? new Date(body.registrationDeadline)
          : null,

        ticketUrl: body.ticketUrl || null,

        maxAttendees: body.maxAttendees
          ? Number(body.maxAttendees)
          : null,

        ageRestriction: body.ageRestriction || "",
        dressCode: body.dressCode || "",
        specialInstructions: body.specialInstructions || "",

        contactPhone: body.contactPhone || "",
        supportEmail: body.supportEmail || "",
        website: body.website || "",
        socialMedia: body.socialMedia || "",
      },
    });

    /* ========== RESPONSE ========== */
    return NextResponse.json(
      {
        message: "Event submitted for review",
        eventId: event.id,
        status: event.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Event Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
