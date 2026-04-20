import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
    try {
        // Check cookie first, then Authorization header (for API testing)
        const token = req.cookies.authToken || 
                      (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") 
                        ? req.headers.authorization.split(" ")[1] 
                        : null);

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Access token is required" 
            });
        }

        const user = verifyToken(token);

        req.user = user;

        next();
    } catch (err) {
        console.error("Auth error:", err.message);
        return res.status(401).json({ 
            success: false,
            message: "Invalid or expired token" 
        });
    }
};