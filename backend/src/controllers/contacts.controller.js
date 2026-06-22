import db from "../config/db.js";
import { logError, logInfo, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";
import validator from 'validator';

// Roles that can access contacts: superadmin, admin, manager, consultant
const ALLOWED_CONTACT_ROLES = [1, 2, 3, 5];

const hasRepeatedSingleChar = (value) => /^([a-z0-9])\1{6,}$/i.test(value);

const hasRepeatedChunk = (value) => /^(.{2,4})\1{2,}$/i.test(value);

const isLowQualityAlphabeticText = (value) => {
    if (!/^[a-z]+$/i.test(value)) return false;
    if (value.length < 8) return false;

    const uniqueChars = new Set(value.toLowerCase()).size;
    const vowelCount = (value.match(/[aeiouy]/gi) || []).length;

    return uniqueChars <= 3 || vowelCount <= 1;
};

const isSpamLikeMessage = (message) => {
    const normalized = String(message || '').toLowerCase().trim();
    if (!normalized) return true;

    const compact = normalized.replace(/\s+/g, '');
    if (!compact) return true;

    if (/^\d+$/.test(compact)) return true;
    if (hasRepeatedSingleChar(compact)) return true;
    if (hasRepeatedChunk(compact)) return true;
    if (isLowQualityAlphabeticText(compact)) return true;

    return false;
};

// Public contact submission (no authentication required)
export const submitPublicContact = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const normalizedMessage = typeof message === 'string' ? message.trim() : '';

        // Comprehensive validation
        const errors = [];

        // Validate name
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            errors.push('Tên phải có ít nhất 2 ký tự');
        }
        if (name && name.length > 100) {
            errors.push('Tên không được quá 100 ký tự');
        }

        // Validate email
        if (!email || typeof email !== 'string' || !validator.isEmail(email.trim())) {
            errors.push('Email không hợp lệ');
        }
        if (email && email.length > 150) {
            errors.push('Email không được quá 150 ký tự');
        }

        // Validate phone
        if (!phone || typeof phone !== 'string' || phone.trim().length < 10) {
            errors.push('Số điện thoại phải có ít nhất 10 số');
        }
        if (phone && !/^[0-9+\-\s()]{10,20}$/.test(phone.trim())) {
            errors.push('Số điện thoại không hợp lệ');
        }

        // Validate message (required + anti-spam)
        if (!normalizedMessage) {
            errors.push('Lời nhắn không được để trống');
        }
        if (normalizedMessage && normalizedMessage.length < 10) {
            errors.push('Lời nhắn phải có tối thiểu 10 ký tự');
        }
        if (normalizedMessage && normalizedMessage.length > 1000) {
            errors.push('Tin nhắn không được quá 1000 ký tự');
        }
        if (normalizedMessage && isSpamLikeMessage(normalizedMessage)) {
            errors.push('Nội dung lời nhắn chưa hợp lệ hoặc có dấu hiệu spam');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors
            });
        }

        // Additional security checks
        const sanitizedName = InputSanitizer.sanitizeText(name.trim(), { maxLength: 100 });
        const sanitizedEmail = InputSanitizer.sanitizeEmail(email.trim());
        const sanitizedPhone = InputSanitizer.sanitizePhone(phone.trim());
        const sanitizedMessage = InputSanitizer.sanitizeText(normalizedMessage, { maxLength: 1000 });

        // Check for suspicious patterns (basic spam detection)
        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /vbscript:/i,
            /onload=/i,
            /onerror=/i,
            /onclick=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i,
            /eval\(/i,
            /expression\(/i,
            /\bselect\b.*\bfrom\b/i,
            /\bunion\b.*\bselect\b/i,
            /\bdrop\b.*\btable\b/i,
            /\bdelete\b.*\bfrom\b/i
        ];

        const allText = `${sanitizedName} ${sanitizedEmail} ${sanitizedMessage}`;
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(allText)) {
                SecurityLogger.logSecurityViolation(
                    null,
                    req.ip,
                    '/api/public/contact',
                    'POST',
                    'Suspicious content detected in contact form',
                    { name: sanitizedName, email: sanitizedEmail, userAgent: req.get('User-Agent') }
                );
                
                return res.status(400).json({
                    success: false,
                    message: 'Nội dung không được chấp nhận'
                });
            }
        }

        // Check for duplicate submissions (same IP + email in last hour)
        const duplicateCheck = await db.query(
            `SELECT COUNT(*) as count 
             FROM contacts 
             WHERE email = $1 
             AND created_at > NOW() - INTERVAL '1 hour'`,
            [sanitizedEmail]
        );

        if (duplicateCheck.rows[0].count > 0) {
            logInfo('Duplicate contact submission blocked', {
                email: sanitizedEmail,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            return res.status(429).json({
                success: false,
                message: 'Bạn đã gửi tin nhắn gần đây. Vui lòng chờ ít nhất 1 tiếng trước khi gửi lại.'
            });
        }

        // Insert contact with default values
        const result = await db.query(
            `INSERT INTO contacts 
             (name, email, phone, message, status, contact_method, created_at)
             VALUES ($1, $2, $3, $4, 'new', 'email', NOW())
             RETURNING id, created_at`,
            [sanitizedName, sanitizedEmail, sanitizedPhone, sanitizedMessage]
        );

        const contactId = result.rows[0].id;

        // Log successful submission for audit
        logInfo('Public contact form submitted successfully', {
            contactId,
            name: sanitizedName,
            email: sanitizedEmail,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: result.rows[0].created_at
        });

        // Audit log for compliance
        auditLog({
            action: 'public_contact_submission',
            resource: 'contacts',
            resourceId: contactId,
            userId: null, // Public submission
            changes: {
                name: sanitizedName,
                email: sanitizedEmail,
                phone: sanitizedPhone,
                status: 'new'
            },
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(201).json({
            success: true,
            message: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.',
            data: {
                id: contactId,
                submitted_at: result.rows[0].created_at
            }
        });

    } catch (error) {
        logError('Public contact submission failed', error, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            formData: req.body
        });
        
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra. Vui lòng thử lại sau.'
        });
    }
};

// Get all contacts with user assignment info
export const getContacts = async (req, res) => {
    try {
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view contacts
        if (!ALLOWED_CONTACT_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/contacts',
                'GET',
                'contact.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view contacts." 
            });
        }

        // Build query based on role permissions
        let query = `
            SELECT 
                c.id,
                c.name,
                c.email,
                c.phone,
                c.message,
                c.status,
                c.contact_method,
                c.social_contact,
                c.assigned_to,
                u.name as assigned_to_name,
                c.first_contacted_at,
                c.closed_at,
                c.created_at,
                c.updated_at
            FROM contacts c
            LEFT JOIN users u ON c.assigned_to = u.id
        `;
        
        let queryParams = [];
        
        // All roles can see all contacts now (including consultants)
        query += ` ORDER BY c.created_at DESC`;

        const result = await db.query(query, queryParams);

        // Log data access for audit
        SecurityLogger.logDataAccess(
            currentUserId,
            'contacts',
            'read',
            result.rows.length,
            { role: currentUserRole }
        );

        logInfo('Contacts retrieved successfully', {
            userId: currentUserId,
            userRole: currentUserRole,
            contactCount: result.rows.length
        });

        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        logError('Get contacts failed', error, {
            userId: req.user?.id,
            userRole: req.user?.role_id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get single contact by ID
export const getContact = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view contacts
        if (!ALLOWED_CONTACT_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/contacts/${id}`,
                'GET',
                'contact.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view contacts." 
            });
        }

        const result = await db.query(`
            SELECT 
                c.id,
                c.name,
                c.email,
                c.phone,
                c.message,
                c.status,
                c.contact_method,
                c.social_contact,
                c.assigned_to,
                u.name as assigned_to_name,
                c.first_contacted_at,
                c.closed_at,
                c.created_at,
                c.updated_at
            FROM contacts c
            LEFT JOIN users u ON c.assigned_to = u.id
            WHERE c.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Contact not found" 
            });
        }

        const contact = result.rows[0];

        // All roles can view all contacts now (including consultants)

        res.json({
            success: true,
            data: contact
        });

    } catch (error) {
        logError('Get contact failed', error, {
            requestedContactId: req.params.id,
            requesterId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Create new contact
export const createContact = async (req, res) => {
    // Chỉ cho phép tạo contact từ public (không có req.user)
    if (req.user) {
        return res.status(403).json({
            success: false,
            message: "Contact creation is only allowed from public site."
        });
    }
    // ...existing code (nếu cần giữ lại logic public createContact, hãy chuyển sang submitPublicContact)
};

// Update contact
export const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            status,
            contact_method,
            social_contact
        } = req.body;
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // check required fields for contact_method validation
        if (contact_method === 'social' && !social_contact) {
            return res.status(400).json({
                success: false,
                message: "Social contact is required for social contact method."
            });
        }

        // Check if user has permission to update contacts
        if (!ALLOWED_CONTACT_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/contacts/${id}`,
                'PUT',
                'contact.update'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot update contacts." 
            });
        }

        // Get the target contact
        const contactResult = await db.query(
            'SELECT * FROM contacts WHERE id = $1', 
            [id]
        );

        if (contactResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        const existingContact = contactResult.rows[0];

        // Consultant cannot update contacts with closed status
        if (currentUserRole === 5 && existingContact.status === 'closed') {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/contacts/${id}`,
                'PUT',
                'contact.update_closed'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot update closed contacts." 
            });
        }

        // Build update fields (only allow contact_method, social_contact, status)
        const updates = [];
        const values = [];
        let paramCount = 1;

        // contact_method
        if (contact_method !== undefined) {
            const validMethods = ['phone', 'email', 'social'];
            if (contact_method && !validMethods.includes(contact_method)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid contact_method. Must be one of: " + validMethods.join(', ')
                });
            }
            updates.push(`contact_method = $${paramCount}`);
            values.push(contact_method || null);
            paramCount++;
        }

        // social_contact
        if (social_contact !== undefined) {
            updates.push(`social_contact = $${paramCount}`);
            values.push(social_contact || null);
            paramCount++;
        }

        // status: only allow next status in sequence
        let willSetClosedAt = false;
        if (status !== undefined) {
            const validStatuses = ['new', 'pending', 'responded', 'closed'];
            const currentStatus = existingContact.status;
            const currentIdx = validStatuses.indexOf(currentStatus);
            const nextIdx = currentIdx + 1;
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status. Must be one of: " + validStatuses.join(', ')
                });
            }
            // Only allow next status or keep current
            const statusIdx = validStatuses.indexOf(status);
            logInfo('Attempting to update contact status', {
                validStatusesIndex: statusIdx,
                status,
                nextIdx,
                currentIdx,
                allowed: [currentIdx, nextIdx].includes(statusIdx)
            });

            if (![currentIdx, nextIdx].includes(statusIdx)) {
                return res.status(400).json({
                    success: false,
                    message: `Status can only be changed to next step: ${validStatuses[nextIdx]}`
                });
            }
            // Consultant cannot change status if already closed
            if (currentUserRole === 5 && currentStatus === 'closed') {
                return res.status(403).json({
                    success: false,
                    message: "Consultant cannot change status of closed contact."
                });
            }
            updates.push(`status = $${paramCount}`);
            values.push(status);
            paramCount++;
            // Nếu chuyển sang closed thì cập nhật closed_at
            if (status === 'closed' && !existingContact.closed_at) {
                willSetClosedAt = true;
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }

        // Always set assigned_to to current user (last editor)
        updates.push(`assigned_to = $${paramCount}`);
        values.push(currentUserId);
        paramCount++;

        // Nếu chuyển sang closed thì cập nhật closed_at
        if (willSetClosedAt) {
            updates.push(`closed_at = NOW()`);
        }

        // Add updated_at
        updates.push(`updated_at = NOW()`);
        values.push(id);

        // Execute update
        const updateQuery = `
            UPDATE contacts 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(updateQuery, values);
        const updatedContact = result.rows[0];

        const updateData = {};
        if (contact_method !== undefined) updateData.contact_method = contact_method;
        if (social_contact !== undefined) updateData.social_contact = social_contact;
        if (status !== undefined) updateData.status = status;

        // Audit log successful contact update
        auditLog('UPDATE_CONTACT', currentUserId, {
            contactId: id,
            contactName: updatedContact.name,
            updatedFields: Object.keys(updateData),
            previousAssignment: existingContact.assigned_to,
            newAssignment: updatedContact.assigned_to
        }, req);

        logInfo('Contact updated successfully', {
            updatedBy: currentUserId,
            contactId: id,
            updatedFields: Object.keys(updateData)
        });

        res.json({
            success: true,
            message: "Contact updated successfully",
            data: updatedContact
        });

    } catch (error) {
        logError('Update contact failed', error, {
            updatedBy: req.user?.id,
            contactId: req.params?.id,
            updateData: req.body
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Delete contact
export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to delete contacts (only superadmin - NOT consultant, admin, manager)
        if (![1].includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/contacts/${id}`,
                'DELETE',
                'contact.delete'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot delete contacts." 
            });
        }

        // Get the target contact
        const contactResult = await db.query(
            'SELECT * FROM contacts WHERE id = $1', 
            [id]
        );

        if (contactResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        const targetContact = contactResult.rows[0];

        // Delete contact
        await db.query('DELETE FROM contacts WHERE id = $1', [id]);

        // Audit log successful contact deletion
        auditLog('DELETE_CONTACT', currentUserId, {
            contactId: id,
            contactName: targetContact.name,
            contactEmail: targetContact.email,
            assignedTo: targetContact.assigned_to
        }, req);

        // Security log for contact deletion
        SecurityLogger.logSecurityAction(
            null, // No target user ID for contacts
            currentUserId,
            'delete_contact',
            'Admin deletion',
            req.ip
        );

        logInfo('Contact deleted successfully', {
            deletedBy: currentUserId,
            contactId: id,
            contactName: targetContact.name
        });

        res.json({
            success: true,
            message: "Contact deleted successfully"
        });

    } catch (error) {
        logError('Delete contact failed', error, {
            deletedBy: req.user?.id,
            contactId: req.params?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Removed getAssignableUsers endpoint (no longer needed)

// Get contact statistics
export const getContactStats = async (req, res) => {
    try {
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view stats
        if (!ALLOWED_CONTACT_ROLES.includes(currentUserRole)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot view contact statistics." 
            });
        }

        let whereClause = '';
        let queryParams = [];
        
        // All roles can see stats for all contacts now

        const result = await db.query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM contacts
            ${whereClause}
            GROUP BY status
            ORDER BY 
                CASE status
                    WHEN 'new' THEN 1
                    WHEN 'pending' THEN 2
                    WHEN 'responded' THEN 3
                    WHEN 'closed' THEN 4
                END
        `, queryParams);

        const totalResult = await db.query(`
            SELECT COUNT(*) as total
            FROM contacts
            ${whereClause}
        `, queryParams);

        res.json({
            success: true,
            data: {
                byStatus: result.rows,
                total: parseInt(totalResult.rows[0].total)
            }
        });

    } catch (error) {
        logError('Get contact stats failed', error, {
            requesterId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get contact notes for a specific contact
export const getContactNotes = async (req, res) => {
    try {
        const { contactId } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view contacts
        if (!ALLOWED_CONTACT_ROLES.includes(currentUserRole)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot view contact notes." 
            });
        }

        // Verify contact exists
        const contactResult = await db.query(
            'SELECT id FROM contacts WHERE id = $1', 
            [contactId]
        );

        if (contactResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        // Get all notes for this contact
        const result = await db.query(`
            SELECT 
                cn.id,
                cn.note,
                cn.created_at,
                u.name as author_name,
                u.username as author_username
            FROM contact_notes cn
            JOIN users u ON cn.user_id = u.id
            WHERE cn.contact_id = $1
            ORDER BY cn.created_at ASC
        `, [contactId]);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        logError('Get contact notes failed', error, {
            requesterId: req.user?.id,
            contactId: req.params?.contactId
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Add a new note to a contact
export const addContactNote = async (req, res) => {
    try {
        const { contactId } = req.params;
        const { note } = req.body;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to add notes
        if (!ALLOWED_CONTACT_ROLES.includes(currentUserRole)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot add contact notes." 
            });
        }

        // Validate note content
        if (!note || note.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Note content is required"
            });
        }

        // Verify contact exists
        const contactResult = await db.query(
            'SELECT id, name FROM contacts WHERE id = $1', 
            [contactId]
        );

        if (contactResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        const contact = contactResult.rows[0];

        // Sanitize note content
        const sanitizedNote = InputSanitizer.sanitizeText(note.trim());

        // Add the note
        const result = await db.query(`
            INSERT INTO contact_notes (contact_id, user_id, note)
            VALUES ($1, $2, $3)
            RETURNING id, contact_id, user_id, note, created_at
        `, [contactId, currentUserId, sanitizedNote]);

        const newNote = result.rows[0];

        // Get author info for response
        const authorResult = await db.query(
            'SELECT name, username FROM users WHERE id = $1', 
            [currentUserId]
        );
        
        const author = authorResult.rows[0];

        // Audit log
        auditLog('ADD_CONTACT_NOTE', currentUserId, {
            contactId: contactId,
            contactName: contact.name,
            noteId: newNote.id,
            notePreview: sanitizedNote.substring(0, 100) + (sanitizedNote.length > 100 ? '...' : '')
        }, req);

        logInfo('Contact note added successfully', {
            authorId: currentUserId,
            contactId: contactId,
            noteId: newNote.id
        });

        res.status(201).json({
            success: true,
            message: "Note added successfully",
            data: {
                ...newNote,
                author_name: author.name,
                author_username: author.username
            }
        });

    } catch (error) {
        logError('Add contact note failed', error, {
            authorId: req.user?.id,
            contactId: req.params?.contactId,
            noteContent: req.body?.note
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Update contact status with business logic
export const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to update contacts
        if (!ALLOWED_CONTACT_ROLES.includes(currentUserRole)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot update contact status." 
            });
        }

        // Validate status
        const validStatuses = ['new', 'pending', 'responded', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be one of: " + validStatuses.join(', ')
            });
        }

        // Get the target contact
        const contactResult = await db.query(
            'SELECT * FROM contacts WHERE id = $1', 
            [id]
        );

        if (contactResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        const existingContact = contactResult.rows[0];

        // Consultant cannot update closed contacts
        if (currentUserRole === 5 && existingContact.status === 'closed') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot update closed contacts." 
            });
        }

        // Prepare update fields
        const updateFields = ['status = $1', 'assigned_to = $2', 'updated_at = NOW()'];
        const values = [status, currentUserId];
        let paramCount = 3;

        // Add timestamp fields based on status
        if (status === 'pending' && existingContact.first_contacted_at === null) {
            updateFields.push(`first_contacted_at = $${paramCount}`);
            values.push(new Date());
            paramCount++;
        }

        if (status === 'closed' && existingContact.closed_at === null) {
            updateFields.push(`closed_at = $${paramCount}`);
            values.push(new Date());
            paramCount++;
        }

        // Update contact
        values.push(id);
        const updateQuery = `
            UPDATE contacts 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(updateQuery, values);
        const updatedContact = result.rows[0];

        // Audit log
        auditLog('UPDATE_CONTACT_STATUS', currentUserId, {
            contactId: id,
            contactName: updatedContact.name,
            previousStatus: existingContact.status,
            newStatus: status
        }, req);

        logInfo('Contact status updated successfully', {
            updatedBy: currentUserId,
            contactId: id,
            previousStatus: existingContact.status,
            newStatus: status,
            data: updatedContact
        });

        res.json({
            success: true,
            message: "Contact status updated successfully",
            data: updatedContact
        });

    } catch (error) {
        logError('Update contact status failed', error, {
            updatedBy: req.user?.id,
            contactId: req.params?.id,
            targetStatus: req.body?.status
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};