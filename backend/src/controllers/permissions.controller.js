import db from "../config/db.js";
import { auditLog, logError, logInfo } from "../utils/logger.js";

const SETTINGS_KEY = "permissions.modules.v1";
const ALL_ROLES = [1, 2, 3, 4, 5];
const MANAGE_PERMISSION_ROLES = [1, 2];
const SETTINGS_GROUP = process.env.PERMISSIONS_SETTINGS_GROUP || "general";

const DEFAULT_MODULES = [
    { key: "dashboard", label: "Dashboard", routePrefix: "/admin", description: "Trang tổng quan", allowedRoles: [1, 2, 3, 4, 5] },
    { key: "users", label: "Người dùng", routePrefix: "/admin/users", description: "Quản lý tài khoản", allowedRoles: [1, 2, 3] },
    { key: "contacts", label: "Liên hệ", routePrefix: "/admin/contacts", description: "Quản lý liên hệ", allowedRoles: [1, 2, 3, 5] },
    { key: "schools", label: "Trường học", routePrefix: "/admin/schools", description: "Quản lý trường học", allowedRoles: [1, 2, 3] },
    { key: "news", label: "Tin tức", routePrefix: "/admin/news", description: "Quản lý tin tức", allowedRoles: [1, 2, 3, 4] },
    { key: "content", label: "Nội dung", routePrefix: "/admin/content", description: "Quản lý nội dung tĩnh", allowedRoles: [1, 2, 3] },
    { key: "teamMembers", label: "Đội ngũ chuyên gia", routePrefix: "/admin/team-members", description: "Quản lý đội ngũ", allowedRoles: [1, 2, 3] },
    { key: "other", label: "Mục khác", routePrefix: "/admin/other", description: "Các trang nội dung bổ sung", allowedRoles: [1, 2, 3] },
    { key: "faqs", label: "FAQ", routePrefix: "/admin/faqs", description: "Quản lý FAQ", allowedRoles: [1, 2, 3, 4, 5] },
    { key: "notifications", label: "Thông báo", routePrefix: "/admin/notifications", description: "Xem thông báo hệ thống", allowedRoles: [1, 2, 3, 4, 5] },
    { key: "profile", label: "Hồ sơ", routePrefix: "/admin/profile", description: "Hồ sơ tài khoản", allowedRoles: [1, 2, 3, 4, 5] },
    { key: "settings", label: "Cài đặt", routePrefix: "/admin/settings", description: "Cấu hình hệ thống", allowedRoles: [1, 2] },
    { key: "permissions", label: "Phân quyền", routePrefix: "/admin/settings/permissions", description: "Quản trị quyền truy cập", allowedRoles: [1, 2] }
];

const uniqueRoleIds = (values = []) => {
    const ids = values.map((item) => Number(item)).filter((item) => ALL_ROLES.includes(item));
    return [...new Set(ids)].sort((a, b) => a - b);
};

const normalizeModulesPayload = (modulesInput = []) => {
    const moduleRoleMap = new Map(
        Array.isArray(modulesInput)
            ? modulesInput.map((item) => [String(item?.key || ""), uniqueRoleIds(item?.allowedRoles || [])])
            : []
    );

    return DEFAULT_MODULES.map((module) => {
        const rolesFromPayload = moduleRoleMap.get(module.key);
        const allowedRoles = rolesFromPayload && rolesFromPayload.length > 0
            ? uniqueRoleIds([1, ...rolesFromPayload])
            : [...module.allowedRoles];

        return {
            ...module,
            allowedRoles
        };
    });
};

const parseStoredModules = (rawValue) => {
    if (!rawValue) return DEFAULT_MODULES.map((module) => ({ ...module }));

    try {
        const parsed = JSON.parse(rawValue);
        const modules = Array.isArray(parsed?.modules) ? parsed.modules : [];
        return normalizeModulesPayload(modules);
    } catch {
        return DEFAULT_MODULES.map((module) => ({ ...module }));
    }
};

const loadModulesConfig = async () => {
    const result = await db.query(
        `SELECT value
         FROM settings
         WHERE key = $1
         LIMIT 1`,
        [SETTINGS_KEY]
    );

    return parseStoredModules(result.rows[0]?.value);
};

const saveModulesConfig = async (modules) => {
    const payload = JSON.stringify({ modules, updatedAt: new Date().toISOString() });

    await db.query(
        `INSERT INTO settings (key, value, description, group_name)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (key)
         DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description, group_name = EXCLUDED.group_name`,
        [
            SETTINGS_KEY,
            payload,
            "Role-based admin modules permissions",
            SETTINGS_GROUP
        ]
    );
};

export const getPermissionsConfig = async (req, res) => {
    try {
        const modules = await loadModulesConfig();

        res.json({
            success: true,
            data: {
                roles: ALL_ROLES,
                modules
            }
        });
    } catch (error) {
        logError("Get permissions config failed", error, { requesterId: req.user?.id });
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updatePermissionsConfig = async (req, res) => {
    try {
        const requesterRoleId = Number(req.user?.role_id);

        if (!MANAGE_PERMISSION_ROLES.includes(requesterRoleId)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You cannot update permissions config."
            });
        }

        const inputModules = req.body?.modules;
        if (!Array.isArray(inputModules)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payload. Expected modules array."
            });
        }

        const normalizedModules = normalizeModulesPayload(inputModules);

        const invalid = normalizedModules.find((module) => module.allowedRoles.length === 0);
        if (invalid) {
            return res.status(400).json({
                success: false,
                message: `Module ${invalid.key} must allow at least one role.`
            });
        }

        await saveModulesConfig(normalizedModules);

        auditLog("UPDATE_PERMISSIONS_CONFIG", req.user?.id, {
            moduleCount: normalizedModules.length
        }, req);

        logInfo("Permissions config updated", {
            updatedBy: req.user?.id,
            roleId: requesterRoleId,
            moduleCount: normalizedModules.length
        });

        res.json({
            success: true,
            message: "Permissions config updated successfully",
            data: {
                roles: ALL_ROLES,
                modules: normalizedModules
            }
        });
    } catch (error) {
        logError("Update permissions config failed", error, { requesterId: req.user?.id });
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};