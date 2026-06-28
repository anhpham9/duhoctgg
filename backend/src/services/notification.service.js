import db from "../config/db.js";
import { logError, logInfo } from "../utils/logger.js";

// Role IDs mapping
const ROLES = {
    SUPERADMIN: 1,
    ADMIN: 2,
    EDITOR: 3,
    MANAGER: 4,
    CONSULTANT: 5
};

export class NotificationService {
    /**
     * Create notification cho user cụ thể
     */
    static async notifyUser(userId, type, title, message, data = {}) {
        try {
            const result = await db.query(
                `INSERT INTO notifications (user_id, type, title, message, data, is_read)
                 VALUES ($1, $2, $3, $4, $5, FALSE)
                 RETURNING *`,
                [userId, type, title, message, JSON.stringify(data)]
            );
            logInfo('Notification created for user', { userId, type });
            return result.rows[0];
        } catch (error) {
            logError('Failed to create notification for user', error, { userId, type });
        }
    }

    /**
     * Create notification cho all users với specific role(s)
     */
    static async notifyByRole(roleIds, type, title, message, data = {}) {
        try {
            if (!Array.isArray(roleIds)) roleIds = [roleIds];
            
            // Get all active users with specified roles
            const usersResult = await db.query(
                `SELECT id FROM users 
                 WHERE role_id = ANY($1) AND is_active = TRUE`,
                [roleIds]
            );

            const userIds = usersResult.rows.map(u => u.id);
            
            if (userIds.length === 0) {
                logInfo('No active users found for roles', { roleIds });
                return [];
            }

            // Insert notifications for all users
            const results = [];
            for (const userId of userIds) {
                const result = await this.notifyUser(userId, type, title, message, data);
                results.push(result);
            }

            logInfo('Notifications created for role(s)', { roleIds, count: results.length });
            return results;
        } catch (error) {
            logError('Failed to notify by role', error, { roleIds, type });
        }
    }

    /**
     * Create notifications cho user + specific roles
     * Dùng để notify user bị lock + superadmin
     */
    static async notifyUserAndRoles(userId, roleIds, type, title, message, data = {}) {
        try {
            // Notify user
            await this.notifyUser(userId, type, title, message, data);
            
            // Notify roles
            await this.notifyByRole(roleIds, type, title, message, data);
            
            logInfo('Notification sent to user and roles', { userId, roleIds, type });
        } catch (error) {
            logError('Failed to notify user and roles', error, { userId, roleIds, type });
        }
    }

    /**
     * Tạo thông báo contact submission
     */
    static async notifyContactSubmission(contact) {
        const title = 'Liên hệ mới';
        const message = `${contact.name} (${contact.email}) đã gửi yêu cầu tư vấn`;
        const data = {
            contact_id: contact.id,
            name: contact.name,
            email: contact.email,
            action: 'contacts'
        };

        // Notify: Superadmin (1), Admin (2), Managers (4)
        await this.notifyByRole([ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.MANAGER], 
                                'contact_submission', title, message, data);
    }

    /**
     * Tạo thông báo backup completed
     */
    static async notifyBackupCompleted(backupFile, fileSize, status = 'success') {
        const title = 'Sao lưu hệ thống hoàn tất';
        const message = `Backup file: ${backupFile} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`;
        const data = {
            backup_file: backupFile,
            file_size: fileSize,
            status: status,
            action: 'settings'
        };

        // Notify: Superadmin (1), Admin (2) only
        await this.notifyByRole([ROLES.SUPERADMIN, ROLES.ADMIN], 
                                'backup_completed', title, message, data);
    }

    /**
     * Tạo thông báo account locked
     */
    static async notifyAccountLocked(user) {
        const title = 'Tài khoản bị tạm khóa';
        const message = `Tài khoản ${user.username} bị tạm khóa do sai mật khẩu quá 3 lần. Vui lòng liên hệ quản trị viên để mở khóa.`;
        const data = {
            user_id: user.id,
            username: user.username,
            locked_until: user.locked_until,
            reason: user.locked_reason,
            action: 'profile'
        };

        // Notify: User bị lock + Superadmin (1)
        await this.notifyUserAndRoles(user.id, [ROLES.SUPERADMIN], 
                                      'account_locked', title, message, data);
    }

    /**
     * Tạo thông báo settings changed
     */
    static async notifySettingsChanged(settingKey, oldValue, newValue, changedByUserId) {
        const title = 'Cài đặt được thay đổi';
        const message = `Cài đặt "${settingKey}" được cập nhật`;
        const data = {
            setting_key: settingKey,
            old_value: oldValue,
            new_value: newValue,
            changed_by_user_id: changedByUserId,
            action: 'settings'
        };

        // Notify: Superadmin (1), Admin (2)
        await this.notifyByRole([ROLES.SUPERADMIN, ROLES.ADMIN], 
                                'settings_changed', title, message, data);
    }
}