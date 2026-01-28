import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@/app/types";
import { Prisma } from "@prisma/client";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if(!user){
            return NextResponse.json(
                {
                    error: "not a user",
                },
                {status:401}
            );
        }
        const searchParams = request.nextUrl.searchParams;
        const role = searchParams.get("role");

        //build where clause based on user role

        const where: Prisma.UserWhereInput = {};
        if(user.role === Role.ADMIN) {
            //see all user
        } else if(user.role === Role.ORGANIZER) {
            //users only in their event
            
        }
        else {
            //regular user
            where.id = user.id;
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            },
            orderBy: { createdAt: "desc"},
        })
        return NextResponse.json({users});
    } catch (error) {
        console.error("error :", error);
        return NextResponse.json({
            error: "internal server error"
        },
        {status:500}
        )
        
    }
}