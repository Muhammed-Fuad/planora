import { generateToken, hashPassword, verifyPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@prisma/client";

import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        //validate
        if ( !email || !password) {
            return NextResponse.json({
                error: "Email & password are required or not valid",
            },
            { status: 400}
            );  
        }

        //find existg user
        const userFromDb = await prisma.user.findUnique({
            where: { email },
        })

        if(!userFromDb) {
            return NextResponse.json({
                error: "Invalid credentials",
            },
            {status:401})
        }

        const isValidPassword = await verifyPassword(password, userFromDb.password);

        if(!isValidPassword) {
            return NextResponse.json(
                {
                    error: "Invalid credentials",
                },
                { status: 401}
            );
        }

        //generate token

        const token = generateToken(userFromDb.id)

        //create response
        const response = NextResponse.json({
            user: {
                id: userFromDb.id,
                email: userFromDb.email,
                name: userFromDb.name,
                role: userFromDb.role,
                token,
            }
        });

        //set cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60*60*24*7,
        })

        return response;

    } catch (error) {
        console.error("Login failed");
        return NextResponse.json({
            error: "Internal server error, Something went wrong!",
        },{status:500})
    }
}