import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export function authenticate(req: Request, res: Response, next: NextFunction) {

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({ message: "Invalid authorization header" });
        }

        const { userId } = verifyToken(token);

        req.user = { userId }; // Attach user info to the request object

        next();
    }
    catch (error) {
        
        return res.status(401).json({ message: "Invalid or expired token" });
    }

}