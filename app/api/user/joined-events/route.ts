// app/api/user/joined-events/route.ts
import { getCurrentUser } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    // ✅ Get current user using your existing auth function
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "You are not authenticated" },
        { status: 401 }
      );
    }

    // Fetch all bookings for this user using userId
    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id, // ✅ Direct user relationship
        status: {
          in: ['PENDING', 'PAID'] // Exclude CANCELLED bookings
        }
      },
      include: {
        event: {
          include: {
            _count: {
              select: {
                bookings: {
                  where: {
                    status: {
                      in: ['PENDING', 'PAID']
                    }
                  }
                }
              }
            }
          }
        },
        attendees: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match frontend interface
    const formattedEvents = bookings.map(booking => {
      const event = booking.event;
      const eventDate = new Date(event.startDateTime);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      // Determine status
      let status: 'upcoming' | 'past' | 'cancelled';
      if (booking.status === 'CANCELLED') {
        status = 'cancelled';
      } else if (eventDate >= now) {
        status = 'upcoming';
      } else {
        status = 'past';
      }

      // Determine location based on event mode
      let location = '';
      if (event.eventMode === 'OFFLINE') {
        location = event.venueName 
          ? `${event.venueName}, ${event.city || ''}, ${event.state || ''}`.trim()
          : event.address || 'Venue TBA';
      } else if (event.eventMode === 'ONLINE') {
        location = event.platform || 'Online Event';
      } else { // HYBRID
        location = event.venueName 
          ? `${event.venueName} & Online`
          : 'Hybrid Event';
      }

      return {
        id: event.id,
        title: event.title,
        description: event.shortDescription || event.detailedDescription?.substring(0, 150) || '',
        date: event.startDateTime.toISOString().split('T')[0],
        time: event.startDateTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        location: location,
        category: event.category,
        attendees: event._count.bookings,
        imageUrl: event.banner || undefined,
        bookedDate: booking.createdAt.toISOString().split('T')[0],
        ticketNumber: booking.id,
        status: status,
        // Additional info
        bookingStatus: booking.status,
        totalAmount: booking.totalAmount,
        numberOfAttendees: booking.attendees.length,
        eventMode: event.eventMode,
        organizerName: event.OrganizerName,
        // Extra fields
        eventLink: event.eventLink,
        mapsLink: event.mapsLink,
        supportEmail: event.supportEmail,
        phone: booking.phone,
        email: booking.email,
      };
    });

    return NextResponse.json(formattedEvents);

  } catch (error) {
    console.error("Error fetching joined events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Cancel a booking
export async function DELETE(request: NextRequest) {
  try {
    // ✅ Get current user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "You are not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID required" },
        { status: 400 }
      );
    }

    // Verify booking belongs to user via userId
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: user.id, // ✅ Check userId instead of email
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update booking status to CANCELLED
    await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: 'CANCELLED'
      }
    });

    // Update event's currentAttendees count
    const attendeeCount = await prisma.attendee.count({
      where: { bookingId: bookingId }
    });

    await prisma.event.update({
      where: { id: booking.eventId },
      data: {
        currentAttendees: {
          decrement: attendeeCount
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Booking cancelled successfully' 
    });

  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}