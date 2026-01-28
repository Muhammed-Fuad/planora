import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Role, User } from "@prisma/client";
import { prisma } from "./db";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string): string => {
    return jwt.sign({userId}, JWT_SECRET, {expiresIn: "7d"}); 
}

export const verifyToken = (token: string): { userId: string } => {
    return jwt.verify(token, JWT_SECRET) as { userId: string }; 
};

export const getCurrentUser = async (): Promise<User | null> => {
    try{
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if(!token) return null;
        const decode = verifyToken(token);

        const userFromDb = await prisma.user.findUnique({
            where: { id: decode.userId},
        });
        if(!userFromDb) return null;
        const { password, ...user } = userFromDb;
        return user as User;
    } catch(error) {
        console.error("Error :", error);
        return null;

    }
};

export const checkUserPermission = (
    user: User,
    requiredRole: Role
): boolean => {
    const roleHoerarchy = {
        [Role.GUEST]: 0,
        [Role.USER]: 1,
        [Role.ADMIN]: 2,
    };
    return roleHoerarchy[user.role] >= roleHoerarchy[requiredRole];
};