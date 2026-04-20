import db from "../config/db.js";
import { logError, logInfo, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";

// Roles that can access contacts: superadmin, admin, manager, consultant
const ALLOWED_CONTACT_ROLES = [1, 2, 3, 5];

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
    try {
        // Sanitize input data
        const sanitizedData = InputSanitizer.sanitizeContactData(req.body);
        const { 
            name, 
            email, 
            phone, 
            message, 
            status = 'new',
            contact_method, 
            social_contact, 
            assigned_to 
        } = sanitizedData;
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        logInfo('Contact creation attempt', {
            createdBy: currentUserId,
            creatorRole: currentUserRole,
            data: { name, email, phone, contact_method, assigned_to }
        });

        // Check if user has permission to create contacts
        if (!ALLOWED_CONTACT_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/contacts',
                'POST',
                'contact.create'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot create contacts." 
            });
        }

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        // Validate status if provided
        const validStatuses = ['new', 'pending', 'responded', 'closed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be one of: " + validStatuses.join(', ')
            });
        }

        // Validate contact_method if provided
        const validMethods = ['phone', 'email', 'social'];
        if (contact_method && !validMethods.includes(contact_method)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact_method. Must be one of: " + validMethods.join(', ')
            });
        }

        // Validate assigned_to if provided
        if (assigned_to) {
            const userCheck = await db.query(
                'SELECT id, role_id FROM users WHERE id = $1', 
                [assigned_to]
            );

            if (userCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid assigned_to user ID"
                });
            }

            // Check if assigned user has permission to handle contacts
            const assignedUserRole = userCheck.rows[0].role_id;
            if (!ALLOWED_CONTACT_ROLES.includes(assignedUserRole)) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot assign contact to user without contact permissions"
                });
            }
        }

        // Create contact
        const result = await db.query(`
            INSERT INTO contacts (
                name, email, phone, message, status, 
                contact_method, social_contact, assigned_to
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [
            name, 
            email || null, 
            phone || null, 
            message || null, 
            status,
            contact_method || null, 
            social_contact || null, 
            assigned_to || null
        ]);

        const newContact = result.rows[0];

        // Audit log successful contact creation
        auditLog('CREATE_CONTACT', currentUserId, {
            contactId: newContact.id,
            contactName: newContact.name,
            contactEmail: newContact.email,
            assignedTo: newContact.assigned_to,
            status: newContact.status
        }, req);

        logInfo('Contact created successfully', {
            createdBy: currentUserId,
            contactId: newContact.id,
            contactName: newContact.name,
            assignedTo: newContact.assigned_to
        });

        res.status(201).json({
            success: true,
            message: "Contact created successfully",
            data: newContact
        });

    } catch (error) {
        logError('Create contact failed', error, {
            createdBy: req.user?.id,
            targetData: req.body ? { ...req.body } : {}
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Update contact
export const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, 
            email, 
            phone, 
            message, 
            status, 
            contact_method, 
            social_contact, 
            assigned_to,
            first_contacted_at,
            closed_at
        } = req.body;
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

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

        // Build dynamic update query
        const updateData = {};
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name !== undefined) {
            updateData.name = name;
            updates.push(`name = $${paramCount}`);
            values.push(name);
            paramCount++;
        }

        if (email !== undefined) {
            updateData.email = email;
            updates.push(`email = $${paramCount}`);
            values.push(email || null);
            paramCount++;
        }

        if (phone !== undefined) {
            updateData.phone = phone;
            updates.push(`phone = $${paramCount}`);
            values.push(phone || null);
            paramCount++;
        }

        if (message !== undefined) {
            updateData.message = message;
            updates.push(`message = $${paramCount}`);
            values.push(message || null);
            paramCount++;
        }

        if (status !== undefined) {
            const validStatuses = ['new', 'pending', 'responded', 'closed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status. Must be one of: " + validStatuses.join(', ')
                });
            }
            updateData.status = status;
            updates.push(`status = $${paramCount}`);
            values.push(status);
            paramCount++;
        }

        if (contact_method !== undefined) {
            const validMethods = ['phone', 'email', 'social'];
            if (contact_method && !validMethods.includes(contact_method)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid contact_method. Must be one of: " + validMethods.join(', ')
                });
            }
            updateData.contact_method = contact_method;
            updates.push(`contact_method = $${paramCount}`);
            values.push(contact_method || null);
            paramCount++;
        }

        if (social_contact !== undefined) {
            updateData.social_contact = social_contact;
            updates.push(`social_contact = $${paramCount}`);
            values.push(social_contact || null);
            paramCount++;
        }

        if (assigned_to !== undefined) {
            if (assigned_to) {
                // Validate assigned user exists and has permissions
                const userCheck = await db.query(
                    'SELECT id, role_id FROM users WHERE id = $1', 
                    [assigned_to]
                );

                if (userCheck.rows.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid assigned_to user ID"
                    });
                }

                const assignedUserRole = userCheck.rows[0].role_id;
                if (!ALLOWED_CONTACT_ROLES.includes(assignedUserRole)) {
                    return res.status(400).json({
                        success: false,
                        message: "Cannot assign contact to user without contact permissions"
                    });
                }
            }

            updateData.assigned_to = assigned_to;
            updates.push(`assigned_to = $${paramCount}`);
            values.push(assigned_to || null);
            paramCount++;
        }

        if (first_contacted_at !== undefined) {
            updateData.first_contacted_at = first_contacted_at;
            updates.push(`first_contacted_at = $${paramCount}`);
            values.push(first_contacted_at || null);
            paramCount++;
        }

        if (closed_at !== undefined) {
            updateData.closed_at = closed_at;
            updates.push(`closed_at = $${paramCount}`);
            values.push(closed_at || null);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }

        // Auto-assign contact to current user when updated
        updates.push(`assigned_to = $${paramCount}`);
        values.push(currentUserId);
        paramCount++;
        
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

        // Check if user has permission to delete contacts (only superadmin, admin, manager - NOT consultant)
        if (![1, 2, 3].includes(currentUserRole)) {
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

// Get available users for assignment (only users with contact permissions)
export const getAssignableUsers = async (req, res) => {
    try {
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view assignable users
        if (!ALLOWED_CONTACT_ROLES.includes(currentUserRole)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot view assignable users." 
            });
        }

        // Get users who can handle contacts
        const result = await db.query(`
            SELECT u.id, u.name, u.username, r.name as role_name 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.role_id IN (1, 2, 3, 5)
            AND COALESCE(u.is_active, true) = true
            ORDER BY u.name ASC
        `);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        logError('Get assignable users failed', error, {
            requesterId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

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
        const sanitizedNote = InputSanitizer.sanitizeString(note.trim());

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
        const { status, note } = req.body;
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

        // Add note if provided
        if (note && note.trim().length > 0) {
            const sanitizedNote = InputSanitizer.sanitizeString(note.trim());
            
            await db.query(`
                INSERT INTO contact_notes (contact_id, user_id, note)
                VALUES ($1, $2, $3)
            `, [id, currentUserId, sanitizedNote]);
        }

        // Audit log
        auditLog('UPDATE_CONTACT_STATUS', currentUserId, {
            contactId: id,
            contactName: updatedContact.name,
            previousStatus: existingContact.status,
            newStatus: status,
            hasNote: !!note
        }, req);

        logInfo('Contact status updated successfully', {
            updatedBy: currentUserId,
            contactId: id,
            previousStatus: existingContact.status,
            newStatus: status
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