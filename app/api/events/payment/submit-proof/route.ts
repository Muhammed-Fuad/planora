import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const bookingId = formData.get("bookingId") as string;
    const proofImage = formData.get("proofImage");
    
    // Validation
    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    if (!proofImage || !(proofImage instanceof File)) {
      return NextResponse.json(
        { error: "Payment proof image is required" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(proofImage.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a valid image (JPEG, PNG, WebP)" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (proofImage.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    // Fetch booking to validate
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if already paid
    if (booking.status === "PAID") {
      return NextResponse.json(
        { error: "This booking has already been paid" },
        { status: 400 }
      );
    }

    // Save the image file
    const bytes = await proofImage.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const fileExtension = proofImage.name.split(".").pop() || "jpg";
    const fileName = `payment-proof-${bookingId}-${timestamp}.${fileExtension}`;
    
    // Save to public/uploads/payment-proofs directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "payment-proofs");
    
    // Ensure directory exists
    await mkdir(uploadsDir, { recursive: true });
    
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Update booking with payment proof and status
    const relativePath = `/uploads/payment-proofs/${fileName}`;

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentProof: relativePath,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment proof submitted successfully. Awaiting admin verification.",
      bookingId: updatedBooking.id,
      status: updatedBooking.status,
    });

  } catch (error: any) {
    console.error("❌ Payment proof submission error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to submit payment proof",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}