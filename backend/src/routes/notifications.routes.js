import express from "express";

const router = express.Router();

// Example: GET /api/notifications
router.get("/", (req, res) => {
    res.json({ success: true, message: "Notifications route is working." });
});

// You can add more notification-related routes here

export default router;
