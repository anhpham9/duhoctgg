import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Token required" });
        }

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        const token = authHeader.split(" ")[1];

        const user = verifyToken(token);

        req.user = user;

        next();
    } catch (err) {
        console.error("Auth error:", err.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};