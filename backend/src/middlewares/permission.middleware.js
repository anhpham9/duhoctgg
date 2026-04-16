import db from "../config/db.js";

export const checkPermission = (permissionName) => {
    return async (req, res, next) => {
        const userId = req.user.id;

        const result = await db.query(
            `
            SELECT p.name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            JOIN role_permissions rp ON r.id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE u.id = $1 AND p.name = $2
            `,
            [userId, permissionName]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    };
};