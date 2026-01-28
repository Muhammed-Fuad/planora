import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

type JwtPayload = {
  id?: string;
  userId?: string;
  sub?: string;
};

export async function GET() {
  try {
    // 1️⃣ Read cookie (Next.js 15)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // 2️⃣ Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // 3️⃣ Extract userId SAFELY
    const userId =
      decoded.id ??
      decoded.userId ??
      decoded.sub ??
      null;

    // 🔒 HARD VALIDATION
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid token payload" },
        { status: 401 }
      );
    }

    // 4️⃣ Fetch ONLY this user's events
    const events = await prisma.event.findMany({
      where: {
        userId: userId, // ✅ GUARANTEED MATCH
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("MY EVENTS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 401 }
    );
  }
}
