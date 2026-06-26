import express from "express";

import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification
} from "../controllers/notifications.controller.js";

const router = express.Router();

// Example: GET /api/notifications
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/:id/read", markAsRead);
router.put("/:id/unread", markAsUnread);
router.put("/read-all", markAllAsRead);
router.delete("/:id", deleteNotification);

export default router;
