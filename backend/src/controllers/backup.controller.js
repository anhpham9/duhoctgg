import fs from 'fs';
import { backupService } from '../services/backup.service.js';
import { auditLog, logError } from '../utils/logger.js';
import { SecurityLogger } from '../utils/securityLogger.js';

const MANAGE_BACKUP_ROLES = [1, 2];

const ensureRolePermission = (req, res, permissionCode) => {
    const userRole = Number(req.user?.role_id);
    const userId = req.user?.id;

    if (MANAGE_BACKUP_ROLES.includes(userRole)) {
        return true;
    }

    SecurityLogger.logPermissionViolation(
        userId,
        req.ip,
        req.originalUrl,
        req.method,
        permissionCode
    );

    res.status(403).json({
        success: false,
        message: 'Truy cập bị từ chối. Bạn không có quyền thao tác backup.'
    });

    return false;
};

export const getBackupHistory = async (req, res) => {
    try {
        if (!ensureRolePermission(req, res, 'settings.backup.history')) return;

        const data = await backupService.getBackupHistory();
        return res.json({ success: true, data });
    } catch (error) {
        logError('Get backup history failed', error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
};

export const createManualBackup = async (req, res) => {
    try {
        if (!ensureRolePermission(req, res, 'settings.backup.create')) return;

        const data = await backupService.createBackup({
            type: 'manual',
            userId: req.user?.id
        });

        auditLog('CREATE_BACKUP', req.user?.id, {
            backupId: data.id,
            backupName: data.name,
            backupType: 'manual'
        }, req);

        return res.json({
            success: true,
            message: 'Tạo backup thủ công thành công',
            data
        });
    } catch (error) {
        logError('Create manual backup failed', error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: 'Không thể tạo backup thủ công' });
    }
};

export const uploadBackup = async (req, res) => {
    try {
        if (!ensureRolePermission(req, res, 'settings.backup.upload')) return;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn file backup để upload'
            });
        }

        const data = await backupService.addUploadedBackup({
            file: req.file,
            userId: req.user?.id
        });

        auditLog('UPLOAD_BACKUP', req.user?.id, {
            backupId: data.id,
            backupName: data.name,
            originalName: req.file.originalname
        }, req);

        return res.json({
            success: true,
            message: 'Upload backup thành công',
            data
        });
    } catch (error) {
        logError('Upload backup failed', error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: 'Upload backup thất bại' });
    }
};

export const downloadBackup = async (req, res) => {
    try {
        if (!ensureRolePermission(req, res, 'settings.backup.download')) return;

        const backupId = Number(req.params.id);
        if (!Number.isInteger(backupId) || backupId <= 0) {
            return res.status(400).json({ success: false, message: 'Backup ID không hợp lệ' });
        }

        const record = await backupService.getBackupRecordById(backupId);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy backup' });
        }

        if (!record.file_path || !fs.existsSync(record.file_path)) {
            return res.status(404).json({ success: false, message: 'File backup không tồn tại' });
        }

        auditLog('DOWNLOAD_BACKUP', req.user?.id, {
            backupId: backupId,
            backupName: record.file_name
        }, req);

        return res.download(record.file_path, record.file_name);
    } catch (error) {
        logError('Download backup failed', error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: 'Không thể tải file backup' });
    }
};

export const restoreBackup = async (req, res) => {
    try {
        if (!ensureRolePermission(req, res, 'settings.backup.restore')) return;

        const backupId = Number(req.body?.backupId);
        if (!Number.isInteger(backupId) || backupId <= 0) {
            return res.status(400).json({ success: false, message: 'Backup ID không hợp lệ' });
        }

        const data = await backupService.restoreBackupById(backupId);

        auditLog('RESTORE_BACKUP', req.user?.id, {
            backupId,
            backupName: data.name
        }, req);

        return res.json({
            success: true,
            message: 'Khôi phục dữ liệu thành công',
            data
        });
    } catch (error) {
        logError('Restore backup failed', error, {
            requesterId: req.user?.id,
            backupId: req.body?.backupId
        });

        if (error.message === 'Backup record not found') {
            return res.status(404).json({ success: false, message: 'Không tìm thấy backup' });
        }

        if (error.message === 'Backup file does not exist on server') {
            return res.status(404).json({ success: false, message: 'File backup không tồn tại trên server' });
        }

        if (error.message === 'Invalid backup format') {
            return res.status(400).json({ success: false, message: 'Định dạng backup không hợp lệ hoặc không hỗ trợ restore' });
        }

        return res.status(500).json({ success: false, message: 'Không thể restore backup' });
    }
};

export const getSchedulerHealth = async (req, res) => {
    try {
        if (!ensureRolePermission(req, res, 'settings.backup.scheduler.health')) return;

        const data = await backupService.getSchedulerStatus();
        return res.json({ success: true, data });
    } catch (error) {
        logError('Get scheduler health failed', error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
};

export const getBackupConfig = async (req, res) => {
    try {
        if (!ensureRolePermission(req, res, 'settings.backup.config.view')) return;

        const data = await backupService.getBackupConfig();
        return res.json({ success: true, data });
    } catch (error) {
        logError('Get backup config failed', error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
};

export const updateBackupConfig = async (req, res) => {
    try {
        if (!ensureRolePermission(req, res, 'settings.backup.config.update')) return;

        const data = await backupService.saveBackupConfig(req.body || {});

        auditLog('UPDATE_BACKUP_CONFIG', req.user?.id, {
            enabled: data.enabled,
            runAt: data.runAt,
            frequency: data.frequency,
            retentionCount: data.retentionCount
        }, req);

        return res.json({
            success: true,
            message: 'Đã lưu cấu hình backup tự động',
            data
        });
    } catch (error) {
        logError('Update backup config failed', error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: 'Không thể lưu cấu hình backup tự động' });
    }
};
