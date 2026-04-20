import bcrypt from "bcrypt";
import db from "../config/db.js";
import { generateToken } from "../utils/jwt.js";

export const login = async (req, res) => {
    const { username, password } = req.body;

    const result = await db.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
    );

    if (result.rows.length === 0) {
        return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: "Wrong password" });
    }

    const token = generateToken(user);

    // Set httpOnly cookie for security
    res.cookie('authToken', token, {
        httpOnly: true,        // Prevent XSS access
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
        sameSite: 'strict',    // CSRF protection
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Return user info without password
    const { password: userPassword, ...safeUser } = user;
    
    res.json({ 
        success: true,
        message: "Login successful",
        user: safeUser
        // Don't send token in body for security
    });
};

export const logout = (req, res) => {
    res.clearCookie('authToken');
    res.json({ 
        success: true, 
        message: 'Logged out successfully' 
    });
};

export const getAuthStatus = (req, res) => {
    // This endpoint is protected by authenticate middleware
    // If we reach here, user is authenticated
    const { password, ...safeUser } = req.user;
    
    res.json({
        success: true,
        authenticated: true,
        user: safeUser
    });
};