import db from "../config/db.js";
import { logError, logInfo, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";

// Roles that can manage regions: superadmin, admin, manager
const MANAGE_REGIONS_ROLES = [1, 2, 3];

// Get all regions
export const getRegions = async (req, res) => {
    try {
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view regions
        if (!MANAGE_REGIONS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/regions',
                'GET',
                'regions.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view regions." 
            });
        }

        const result = await db.query(`
            SELECT 
                r.*,
                COUNT(s.id) as schools_count
            FROM regions r
            LEFT JOIN schools s ON r.id = s.region_id
            GROUP BY r.id
            ORDER BY r.name
        `);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        logError('Get regions failed', error, {
            userId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get region by ID
export const getRegionById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view regions
        if (!MANAGE_REGIONS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/regions/${id}`,
                'GET',
                'regions.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view regions." 
            });
        }

        const result = await db.query(`
            SELECT 
                r.*,
                COUNT(s.id) as schools_count
            FROM regions r
            LEFT JOIN schools s ON r.id = s.region_id
            WHERE r.id = $1
            GROUP BY r.id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Region not found" 
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        logError('Get region by ID failed', error, {
            requestedRegionId: req.params.id,
            requesterId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Create new region
export const createRegion = async (req, res) => {
    try {
        // Sanitize input data
        const sanitizedData = InputSanitizer.sanitizeRegionData(req.body);
        const { name, slug } = sanitizedData;
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        logInfo('Region creation attempt', {
            createdBy: currentUserId,
            creatorRole: currentUserRole,
            data: { name, slug }
        });

        // Check if user has permission to create regions
        if (!MANAGE_REGIONS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/regions',
                'POST',
                'regions.create'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot create regions." 
            });
        }

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Region name is required"
            });
        }

        // Generate slug if not provided
        let regionSlug = slug;
        if (!regionSlug) {
            regionSlug = name.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        // Check slug uniqueness
        const slugCheck = await db.query(
            'SELECT id FROM regions WHERE slug = $1', 
            [regionSlug]
        );

        if (slugCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Region slug already exists"
            });
        }

        // Create region
        const result = await db.query(`
            INSERT INTO regions (name, slug)
            VALUES ($1, $2)
            RETURNING *
        `, [name, regionSlug]);

        const newRegion = result.rows[0];

        // Audit log successful region creation
        auditLog('CREATE_REGION', currentUserId, {
            regionId: newRegion.id,
            regionName: newRegion.name,
            regionSlug: newRegion.slug
        }, req);

        logInfo('Region created successfully', {
            createdBy: currentUserId,
            regionId: newRegion.id,
            regionName: newRegion.name
        });

        res.status(201).json({
            success: true,
            message: "Region created successfully",
            data: newRegion
        });

    } catch (error) {
        logError('Create region failed', error, {
            createdBy: req.user?.id,
            targetData: req.body ? { ...req.body } : {}
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Update region
export const updateRegion = async (req, res) => {
    try {
        const { id } = req.params;
        const sanitizedData = InputSanitizer.sanitizeRegionData(req.body);
        const { name, slug } = sanitizedData;
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to update regions
        if (!MANAGE_REGIONS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/regions/${id}`,
                'PUT',
                'regions.update'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot update regions." 
            });
        }

        // Get the target region
        const regionResult = await db.query(
            'SELECT * FROM regions WHERE id = $1', 
            [id]
        );

        if (regionResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Region not found"
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
                'SELECT id FROM regions WHERE slug = $1 AND id != $2', 
                [slug, id]
            );

            if (slugCheck.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Region slug already exists"
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
            UPDATE regions 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(updateQuery, values);
        const updatedRegion = result.rows[0];

        // Audit log successful region update
        auditLog('UPDATE_REGION', currentUserId, {
            regionId: id,
            regionName: updatedRegion.name,
            updatedFields: Object.keys(updateData)
        }, req);

        logInfo('Region updated successfully', {
            updatedBy: currentUserId,
            regionId: id,
            updatedFields: Object.keys(updateData)
        });

        res.json({
            success: true,
            message: "Region updated successfully",
            data: updatedRegion
        });

    } catch (error) {
        logError('Update region failed', error, {
            updatedBy: req.user?.id,
            regionId: req.params?.id,
            updateData: req.body
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Delete region
export const deleteRegion = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to delete regions
        if (!MANAGE_REGIONS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/regions/${id}`,
                'DELETE',
                'regions.delete'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot delete regions." 
            });
        }

        // Get the target region
        const regionResult = await db.query(
            'SELECT * FROM regions WHERE id = $1', 
            [id]
        );

        if (regionResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Region not found"
            });
        }

        const targetRegion = regionResult.rows[0];

        // Check if region has schools
        const schoolsCount = await db.query(
            'SELECT COUNT(*) as count FROM schools WHERE region_id = $1',
            [id]
        );

        if (parseInt(schoolsCount.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete region with existing schools. Please move or delete the schools first."
            });
        }

        // Delete region
        await db.query('DELETE FROM regions WHERE id = $1', [id]);

        // Audit log successful region deletion
        auditLog('DELETE_REGION', currentUserId, {
            regionId: id,
            regionName: targetRegion.name,
            regionSlug: targetRegion.slug
        }, req);

        logInfo('Region deleted successfully', {
            deletedBy: currentUserId,
            regionId: id,
            regionName: targetRegion.name
        });

        res.json({
            success: true,
            message: "Region deleted successfully"
        });

    } catch (error) {
        logError('Delete region failed', error, {
            deletedBy: req.user?.id,
            regionId: req.params?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};