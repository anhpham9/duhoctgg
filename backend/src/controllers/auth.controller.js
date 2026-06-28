import bcrypt from "bcrypt";
import db from "../config/db.js";
import { generateToken } from "../utils/jwt.js";
import { logInfo, logError, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { NotificationService } from "../services/notification.service.js";

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate required fields
        if (!username || !password) {
            logError('Login validation failed', null, {
                stage: 'input_validation',
                reason: 'missing_credentials',
                hasUsername: !!username,
                hasPassword: !!password,
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            auditLog('SECURITY_LOGIN_FAILED', null, {
                event: 'login_failed',
                reason: 'missing_credentials',
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                severity: 'medium'
            }, req);
            return res.status(400).json({ 
                success: false,
                message: "Username and password are required" 
            });
        }

        // Sanitize inputs
        const sanitizedUsername = InputSanitizer.sanitizeText(username, { 
            maxLength: 50 
        });
        
        // Basic username validation (alphanumeric, underscore, dot)
        const usernameRegex = /^[a-zA-Z0-9._]{3,50}$/;
        if (!usernameRegex.test(sanitizedUsername)) {
            logError('Login validation failed', null, {
                stage: 'username_validation',
                reason: 'invalid_format',
                originalUsername: username,
                sanitizedUsername: sanitizedUsername,
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            auditLog('SECURITY_LOGIN_FAILED', null, {
                event: 'login_failed',
                username: sanitizedUsername,
                reason: 'invalid_username_format',
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                severity: 'medium'
            }, req);
            return res.status(400).json({ 
                success: false,
                message: "Invalid username format" 
            });
        }

        const result = await db.query(
            "SELECT * FROM users WHERE username = $1",
            [sanitizedUsername]
        );

        if (result.rows.length === 0) {
            // 1️⃣ Application logging (debugging)
            logError('Login failed - User not found', null, {
                stage: 'user_lookup',
                reason: 'user_not_found',
                attemptedUsername: sanitizedUsername,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString()
            });
    
            // 2️⃣ Security audit logging (compliance)
            auditLog('SECURITY_LOGIN_FAILED', null, {
                event: 'login_failed',
                username: sanitizedUsername,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                reason: 'user_not_found',
                severity: 'medium'
            });


            return res.status(400).json({ 
                success: false,
                message: "Invalid username or password" 
            });
        }

        const user = result.rows[0];

        // ✅ CHECK: User bị lock?
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            const remainingMinutes = Math.ceil(
                (new Date(user.locked_until) - new Date()) / 60000
            );
            return res.status(403).json({
                success: false,
                message: `Tài khoản đã bị tạm khóa. Vui lòng thử lại sau ${remainingMinutes} phút hoặc liên hệ quản trị viên.`,
                locked: true,
                locked_until: user.locked_until
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // ❌ FAILED LOGIN ATTEMPT
            let newFailedAttempts = (user.failed_login_attempts || 0) + 1;
            let lockedUntil = null;
            let lockedReason = null;

            // ✅ LOCK ACCOUNT after 3 failed attempts (30 min lock)
            if (newFailedAttempts >= 3) {
                lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
                lockedReason = 'Sai mật khẩu quá 3 lần';
                newFailedAttempts = 0; // Reset counter after lock

                // 🔔 NOTIFY: Account locked
                await NotificationService.notifyAccountLocked({
                    id: user.id,
                    username: user.username,
                    locked_until: lockedUntil,
                    locked_reason: lockedReason
                });

                logInfo('Tài khoản bị tạm khóa do sai mật khẩu quá 3 lần', { 
                    userId: user.id, 
                    username: user.username 
                });
            }

            // Update user: increment failed attempts or lock
            await db.query(
                `UPDATE users 
                 SET failed_login_attempts = $1, 
                     locked_until = $2, 
                     locked_reason = $3
                 WHERE id = $4`,
                [newFailedAttempts, lockedUntil, lockedReason, user.id]
            );

            // Log failed authentication attempt
            logError('Login failed - Wrong password', null, {
                stage: 'password_verification',
                reason: 'incorrect_password',
                userId: user.id,
                username: user.username,
                attemptNumber: newFailedAttempts,
                accountLocked: !!lockedUntil,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString()
            });
            auditLog('SECURITY_LOGIN_FAILED', user.id, {
                event: 'login_failed',
                username: user.username,
                reason: 'incorrect_password',
                attemptNumber: newFailedAttempts,
                accountLocked: !!lockedUntil,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                severity: lockedUntil ? 'high' : 'medium'
            }, req);

            return res.status(401).json({
                success: false,
                message: lockedUntil 
                    ? `Tài khoản đã bị tạm khóa. Vui lòng liên hệ quản trị viên.`
                    : `Mật khẩu không chính xác. Còn ${3 - newFailedAttempts} lần thử.`
            });
        }

        // Check if user is active
        // if (user.is_active === false) {
        //     SecurityLogger.logFailedLogin(
        //         user.username, 
        //         req.ip, 
        //         req.get('User-Agent'), 
        //         'account_disabled'
        //     );
            
        //     logError('Login failed - Account disabled', new Error('User account is disabled'), {
        //         userId: user.id,
        //         username: user.username,
        //         ip: req.ip
        //     });
        //     return res.status(403).json({ 
        //         success: false,
        //         message: "Tài khoản của bạn đã bị vô hiệu hóa" 
        //     });
        // }

        // ✅ PASSWORD CORRECT
        // Reset failed attempts
        await db.query(
            `UPDATE users 
             SET failed_login_attempts = 0, 
                 locked_until = NULL, 
                 locked_reason = NULL,
                 last_login = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [user.id]
        );

        const token = generateToken(user);

        // Audit log successful login
        auditLog('LOGIN_SUCCESS', user.id, {
            username: user.username,
            role: user.role_id,
            loginMethod: 'password',
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            severity: 'low'
        }, req);

        // logInfo('User logged in successfully', {
        //     userId: user.id,
        //     username: user.username,
        //     ip: req.ip
        // });

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
            user: safeUser,
            // Temporary: send token in body for testing
            token: token
        });
    } catch (error) {
        logError('Login failed - System error', error, {
            stage: 'exception_handler',
            reason: 'system_error',
            errorName: error?.name,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });
        auditLog('SECURITY_LOGIN_FAILED', null, {
            event: 'login_failed',
            reason: 'system_error',
            errorName: error?.name,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            severity: 'high'
        }, req);
        
        return res.status(500).json({
            success: false,
            message: "Internal server error during login"
        });
    }
};

export const logout = (req, res) => {
    try {
        // Audit log successful logout (if user is authenticated)
        if (req.user) {
            auditLog('LOGOUT_SUCCESS', req.user.id, {
                username: req.user.username,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                severity: 'low'
            }, req);

            logInfo('User logged out successfully', {
                userId: req.user.id,
                username: req.user.username,
                ip: req.ip
            });
        }

        res.clearCookie('authToken');
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    } catch (error) {
        logError('Logout failed', error, {
            userId: req.user?.id,
            ip: req.ip
        });
        auditLog('LOGOUT_FAILED', req.user?.id, {
            reason: 'logout_error',
            errorName: error?.name,
            ip: req.ip,
            severity: 'medium'
        }, req);
        
        // Still clear cookie even if logging fails
        res.clearCookie('authToken');
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    }
};

export const getAuthStatus = async (req, res) => {
    try {
        // This endpoint is protected by authenticate middleware
        // If we reach here, user is authenticated
        
        // Fetch complete user info from database
        const result = await db.query(
            `SELECT u.id, u.username, u.name, u.email, u.phone, u.role_id, 
                    u.is_active, u.created_at, u.updated_at, r.name as role_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.id = $1`,
            [req.user.id]
        );
        
        if (result.rows.length === 0) {
            logError('Auth status check failed - User not found', null, {
                userId: req.user.id,
                ip: req.ip
            });
            auditLog('SECURITY_AUTH_STATUS_FAILED', req.user.id, {
                event: 'auth_status_check_failed',
                reason: 'user_not_found',
                ip: req.ip,
                severity: 'high'
            }, req);
            return res.status(404).json({
                success: false,
                authenticated: false,
                message: 'User not found'
            });
        }
        
        const user = result.rows[0];
        
        // Remove sensitive data
        const { password, ...safeUser } = user;
        
        // logInfo('Auth status checked successfully', {
        //     userId: user.id,
        //     username: user.username,
        //     ip: req.ip
        // });
        
        res.json({
            success: true,
            authenticated: true,
            user: safeUser
        });
    } catch (error) {
        logError('Auth status check failed', error, {
            userId: req.user?.id,
            ip: req.ip
        });
        auditLog('SECURITY_AUTH_STATUS_FAILED', req.user?.id, {
            event: 'auth_status_check_failed',
            reason: 'system_error',
            errorName: error?.name,
            ip: req.ip,
            severity: 'high'
        }, req);
        
        res.status(500).json({
            success: false,
            authenticated: false,
            message: 'Internal server error'
        });
    }
};

export const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const sanitizedName = InputSanitizer.sanitizeName(req.body?.name || "");
        const sanitizedEmail = InputSanitizer.sanitizeEmail(req.body?.email || "");
        const sanitizedPhone = InputSanitizer.sanitizePhone(req.body?.phone || "");

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!sanitizedName || !sanitizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });
        }

        const currentUserResult = await db.query(
            `SELECT id, name, email, phone
             FROM users
             WHERE id = $1`,
            [userId]
        );

        if (currentUserResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const duplicateEmailResult = await db.query(
            `SELECT id
             FROM users
             WHERE email = $1 AND id != $2
             LIMIT 1`,
            [sanitizedEmail, userId]
        );

        if (duplicateEmailResult.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        const phoneForSave = sanitizedPhone || null;
        if (phoneForSave) {
            const duplicatePhoneResult = await db.query(
                `SELECT id
                 FROM users
                 WHERE phone = $1 AND id != $2
                 LIMIT 1`,
                [phoneForSave, userId]
            );

            if (duplicatePhoneResult.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Phone already exists"
                });
            }
        }

        const updateResult = await db.query(
            `UPDATE users
             SET name = $1,
                 email = $2,
                 phone = $3,
                 updated_at = NOW()
             WHERE id = $4
             RETURNING id, username, name, email, phone, role_id, is_active, created_at, updated_at`,
            [sanitizedName, sanitizedEmail, phoneForSave, userId]
        );

        const updatedUser = updateResult.rows[0];
        const roleResult = await db.query(
            `SELECT name FROM roles WHERE id = $1 LIMIT 1`,
            [updatedUser.role_id]
        );

        auditLog('UPDATE_OWN_PROFILE', userId, {
            updatedFields: ['name', 'email', 'phone'],
            ip: req.ip,
            userAgent: req.get('User-Agent')
        }, req);

        res.json({
            success: true,
            message: 'Cập nhật hồ sơ thành công',
            user: {
                ...updatedUser,
                role_name: roleResult.rows[0]?.name || null
            }
        });
    } catch (error) {
        logError('Update own profile failed', error, {
            userId: req.user?.id,
            ip: req.ip
        });

        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ nội bộ'
        });
    }
};

export const changeMyPassword = async (req, res) => {
    try {
        const userId = req.user?.id;
        const currentPassword = String(req.body?.currentPassword || "");
        const newPassword = String(req.body?.newPassword || "");

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password"
            });
        }

        const hasMinLength = newPassword.length >= 8;
        const hasLetterAndNumber = /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword);
        const hasMixedCase = /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword);

        if (!hasMinLength || !hasLetterAndNumber || !hasMixedCase) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số"
            });
        }

        const userResult = await db.query(
            `SELECT id, username, password
             FROM users
             WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = userResult.rows[0];
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
            `UPDATE users
             SET password = $1,
                 updated_at = NOW()
             WHERE id = $2`,
            [hashedNewPassword, userId]
        );

        auditLog('CHANGE_OWN_PASSWORD', userId, {
            username: user.username,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        }, req);

        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
    } catch (error) {
        logError('Change own password failed', error, {
            userId: req.user?.id,
            ip: req.ip
        });

        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ nội bộ'
        });
    }
};