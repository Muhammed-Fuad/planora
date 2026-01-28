import { generateToken, hashPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // ================= VALIDATION =================
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    // ================= CHECK EXISTING USER =================
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // 🔴 IMPORTANT FIX: clear any existing token cookie
      const response = NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );

      response.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0, // 🔥 deletes cookie
        path: "/",
      });

      return response;
    }

    // ================= CREATE USER =================
    const hashedPassword = await hashPassword(password);

    // First registered user becomes ADMIN
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? Role.ADMIN : Role.USER;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // ================= TOKEN =================
    const token = generateToken(user.id);

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // ================= SET COOKIE =================
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;

  } catch (err) {
    console.error("Registration failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
