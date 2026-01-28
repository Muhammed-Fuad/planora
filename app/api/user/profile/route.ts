import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Since getCurrentUser already returns the user without password,
        // we can use it directly or fetch additional fields if needed
        const userProfile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                // Add these fields if they exist in your schema
                // phone: true,
                // avatar: true,
                // interests: true,
            }
        });

        if (!userProfile) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            // phone: userProfile.phone || "",
            joinedDate: userProfile.createdAt.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
            }),
            interests: [], // Add userProfile.interests if you have this field
            // avatar: userProfile.avatar
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}