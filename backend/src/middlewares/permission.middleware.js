import db from "../config/db.js";
import { logError, logInfo } from "../utils/logger.js";
import { SecurityLogger } from "../utils/securityLogger.js";

const SETTINGS_KEY = "permissions.modules.v1";
const DEFAULT_MODULE_PERMISSIONS = {
    dashboard: [1, 2, 3, 4, 5],
    users: [1, 2, 3],
    contacts: [1, 2, 3, 5],
    schools: [1, 2, 3],
    news: [1, 2, 3, 4],
    content: [1, 2, 3],
    teamMembers: [1, 2, 3],
    other: [1, 2, 3],
    faqs: [1, 2, 3, 4, 5],
    notifications: [1, 2, 3, 4, 5],
    profile: [1, 2, 3, 4, 5],
    settings: [1, 2],
    permissions: [1, 2]
};

const getModuleAllowedRoles = async (moduleKey) => {
    const fallbackRoles = DEFAULT_MODULE_PERMISSIONS[moduleKey] || [];

    try {
        const result = await db.query(
            `SELECT value
             FROM settings
             WHERE key = $1
             LIMIT 1`,
            [SETTINGS_KEY]
        );

        if (result.rows.length === 0) {
            return fallbackRoles;
        }

        const parsed = JSON.parse(result.rows[0].value || "{}");
        const modules = Array.isArray(parsed.modules) ? parsed.modules : [];
        const matched = modules.find((item) => item?.key === moduleKey);

        if (!matched || !Array.isArray(matched.allowedRoles)) {
            return fallbackRoles;
        }

        const normalized = [...new Set(matched.allowedRoles.map((role) => Number(role)).filter((role) => Number.isInteger(role)))];
        if (!normalized.includes(1)) {
            normalized.push(1);
        }

        return normalized;
    } catch {
        return fallbackRoles;
    }
};

export const checkModuleAccess = (moduleKey) => {
    return async (req, res, next) => {
        try {
            const roleId = Number(req.user?.role_id);
            const userId = req.user?.id;

            if (!roleId || !userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            // Superadmin always keeps full access.
            if (roleId === 1) {
                return next();
            }

            const allowedRoles = await getModuleAllowedRoles(moduleKey);
            if (allowedRoles.includes(roleId)) {
                return next();
            }

            SecurityLogger.logPermissionViolation(
                userId,
                req.ip,
                req.originalUrl,
                req.method,
                `module:${moduleKey}`
            );

            return res.status(403).json({
                success: false,
                message: "Forbidden: insufficient permissions"
            });
        } catch (error) {
            logError("Module permission check failed", error, {
                userId: req.user?.id,
                moduleKey,
                url: req.originalUrl,
                method: req.method
            });

            return res.status(500).json({
                success: false,
                message: "Internal server error during permission check"
            });
        }
    };
};

export const checkPermission = (permissionName) => {
    return async (req, res, next) => {
        try {
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
                // Log security violation
                SecurityLogger.logPermissionViolation(
                    userId,
                    req.ip,
                    req.originalUrl,
                    req.method,
                    permissionName
                );
                
                logError('Permission denied', new Error('Insufficient permissions'), {
                    userId: userId,
                    permission: permissionName,
                    url: req.originalUrl,
                    method: req.method,
                    ip: req.ip
                });
                
                return res.status(403).json({ 
                    success: false,
                    message: "Forbidden - Insufficient permissions" 
                });
            }

            // Log successful permission check for admin operations
            if (permissionName.includes('manage') || permissionName.includes('delete') || permissionName.includes('admin')) {
                logInfo('Permission granted for sensitive operation', {
                    userId: userId,
                    permission: permissionName,
                    url: req.originalUrl,
                    method: req.method
                });
            }

            next();
        } catch (error) {
            logError('Permission check failed', error, {
                userId: req.user?.id,
                permission: permissionName,
                url: req.originalUrl,
                method: req.method
            });
            
            return res.status(500).json({ 
                success: false,
                message: "Internal server error during permission check" 
            });
        }
    };
};