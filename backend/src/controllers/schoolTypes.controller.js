import db from "../config/db.js";
import { logError, logInfo, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";

// Roles that can manage school types: superadmin, admin, manager
const MANAGE_SCHOOL_TYPES_ROLES = [1, 2, 3];

// Get all school types
export const getSchoolTypes = async (req, res) => {
    try {
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view school types
        if (!MANAGE_SCHOOL_TYPES_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/school-types',
                'GET',
                'school_types.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view school types." 
            });
        }

        const result = await db.query(`
            SELECT 
                st.*,
                COUNT(s.id) as schools_count
            FROM school_types st
            LEFT JOIN schools s ON st.id = s.type_id
            GROUP BY st.id
            ORDER BY st.name
        `);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        logError('Get school types failed', error, {
            userId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get school type by ID
export const getSchoolTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view school types
        if (!MANAGE_SCHOOL_TYPES_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/school-types/${id}`,
                'GET',
                'school_types.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view school types." 
            });
        }

        const result = await db.query(`
            SELECT 
                st.*,
                COUNT(s.id) as schools_count
            FROM school_types st
            LEFT JOIN schools s ON st.id = s.type_id
            WHERE st.id = $1
            GROUP BY st.id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "School type not found" 
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        logError('Get school type by ID failed', error, {
            requestedTypeId: req.params.id,
            requesterId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Create new school type
export const createSchoolType = async (req, res) => {
    try {
        // Sanitize input data
        const sanitizedData = InputSanitizer.sanitizeSchoolTypeData(req.body);
        const { name, slug } = sanitizedData;
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        logInfo('School type creation attempt', {
            createdBy: currentUserId,
            creatorRole: currentUserRole,
            data: { name, slug }
        });

        // Check if user has permission to create school types
        if (!MANAGE_SCHOOL_TYPES_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/school-types',
                'POST',
                'school_types.create'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot create school types." 
            });
        }

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "School type name is required"
            });
        }

        // Generate slug if not provided
        let typeSlug = slug;
        if (!typeSlug) {
            typeSlug = name.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        // Check slug uniqueness
        const slugCheck = await db.query(
            'SELECT id FROM school_types WHERE slug = $1', 
            [typeSlug]
        );

        if (slugCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "School type slug already exists"
            });
        }

        // Create school type
        const result = await db.query(`
            INSERT INTO school_types (name, slug)
            VALUES ($1, $2)
            RETURNING *
        `, [name, typeSlug]);

        const newSchoolType = result.rows[0];

        // Audit log successful school type creation
        auditLog('CREATE_SCHOOL_TYPE', currentUserId, {
            schoolTypeId: newSchoolType.id,
            schoolTypeName: newSchoolType.name,
            schoolTypeSlug: newSchoolType.slug
        }, req);

        logInfo('School type created successfully', {
            createdBy: currentUserId,
            schoolTypeId: newSchoolType.id,
            schoolTypeName: newSchoolType.name
        });

        res.status(201).json({
            success: true,
            message: "School type created successfully",
            data: newSchoolType
        });

    } catch (error) {
        logError('Create school type failed', error, {
            createdBy: req.user?.id,
            targetData: req.body ? { ...req.body } : {}
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Update school type
export const updateSchoolType = async (req, res) => {
    try {
        const { id } = req.params;
        const sanitizedData = InputSanitizer.sanitizeSchoolTypeData(req.body);
        const { name, slug } = sanitizedData;
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to update school types
        if (!MANAGE_SCHOOL_TYPES_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/school-types/${id}`,
                'PUT',
                'school_types.update'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot update school types." 
            });
        }

        // Get the target school type
        const schoolTypeResult = await db.query(
            'SELECT * FROM school_types WHERE id = $1', 
            [id]
        );

        if (schoolTypeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "School type not found"
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

        if (slug !== undefined) {
            // Check slug uniqueness
            const slugCheck = await db.query(
                'SELECT id FROM school_types WHERE slug = $1 AND id != $2', 
                [slug, id]
            );

            if (slugCheck.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "School type slug already exists"
                });
            }

            updateData.slug = slug;
            updates.push(`slug = $${paramCount}`);
            values.push(slug);
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
            UPDATE school_types 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(updateQuery, values);
        const updatedSchoolType = result.rows[0];

        // Audit log successful school type update
        auditLog('UPDATE_SCHOOL_TYPE', currentUserId, {
            schoolTypeId: id,
            schoolTypeName: updatedSchoolType.name,
            updatedFields: Object.keys(updateData)
        }, req);

        logInfo('School type updated successfully', {
            updatedBy: currentUserId,
            schoolTypeId: id,
            updatedFields: Object.keys(updateData)
        });

        res.json({
            success: true,
            message: "School type updated successfully",
            data: updatedSchoolType
        });

    } catch (error) {
        logError('Update school type failed', error, {
            updatedBy: req.user?.id,
            schoolTypeId: req.params?.id,
            updateData: req.body
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Delete school type
export const deleteSchoolType = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to delete school types
        if (!MANAGE_SCHOOL_TYPES_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/school-types/${id}`,
                'DELETE',
                'school_types.delete'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot delete school types." 
            });
        }

        // Get the target school type
        const schoolTypeResult = await db.query(
            'SELECT * FROM school_types WHERE id = $1', 
            [id]
        );

        if (schoolTypeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "School type not found"
            });
        }

        const targetSchoolType = schoolTypeResult.rows[0];

        // Check if school type has schools
        const schoolsCount = await db.query(
            'SELECT COUNT(*) as count FROM schools WHERE type_id = $1',
            [id]
        );

        if (parseInt(schoolsCount.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete school type with existing schools. Please move or delete the schools first."
            });
        }

        // Delete school type
        await db.query('DELETE FROM school_types WHERE id = $1', [id]);

        // Audit log successful school type deletion
        auditLog('DELETE_SCHOOL_TYPE', currentUserId, {
            schoolTypeId: id,
            schoolTypeName: targetSchoolType.name,
            schoolTypeSlug: targetSchoolType.slug
        }, req);

        logInfo('School type deleted successfully', {
            deletedBy: currentUserId,
            schoolTypeId: id,
            schoolTypeName: targetSchoolType.name
        });

        res.json({
            success: true,
            message: "School type deleted successfully"
        });

    } catch (error) {
        logError('Delete school type failed', error, {
            deletedBy: req.user?.id,
            schoolTypeId: req.params?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};