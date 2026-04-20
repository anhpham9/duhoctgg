import db from "../config/db.js";
import { logError, logInfo, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";

// Roles that can manage FAQs: superadmin, admin, manager
const MANAGE_FAQS_ROLES = [1, 2, 3];

// Get all FAQs
export const getFaqs = async (req, res) => {
    try {
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view FAQs
        if (!MANAGE_FAQS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/faqs',
                'GET',
                'faqs.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view FAQs." 
            });
        }

        const { type, school_id } = req.query;
        let query = `
            SELECT 
                f.*,
                s.name as school_name
            FROM faqs f
            LEFT JOIN schools s ON f.school_id = s.id
        `;
        
        const conditions = [];
        const values = [];
        let paramCount = 1;

        // Filter by type
        if (type) {
            conditions.push(`f.type = $${paramCount}`);
            values.push(type);
            paramCount++;
        }

        // Filter by school
        if (school_id) {
            conditions.push(`f.school_id = $${paramCount}`);
            values.push(parseInt(school_id));
            paramCount++;
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY f.created_at DESC`;

        const result = await db.query(query, values);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        logError('Get FAQs failed', error, {
            userId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get FAQ by ID
export const getFaqById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view FAQs
        if (!MANAGE_FAQS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/faqs/${id}`,
                'GET',
                'faqs.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view FAQs." 
            });
        }

        const result = await db.query(`
            SELECT 
                f.*,
                s.name as school_name
            FROM faqs f
            LEFT JOIN schools s ON f.school_id = s.id
            WHERE f.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "FAQ not found" 
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        logError('Get FAQ by ID failed', error, {
            requestedFaqId: req.params.id,
            requesterId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Create new FAQ
export const createFaq = async (req, res) => {
    try {
        // Sanitize input data
        const sanitizedData = InputSanitizer.sanitizeFaqData(req.body);
        const { question, answer, type, school_id } = sanitizedData;
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        logInfo('FAQ creation attempt', {
            createdBy: currentUserId,
            creatorRole: currentUserRole,
            data: { question, type, school_id }
        });

        // Check if user has permission to create FAQs
        if (!MANAGE_FAQS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/faqs',
                'POST',
                'faqs.create'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot create FAQs." 
            });
        }

        // Validate required fields
        if (!question || !answer || !type) {
            return res.status(400).json({
                success: false,
                message: "Question, answer, and type are required"
            });
        }

        // Validate type
        const validTypes = ['school', 'general'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid type. Must be 'school' or 'general'"
            });
        }

        // If type is 'school', school_id is required
        if (type === 'school' && !school_id) {
            return res.status(400).json({
                success: false,
                message: "School ID is required for school-specific FAQs"
            });
        }

        // Validate school exists if provided
        if (school_id) {
            const schoolCheck = await db.query(
                'SELECT id FROM schools WHERE id = $1', 
                [school_id]
            );

            if (schoolCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid school ID"
                });
            }
        }

        // Create FAQ
        const result = await db.query(`
            INSERT INTO faqs (question, answer, type, school_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [question, answer, type, school_id || null]);

        const newFaq = result.rows[0];

        // Audit log successful FAQ creation
        auditLog('CREATE_FAQ', currentUserId, {
            faqId: newFaq.id,
            faqType: newFaq.type,
            schoolId: newFaq.school_id
        }, req);

        logInfo('FAQ created successfully', {
            createdBy: currentUserId,
            faqId: newFaq.id,
            faqType: newFaq.type
        });

        res.status(201).json({
            success: true,
            message: "FAQ created successfully",
            data: newFaq
        });

    } catch (error) {
        logError('Create FAQ failed', error, {
            createdBy: req.user?.id,
            targetData: req.body ? { ...req.body } : {}
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Update FAQ
export const updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const sanitizedData = InputSanitizer.sanitizeFaqData(req.body);
        const { question, answer, type, school_id } = sanitizedData;
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to update FAQs
        if (!MANAGE_FAQS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/faqs/${id}`,
                'PUT',
                'faqs.update'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot update FAQs." 
            });
        }

        // Get the target FAQ
        const faqResult = await db.query(
            'SELECT * FROM faqs WHERE id = $1', 
            [id]
        );

        if (faqResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found"
            });
        }

        // Build dynamic update query
        const updateData = {};
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (question !== undefined) {
            updateData.question = question;
            updates.push(`question = $${paramCount}`);
            values.push(question);
            paramCount++;
        }

        if (answer !== undefined) {
            updateData.answer = answer;
            updates.push(`answer = $${paramCount}`);
            values.push(answer);
            paramCount++;
        }

        if (type !== undefined) {
            const validTypes = ['school', 'general'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid type. Must be 'school' or 'general'"
                });
            }
            updateData.type = type;
            updates.push(`type = $${paramCount}`);
            values.push(type);
            paramCount++;
        }

        if (school_id !== undefined) {
            if (school_id) {
                // Validate school exists
                const schoolCheck = await db.query(
                    'SELECT id FROM schools WHERE id = $1', 
                    [school_id]
                );

                if (schoolCheck.rows.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid school ID"
                    });
                }
            }
            updateData.school_id = school_id;
            updates.push(`school_id = $${paramCount}`);
            values.push(school_id || null);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }

        values.push(id);

        // Execute update
        const updateQuery = `
            UPDATE faqs 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(updateQuery, values);
        const updatedFaq = result.rows[0];

        // Audit log successful FAQ update
        auditLog('UPDATE_FAQ', currentUserId, {
            faqId: id,
            updatedFields: Object.keys(updateData)
        }, req);

        logInfo('FAQ updated successfully', {
            updatedBy: currentUserId,
            faqId: id,
            updatedFields: Object.keys(updateData)
        });

        res.json({
            success: true,
            message: "FAQ updated successfully",
            data: updatedFaq
        });

    } catch (error) {
        logError('Update FAQ failed', error, {
            updatedBy: req.user?.id,
            faqId: req.params?.id,
            updateData: req.body
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Delete FAQ
export const deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to delete FAQs
        if (!MANAGE_FAQS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/faqs/${id}`,
                'DELETE',
                'faqs.delete'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot delete FAQs." 
            });
        }

        // Get the target FAQ
        const faqResult = await db.query(
            'SELECT * FROM faqs WHERE id = $1', 
            [id]
        );

        if (faqResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found"
            });
        }

        const targetFaq = faqResult.rows[0];

        // Delete FAQ
        await db.query('DELETE FROM faqs WHERE id = $1', [id]);

        // Audit log successful FAQ deletion
        auditLog('DELETE_FAQ', currentUserId, {
            faqId: id,
            faqType: targetFaq.type,
            schoolId: targetFaq.school_id
        }, req);

        logInfo('FAQ deleted successfully', {
            deletedBy: currentUserId,
            faqId: id,
            faqType: targetFaq.type
        });

        res.json({
            success: true,
            message: "FAQ deleted successfully"
        });

    } catch (error) {
        logError('Delete FAQ failed', error, {
            deletedBy: req.user?.id,
            faqId: req.params?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};