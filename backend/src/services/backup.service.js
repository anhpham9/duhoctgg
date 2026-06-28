import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/db.js';
import { logError, logInfo, logWarn } from '../utils/logger.js';
import { NotificationService } from "./notification.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_DIR = path.resolve(__dirname, '../../backups');

const BACKUP_SETTINGS_KEYS = {
    enabled: 'backup.auto_enabled',
    frequency: 'backup.frequency',
    runAt: 'backup.run_at',
    retentionCount: 'backup.retention_count'
};

const DEFAULT_BACKUP_CONFIG = {
    enabled: true,
    frequency: 'daily',
    runAt: '02:00',
    retentionCount: 30
};

const EXCLUDED_TABLES = new Set(['backup_records']);

let backupSchedulerTimer = null;
let lastAutoBackupDate = null;

const schedulerState = {
    running: false,
    startedAt: null,
    lastRunAt: null,
    lastRunStatus: null,
    lastRunBackupId: null,
    lastRunBackupName: null,
    lastErrorMessage: null,
    totalAutoRuns: 0
};

const isSafeIdentifier = (value) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value);

const quoteIdentifier = (value) => {
    if (!isSafeIdentifier(value)) {
        throw new Error(`Unsafe SQL identifier: ${value}`);
    }
    return `"${value}"`;
};

const normalizeRunAt = (value) => {
    const raw = String(value || '').trim();
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(raw) ? raw : DEFAULT_BACKUP_CONFIG.runAt;
};

const normalizeRetentionCount = (value) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) return DEFAULT_BACKUP_CONFIG.retentionCount;
    return Math.min(Math.max(parsed, 1), 30);
};

const ensureBackupDir = async () => {
    if (!fs.existsSync(BACKUP_DIR)) {
        await fs.promises.mkdir(BACKUP_DIR, { recursive: true });
    }
};

const getPublicTables = async () => {
    const result = await db.query(
        `SELECT table_name
         FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_type = 'BASE TABLE'
         ORDER BY table_name ASC`
    );

    return result.rows
        .map((row) => row.table_name)
        .filter((table) => !EXCLUDED_TABLES.has(table));
};

const getTableRows = async (tableName) => {
    const query = `SELECT * FROM ${quoteIdentifier(tableName)}`;
    const result = await db.query(query);
    return result.rows;
};

const writeBackupFile = async (payload, suggestedName) => {
    await ensureBackupDir();
    const fileName = suggestedName;
    const filePath = path.join(BACKUP_DIR, fileName);
    const fileContent = JSON.stringify(payload);

    await fs.promises.writeFile(filePath, fileContent, 'utf8');
    const stats = await fs.promises.stat(filePath);

    return {
        fileName,
        filePath,
        fileSize: stats.size
    };
};

const formatBackupFileName = (type = 'manual', extension = 'json') => {
    const now = new Date();
    const iso = now.toISOString().replace(/[:.]/g, '-');
    return `backup-${type}-${iso}.${extension}`;
};

const insertBackupRecord = async ({ fileName, filePath, backupType, fileSize, createdBy, status = 'success' }) => {
    const result = await db.query(
        `INSERT INTO backup_records (file_name, file_path, backup_type, status, file_size, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, file_name, file_path, backup_type, status, file_size, created_by, created_at, restored_at`,
        [fileName, filePath, backupType, status, fileSize, createdBy || null]
    );

    return result.rows[0];
};

const getBackupRecordById = async (id) => {
    const result = await db.query(
        `SELECT id, file_name, file_path, backup_type, status, file_size, created_by, created_at, restored_at
         FROM backup_records
         WHERE id = $1
         LIMIT 1`,
        [id]
    );
    return result.rows[0] || null;
};

const getBackupConfig = async () => {
    const keys = Object.values(BACKUP_SETTINGS_KEYS);
    const result = await db.query(
        `SELECT key, value
         FROM settings
         WHERE key = ANY($1::text[])`,
        [keys]
    );

    const data = { ...DEFAULT_BACKUP_CONFIG };

    for (const row of result.rows) {
        if (row.key === BACKUP_SETTINGS_KEYS.enabled) data.enabled = String(row.value) === 'true';
        if (row.key === BACKUP_SETTINGS_KEYS.frequency) data.frequency = String(row.value || 'daily').toLowerCase() === 'daily' ? 'daily' : 'daily';
        if (row.key === BACKUP_SETTINGS_KEYS.runAt) data.runAt = normalizeRunAt(row.value);
        if (row.key === BACKUP_SETTINGS_KEYS.retentionCount) data.retentionCount = normalizeRetentionCount(row.value);
    }

    // Enforce product requirement.
    data.frequency = 'daily';
    data.retentionCount = 30;

    return data;
};

const saveBackupConfig = async (payload = {}) => {
    const config = {
        enabled: Boolean(payload.enabled),
        frequency: 'daily',
        runAt: normalizeRunAt(payload.runAt),
        retentionCount: 30
    };

    const settingsEntries = [
        [BACKUP_SETTINGS_KEYS.enabled, String(config.enabled), 'Backup config: auto backup enabled'],
        [BACKUP_SETTINGS_KEYS.frequency, config.frequency, 'Backup config: schedule frequency'],
        [BACKUP_SETTINGS_KEYS.runAt, config.runAt, 'Backup config: daily run time'],
        [BACKUP_SETTINGS_KEYS.retentionCount, String(config.retentionCount), 'Backup config: retention count']
    ];

    const placeholders = settingsEntries.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`).join(',');
    const values = settingsEntries.flatMap(([key, value, description]) => [key, value, description, 'general']);

    await db.query(
        `INSERT INTO settings (key, value, description, group_name)
         VALUES ${placeholders}
         ON CONFLICT (key)
         DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description, group_name = EXCLUDED.group_name`,
        values
    );

    return config;
};

const cleanupOldBackups = async (retentionCount = 30) => {
    const keepCount = Math.min(Math.max(Number(retentionCount) || 30, 1), 30);
    const result = await db.query(
        `SELECT id, file_path
         FROM backup_records
         ORDER BY created_at DESC
         OFFSET $1`,
        [keepCount]
    );

    for (const row of result.rows) {
        try {
            if (row.file_path && fs.existsSync(row.file_path)) {
                await fs.promises.unlink(row.file_path);
            }
        } catch (error) {
            logWarn('Failed to delete old backup file', {
                backupId: row.id,
                filePath: row.file_path,
                error: error.message
            });
        }
    }

    if (result.rows.length > 0) {
        await db.query(
            `DELETE FROM backup_records
             WHERE id = ANY($1::bigint[])`,
            [result.rows.map((row) => row.id)]
        );
    }

    return result.rows.length;
};

const createBackup = async ({ type = 'manual', userId = null } = {}) => {
    const backupType = ['manual', 'auto', 'upload'].includes(type) ? type : 'manual';
    const tables = await getPublicTables();

    const tableData = {};
    for (const tableName of tables) {
        tableData[tableName] = await getTableRows(tableName);
    }

    const payload = {
        version: 1,
        createdAt: new Date().toISOString(),
        type: backupType,
        tables: tableData
    };

    const fileName = formatBackupFileName(backupType, 'json');
    const fileInfo = await writeBackupFile(payload, fileName);
    const record = await insertBackupRecord({
        fileName: fileInfo.fileName,
        filePath: fileInfo.filePath,
        backupType,
        fileSize: fileInfo.fileSize,
        createdBy: userId,
        status: 'success'
    });
    

    await cleanupOldBackups(30);

    // 🔔 NOTIFY ADMINS about new backup
    await NotificationService.notifyBackupCompleted(record.file_name, record.file_size, 'success');

    return {
        id: record.id,
        name: record.file_name,
        createdAt: record.created_at,
        size: record.file_size,
        type: record.backup_type,
        status: record.status
    };
};

const addUploadedBackup = async ({ file, userId = null } = {}) => {
    if (!file) {
        throw new Error('Backup file is required');
    }

    await ensureBackupDir();

    const extension = path.extname(file.originalname || '').replace('.', '') || 'bak';
    const fileName = formatBackupFileName('upload', extension);
    const targetPath = path.join(BACKUP_DIR, fileName);

    await fs.promises.writeFile(targetPath, file.buffer);
    const stats = await fs.promises.stat(targetPath);

    const record = await insertBackupRecord({
        fileName,
        filePath: targetPath,
        backupType: 'upload',
        fileSize: stats.size,
        createdBy: userId,
        status: 'success'
    });

    await cleanupOldBackups(30);

    return {
        id: record.id,
        name: record.file_name,
        createdAt: record.created_at,
        size: record.file_size,
        type: record.backup_type,
        status: record.status
    };
};

const getBackupHistory = async () => {
    const result = await db.query(
        `SELECT id, file_name, backup_type, status, file_size, created_at, restored_at
         FROM backup_records
         ORDER BY created_at DESC
         LIMIT 200`
    );

    return result.rows.map((row) => ({
        id: row.id,
        name: row.file_name,
        type: row.backup_type,
        status: row.status,
        size: Number(row.file_size || 0),
        createdAt: row.created_at,
        restoredAt: row.restored_at
    }));
};

const parseBackupFile = async (filePath) => {
    const content = await fs.promises.readFile(filePath, 'utf8');
    const parsed = JSON.parse(content);

    if (!parsed || typeof parsed !== 'object' || typeof parsed.tables !== 'object') {
        throw new Error('Invalid backup format');
    }

    return parsed;
};

const insertRows = async (executor, tableName, rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
        return;
    }

    const columns = Object.keys(rows[0]);
    if (columns.length === 0) {
        return;
    }

    const quotedColumns = columns.map((column) => quoteIdentifier(column)).join(', ');

    for (const row of rows) {
        const values = columns.map((column) => row[column]);
        const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
        const query = `INSERT INTO ${quoteIdentifier(tableName)} (${quotedColumns}) VALUES (${placeholders})`;
        await executor.query(query, values);
    }
};

    const truncateTables = async (executor, tableNames) => {
    if (!Array.isArray(tableNames) || tableNames.length === 0) {
        return;
    }

    const quoted = tableNames.map((name) => quoteIdentifier(name)).join(', ');
    await executor.query(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
};

const restoreBackupById = async (backupId) => {
    const record = await getBackupRecordById(backupId);
    if (!record) {
        throw new Error('Backup record not found');
    }

    if (!record.file_path || !fs.existsSync(record.file_path)) {
        throw new Error('Backup file does not exist on server');
    }

    const payload = await parseBackupFile(record.file_path);
    const tables = Object.keys(payload.tables || {}).filter((tableName) => !EXCLUDED_TABLES.has(tableName));

    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        await truncateTables(client, tables);

        for (const tableName of tables) {
            await insertRows(client, tableName, payload.tables[tableName]);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    await db.query(
        `UPDATE backup_records
         SET restored_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [backupId]
    );

    return {
        id: record.id,
        name: record.file_name,
        restoredAt: new Date().toISOString()
    };
};

const startBackupScheduler = () => {
    if (backupSchedulerTimer) {
        return;
    }

    backupSchedulerTimer = setInterval(async () => {
        try {
            const config = await getBackupConfig();
            if (!config.enabled || config.frequency !== 'daily') {
                return;
            }

            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const dateKey = now.toISOString().slice(0, 10);

            if (currentTime !== config.runAt) {
                return;
            }

            if (lastAutoBackupDate === dateKey) {
                return;
            }

            lastAutoBackupDate = dateKey;
            const result = await createBackup({ type: 'auto', userId: null });

            schedulerState.lastRunAt = new Date().toISOString();
            schedulerState.lastRunStatus = 'success';
            schedulerState.lastRunBackupId = result.id;
            schedulerState.lastRunBackupName = result.name;
            schedulerState.lastErrorMessage = null;
            schedulerState.totalAutoRuns += 1;

            logInfo('Auto backup created by scheduler', {
                runAt: config.runAt,
                date: dateKey,
                backupId: result.id
            });
        } catch (error) {
            schedulerState.lastRunAt = new Date().toISOString();
            schedulerState.lastRunStatus = 'failed';
            schedulerState.lastErrorMessage = error.message || 'Unknown error';
            logError('Auto backup scheduler failed', error);
        }
    }, 60 * 1000);

    schedulerState.running = true;
    schedulerState.startedAt = new Date().toISOString();
    logInfo('Backup scheduler started', { interval: '60s' });
};

const stopBackupScheduler = () => {
    if (backupSchedulerTimer) {
        clearInterval(backupSchedulerTimer);
        backupSchedulerTimer = null;
        schedulerState.running = false;
    }
};

const getSchedulerStatus = async () => {
    const config = await getBackupConfig();

    const now = new Date();
    let nextRunAt = null;
    if (config.enabled && config.runAt) {
        const [hour, minute] = config.runAt.split(':').map(Number);
        const next = new Date(now);
        next.setHours(hour, minute, 0, 0);
        if (next <= now) {
            next.setDate(next.getDate() + 1);
        }
        nextRunAt = next.toISOString();
    }

    return {
        schedulerRunning: schedulerState.running,
        startedAt: schedulerState.startedAt,
        lastRunAt: schedulerState.lastRunAt,
        lastRunStatus: schedulerState.lastRunStatus,
        lastRunBackupId: schedulerState.lastRunBackupId,
        lastRunBackupName: schedulerState.lastRunBackupName,
        lastErrorMessage: schedulerState.lastErrorMessage,
        totalAutoRuns: schedulerState.totalAutoRuns,
        config: {
            enabled: config.enabled,
            frequency: config.frequency,
            runAt: config.runAt,
            retentionCount: config.retentionCount
        },
        nextRunAt
    };
};

export const backupService = {
    getBackupConfig,
    saveBackupConfig,
    createBackup,
    getBackupHistory,
    addUploadedBackup,
    getBackupRecordById,
    restoreBackupById,
    cleanupOldBackups,
    getSchedulerStatus,
    startBackupScheduler,
    stopBackupScheduler
};
