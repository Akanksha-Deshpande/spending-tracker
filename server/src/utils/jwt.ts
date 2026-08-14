import jwt from "jsonwebtoken";

interface JwtPayload{
    userId: string;
}

// process.env values are possibly undefined; assert string for TypeScript after runtime check
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

export function createToken(userId: string): string {
    // JWT_SECRET is guaranteed to be defined at this point
    return jwt.sign({ userId }, JWT_SECRET as string, { expiresIn: "1h" });
}

export function verifyToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, JWT_SECRET as string);

     

    if(typeof decoded === "string" ){
        throw new Error("Invalid token payload");
    }

    if(typeof decoded.userId !== "string" ){
        throw new Error("Invalid token payload");
    }

    return {
        userId: decoded.userId
    }
}