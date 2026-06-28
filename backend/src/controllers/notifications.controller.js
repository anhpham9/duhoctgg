import db from "../config/db.js";
import { logError, logInfo } from "../utils/logger.js";

// Get user's notifications (paginated, filterable, searchable)
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const type = req.query.type || '';  // Filter by notification type
        const status = req.query.status || '';  // 'read' or 'unread'
        const search = req.query.search || '';  // Search in title and message

        // Build WHERE clause
        let whereConditions = ['user_id = $1'];
        let queryParams = [userId];
        let paramCounter = 2;

        if (type) {
            whereConditions.push(`type = $${paramCounter}`);
            queryParams.push(type);
            paramCounter++;
        }

        if (status === 'read') {
            whereConditions.push('is_read = TRUE');
        } else if (status === 'unread') {
            whereConditions.push('is_read = FALSE');
        }

        if (search) {
            whereConditions.push(`(title ILIKE $${paramCounter} OR message ILIKE $${paramCounter})`);
            queryParams.push(`%${search}%`);
            paramCounter++;
        }

        const whereClause = whereConditions.join(' AND ');

        // Get paginated results
        const result = await db.query(
            `SELECT * FROM notifications 
             WHERE ${whereClause}
             ORDER BY created_at DESC 
             LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`,
            [...queryParams, limit, offset]
        );

        // Get total count
        const countResult = await db.query(
            `SELECT COUNT(*) FROM notifications WHERE ${whereClause}`,
            queryParams
        );

        logInfo('Notifications retrieved', { userId, limit, offset, type, status, search, count: result.rows.length });
        res.json({
            success: true,
            data: result.rows,
            total: parseInt(countResult.rows[0].count),
            page, limit
        });
    } catch (error) {
        logError('Get notifications failed', error, { userId: req.user?.id, page: req.query.page });
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
            [userId]
        );

        logInfo('Unread count retrieved', { userId, unreadCount: parseInt(result.rows[0].count) });
        res.json({
            success: true,
            unread_count: parseInt(result.rows[0].count)
        });
    } catch (error) {
        logError('Get unread count failed', error, { userId: req.user?.id });
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Mark single notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await db.query(
            `UPDATE notifications 
             SET is_read = TRUE 
             WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        logInfo('Notification marked as read', { notificationId: id, userId });
        res.json({ success: true, message: "Marked as read" });
    } catch (error) {
        logError('Mark as read failed', error, { notificationId: req.params.id, userId: req.user?.id });
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Mark single notification as unread
export const markAsUnread = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await db.query(
            `UPDATE notifications 
             SET is_read = FALSE 
             WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        logInfo('Notification marked as unread', { notificationId: id, userId });
        res.json({ success: true, message: "Marked as unread" });
    } catch (error) {
        logError('Mark as unread failed', error, { notificationId: req.params.id, userId: req.user?.id });
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await db.query(
            `UPDATE notifications 
             SET is_read = TRUE 
             WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );

        logInfo('All notifications marked as read', { userId });
        res.json({ success: true, message: "All marked as read" });
    } catch (error) {
        logError('Mark all as read failed', error, { userId: req.user?.id });
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete notification
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await db.query(
            'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        logInfo('Notification deleted', { notificationId: id, userId });
        res.json({ success: true, message: "Deleted" });
    } catch (error) {
        logError('Delete notification failed', error, { notificationId: req.params.id, userId: req.user?.id });
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};