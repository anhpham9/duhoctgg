import db from "../config/db.js";
import { logError, logInfo, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";
import {
    MEDIA_OWNER_TYPES,
    MEDIA_FIELD_NAMES,
    getSchoolOwnerKey,
    syncMediaAssetOwnership,
    getMediaAssetRefsByOwner,
    deleteMediaAssetRef
} from "../services/mediaAsset.service.js";
import {
    DEFAULT_IMAGE_MIME_TYPES,
    validateImageUploadFile,
    uploadImageToCloudinary,
    deleteCloudinaryAssetByPublicId,
    deleteCloudinaryAssetsSafely,
    ensureCloudinaryReady,
    CMS_DEFAULT_MAX_FILE_SIZE
} from "../services/cmsAsset.service.js";

// Roles that can access schools: superadmin, admin, manager
const ALLOWED_SCHOOLS_ROLES = [1, 2, 3];

// Roles that can delete schools: superadmin only
const DELETE_SCHOOLS_ROLES = [1];
const ALLOWED_SCHOOL_IMAGE_TYPES = new Set(["logo", "thumbnail"]);
const ALLOWED_IMAGE_MIME_TYPES = DEFAULT_IMAGE_MIME_TYPES;
const DEFAULT_SCHOOL_IMAGE_MAX_FILE_SIZE = CMS_DEFAULT_MAX_FILE_SIZE;
const configuredSchoolImageMaxFileSize = Number(process.env.CLOUDINARY_MAX_FILE_SIZE || CMS_DEFAULT_MAX_FILE_SIZE);
const SCHOOL_IMAGE_MAX_FILE_SIZE = Number.isFinite(configuredSchoolImageMaxFileSize) && configuredSchoolImageMaxFileSize > 0
    ? configuredSchoolImageMaxFileSize
    : DEFAULT_SCHOOL_IMAGE_MAX_FILE_SIZE;

// Get all schools with region, type, and review info
export const getSchools = async (req, res) => {
    try {
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view schools
        if (!ALLOWED_SCHOOLS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/schools',
                'GET',
                'schools.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view schools." 
            });
        }

        // Build query with filters
        let query = `
            SELECT 
                s.id,
                s.name,
                s.name_en,
                s.slug,
                s.location,
                s.phone,
                s.fax,
                s.email,
                s.website,
                s.tuition_per_year,
                s.class_size,
                s.visa_success_rate,
                s.intake_months,
                s.features,
                s.status,
                s.logo_url,
                s.thumbnail_url,
                s.rating,
                s.review_count,
                s.created_at,
                s.updated_at,
                r.name as region_name,
                r.slug as region_slug,
                st.name as type_name,
                st.slug as type_slug
            FROM schools s
            LEFT JOIN regions r ON s.region_id = r.id
            LEFT JOIN school_types st ON s.type_id = st.id
        `;

        const { status, region_id, type_id, search, min_rating } = req.query;
        const conditions = [];
        const values = [];
        let paramCount = 1;

        // Filter by status
        if (status) {
            conditions.push(`s.status = $${paramCount}`);
            values.push(status);
            paramCount++;
        }

        // Filter by region
        if (region_id) {
            conditions.push(`s.region_id = $${paramCount}`);
            values.push(parseInt(region_id));
            paramCount++;
        }

        // Filter by type
        if (type_id) {
            conditions.push(`s.type_id = $${paramCount}`);
            values.push(parseInt(type_id));
            paramCount++;
        }

        // Search in name and location
        if (search) {
            conditions.push(`(s.name ILIKE $${paramCount} OR s.location ILIKE $${paramCount})`);
            values.push(`%${search}%`);
            paramCount++;
        }

        // Filter by minimum rating
        if (min_rating) {
            conditions.push(`s.rating >= $${paramCount}`);
            values.push(parseFloat(min_rating));
            paramCount++;
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY s.created_at DESC`;

        const result = await db.query(query, values);

        // Log data access for audit
        SecurityLogger.logDataAccess(
            currentUserId,
            'schools',
            'read',
            result.rows.length,
            { role: currentUserRole, filters: req.query }
        );

        logInfo('Schools retrieved successfully', {
            userId: currentUserId,
            userRole: currentUserRole,
            schoolsCount: result.rows.length,
            filters: req.query
        });

        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        logError('Get schools failed', error, {
            userId: req.user?.id,
            userRole: req.user?.role_id,
            filters: req.query
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get single school by ID
export const getSchoolById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view schools
        if (!ALLOWED_SCHOOLS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/schools/${id}`,
                'GET',
                'schools.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view schools." 
            });
        }

        const result = await db.query(`
            SELECT 
                s.*,
                r.name as region_name,
                r.slug as region_slug,
                st.name as type_name,
                st.slug as type_slug
            FROM schools s
            LEFT JOIN regions r ON s.region_id = r.id
            LEFT JOIN school_types st ON s.type_id = st.id
            WHERE s.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "School not found" 
            });
        }

        const school = result.rows[0];

        // Get school reviews
        const reviewsResult = await db.query(`
            SELECT * FROM school_reviews 
            WHERE school_id = $1 
            ORDER BY created_at DESC
        `, [id]);

        school.reviews = reviewsResult.rows;

        res.json({
            success: true,
            data: school
        });

    } catch (error) {
        logError('Get school by ID failed', error, {
            requestedSchoolId: req.params.id,
            requesterId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Create new school
export const createSchool = async (req, res) => {
    try {
        // Sanitize input data
        const sanitizedData = InputSanitizer.sanitizeSchoolData(req.body);
        const { 
            name, 
            name_en,
            slug,
            location,
            phone,
            fax,
            email,
            website,
            tuition_per_year,
            class_size,
            visa_success_rate,
            intake_months,
            features,
            region_id,
            type_id,
            status,
            logo_url,
            thumbnail_url,
            rating,
            review_count
        } = sanitizedData;
        const incomingAssetPublicIds = {
            [MEDIA_FIELD_NAMES.schoolLogoUrl]: String(req.body?.logoAssetPublicId || "").trim(),
            [MEDIA_FIELD_NAMES.schoolThumbnailUrl]: String(req.body?.thumbnailAssetPublicId || "").trim()
        };
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        logInfo('School creation attempt', {
            createdBy: currentUserId,
            creatorRole: currentUserRole,
            data: { name, slug, region_id, type_id }
        });

        // Check if user has permission to create schools
        if (!ALLOWED_SCHOOLS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/schools',
                'POST',
                'schools.create'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot create schools." 
            });
        }

        // Validate required fields
        if (!name || !name_en || !location || tuition_per_year === undefined || visa_success_rate === undefined || !region_id || !type_id) {
            return res.status(400).json({
                success: false,
                message: "Missing required school fields",
                errors: {
                    name: !name ? "Ten truong la bat buoc" : "",
                    name_en: !name_en ? "Ten truong tieng Anh la bat buoc" : "",
                    location: !location ? "Dia chi la bat buoc" : "",
                    tuition_per_year: tuition_per_year === undefined ? "Hoc phi la bat buoc" : "",
                    visa_success_rate: visa_success_rate === undefined ? "Ti le visa la bat buoc" : "",
                    region_id: !region_id ? "Khu vuc la bat buoc" : "",
                    type_id: !type_id ? "Loai truong la bat buoc" : ""
                }
            });
        }

        // Generate slug if not provided
        let schoolSlug = slug;
        if (!schoolSlug) {
            schoolSlug = name.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        // Check slug uniqueness
        const slugCheck = await db.query(
            'SELECT id FROM schools WHERE slug = $1', 
            [schoolSlug]
        );

        if (slugCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "School slug already exists"
            });
        }

        // Validate region if provided
        if (region_id) {
            const regionCheck = await db.query(
                'SELECT id FROM regions WHERE id = $1', 
                [region_id]
            );

            if (regionCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid region ID"
                });
            }
        }

        // Validate school type if provided
        if (type_id) {
            const typeCheck = await db.query(
                'SELECT id FROM school_types WHERE id = $1', 
                [type_id]
            );

            if (typeCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid school type ID"
                });
            }
        }

        if (intake_months !== undefined && (!Array.isArray(intake_months) || intake_months.length === 0)) {
            return res.status(400).json({
                success: false,
                message: "Intake months must contain at least one value (1, 4, 7, 10)"
            });
        }

        // Create school
        const result = await db.query(`
            INSERT INTO schools (
                name, name_en, slug, location, phone, fax, email, website, tuition_per_year, class_size,
                visa_success_rate, intake_months, features, region_id, type_id, 
                status, logo_url, thumbnail_url, rating, review_count
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::smallint[], $13, $14, $15, $16, $17, $18, $19, $20)
            RETURNING *
        `, [
            name,
            name_en,
            schoolSlug,
            location || null,
            phone || null,
            fax || null,
            email || null,
            website || null,
            tuition_per_year || null,
            class_size || null,
            visa_success_rate || null,
            intake_months || null,
            features || null,
            region_id || null,
            type_id || null,
            status || 'pending',
            logo_url || null,
            thumbnail_url || null,
            rating !== undefined ? rating : null,
            review_count !== undefined ? review_count : 0
        ]);

        const newSchool = result.rows[0];

        const schoolOwnerKey = getSchoolOwnerKey(newSchool.id);
        const ownershipSyncResult = await syncMediaAssetOwnership({
            ownerType: MEDIA_OWNER_TYPES.schools,
            ownerKey: schoolOwnerKey,
            fieldMappings: [
                {
                    fieldName: MEDIA_FIELD_NAMES.schoolLogoUrl,
                    payloadKey: "logo_url"
                },
                {
                    fieldName: MEDIA_FIELD_NAMES.schoolThumbnailUrl,
                    payloadKey: "thumbnail_url"
                }
            ],
            payload: newSchool,
            incomingAssetPublicIds,
            userId: currentUserId,
            client: db
        });

        await deleteCloudinaryAssetsSafely(ownershipSyncResult.publicIdsToDelete, logError, {
            requesterId: currentUserId,
            schoolId: newSchool.id
        });

        // Audit log successful school creation
        auditLog('CREATE_SCHOOL', currentUserId, {
            schoolId: newSchool.id,
            schoolName: newSchool.name,
            schoolSlug: newSchool.slug,
            regionId: newSchool.region_id,
            typeId: newSchool.type_id,
            status: newSchool.status
        }, req);

        logInfo('School created successfully', {
            createdBy: currentUserId,
            schoolId: newSchool.id,
            schoolName: newSchool.name,
            status: newSchool.status
        });

        res.status(201).json({
            success: true,
            message: "School created successfully",
            data: newSchool
        });

    } catch (error) {
        logError('Create school failed', error, {
            createdBy: req.user?.id,
            targetData: req.body ? { ...req.body } : {}
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Update school
export const updateSchool = async (req, res) => {
    try {
        const { id } = req.params;
        const sanitizedData = InputSanitizer.sanitizeSchoolData(req.body);
        const { 
            name, 
            name_en,
            slug,
            location,
            phone,
            fax,
            email,
            website,
            tuition_per_year,
            class_size,
            visa_success_rate,
            intake_months,
            features,
            region_id,
            type_id,
            status,
            logo_url,
            thumbnail_url,
            rating,
            review_count
        } = sanitizedData;
        const incomingAssetPublicIds = {
            [MEDIA_FIELD_NAMES.schoolLogoUrl]: String(req.body?.logoAssetPublicId || "").trim(),
            [MEDIA_FIELD_NAMES.schoolThumbnailUrl]: String(req.body?.thumbnailAssetPublicId || "").trim()
        };
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to update schools
        if (!ALLOWED_SCHOOLS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/schools/${id}`,
                'PUT',
                'schools.update'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot update schools." 
            });
        }

        // Get the target school
        const schoolResult = await db.query(
            'SELECT * FROM schools WHERE id = $1', 
            [id]
        );

        if (schoolResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "School not found"
            });
        }

        const existingSchool = schoolResult.rows[0];

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
                'SELECT id FROM schools WHERE slug = $1 AND id != $2', 
                [slug, id]
            );

            if (slugCheck.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "School slug already exists"
                });
            }

            updateData.slug = slug;
            updates.push(`slug = $${paramCount}`);
            values.push(slug);
            paramCount++;
        }

        if (location !== undefined) {
            updateData.location = location;
            updates.push(`location = $${paramCount}`);
            values.push(location || null);
            paramCount++;
        }

        if (name_en !== undefined) {
            updateData.name_en = name_en;
            updates.push(`name_en = $${paramCount}`);
            values.push(name_en || null);
            paramCount++;
        }

        if (phone !== undefined) {
            updateData.phone = phone;
            updates.push(`phone = $${paramCount}`);
            values.push(phone || null);
            paramCount++;
        }

        if (fax !== undefined) {
            updateData.fax = fax;
            updates.push(`fax = $${paramCount}`);
            values.push(fax || null);
            paramCount++;
        }

        if (email !== undefined) {
            updateData.email = email;
            updates.push(`email = $${paramCount}`);
            values.push(email || null);
            paramCount++;
        }

        if (website !== undefined) {
            updateData.website = website;
            updates.push(`website = $${paramCount}`);
            values.push(website || null);
            paramCount++;
        }

        if (tuition_per_year !== undefined) {
            updateData.tuition_per_year = tuition_per_year;
            updates.push(`tuition_per_year = $${paramCount}`);
            values.push(tuition_per_year || null);
            paramCount++;
        }

        if (class_size !== undefined) {
            updateData.class_size = class_size;
            updates.push(`class_size = $${paramCount}`);
            values.push(class_size || null);
            paramCount++;
        }

        if (visa_success_rate !== undefined) {
            updateData.visa_success_rate = visa_success_rate;
            updates.push(`visa_success_rate = $${paramCount}`);
            values.push(visa_success_rate || null);
            paramCount++;
        }

        if (features !== undefined) {
            updateData.features = features;
            updates.push(`features = $${paramCount}`);
            values.push(features || null);
            paramCount++;
        }

        if (intake_months !== undefined) {
            if (!Array.isArray(intake_months) || intake_months.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Intake months must contain at least one value (1, 4, 7, 10)"
                });
            }

            updateData.intake_months = intake_months;
            updates.push(`intake_months = $${paramCount}`);
            values.push(intake_months.length ? intake_months : null);
            paramCount++;
        }

        if (region_id !== undefined) {
            if (region_id) {
                // Validate region exists
                const regionCheck = await db.query(
                    'SELECT id FROM regions WHERE id = $1', 
                    [region_id]
                );

                if (regionCheck.rows.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid region ID"
                    });
                }
            }

            updateData.region_id = region_id;
            updates.push(`region_id = $${paramCount}`);
            values.push(region_id || null);
            paramCount++;
        }

        if (type_id !== undefined) {
            if (type_id) {
                // Validate school type exists
                const typeCheck = await db.query(
                    'SELECT id FROM school_types WHERE id = $1', 
                    [type_id]
                );

                if (typeCheck.rows.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid school type ID"
                    });
                }
            }

            updateData.type_id = type_id;
            updates.push(`type_id = $${paramCount}`);
            values.push(type_id || null);
            paramCount++;
        }

        if (status !== undefined) {
            const validStatuses = ['partner', 'active', 'paused', 'pending'];
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

        if (logo_url !== undefined) {
            updateData.logo_url = logo_url;
            updates.push(`logo_url = $${paramCount}`);
            values.push(logo_url || null);
            paramCount++;
        }

        if (thumbnail_url !== undefined) {
            updateData.thumbnail_url = thumbnail_url;
            updates.push(`thumbnail_url = $${paramCount}`);
            values.push(thumbnail_url || null);
            paramCount++;
        }

        if (rating !== undefined) {
            updateData.rating = rating;
            updates.push(`rating = $${paramCount}`);
            values.push(rating);
            paramCount++;
        }

        if (review_count !== undefined) {
            updateData.review_count = review_count;
            updates.push(`review_count = $${paramCount}`);
            values.push(review_count);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }

        // Add updated_at
        updates.push(`updated_at = NOW()`);
        values.push(id);

        // Execute update
        const updateQuery = `
            UPDATE schools 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(updateQuery, values);
        const updatedSchool = result.rows[0];

        const ownershipSyncResult = await syncMediaAssetOwnership({
            ownerType: MEDIA_OWNER_TYPES.schools,
            ownerKey: getSchoolOwnerKey(id),
            fieldMappings: [
                {
                    fieldName: MEDIA_FIELD_NAMES.schoolLogoUrl,
                    payloadKey: "logo_url"
                },
                {
                    fieldName: MEDIA_FIELD_NAMES.schoolThumbnailUrl,
                    payloadKey: "thumbnail_url"
                }
            ],
            payload: updatedSchool,
            incomingAssetPublicIds,
            userId: currentUserId,
            client: db
        });

        await deleteCloudinaryAssetsSafely(ownershipSyncResult.publicIdsToDelete, logError, {
            requesterId: currentUserId,
            schoolId: id
        });

        // Audit log successful school update
        auditLog('UPDATE_SCHOOL', currentUserId, {
            schoolId: id,
            schoolName: updatedSchool.name,
            updatedFields: Object.keys(updateData),
            previousStatus: existingSchool.status,
            newStatus: updatedSchool.status
        }, req);

        logInfo('School updated successfully', {
            updatedBy: currentUserId,
            schoolId: id,
            updatedFields: Object.keys(updateData)
        });

        res.json({
            success: true,
            message: "School updated successfully",
            data: updatedSchool
        });

    } catch (error) {
        logError('Update school failed', error, {
            updatedBy: req.user?.id,
            schoolId: req.params?.id,
            updateData: req.body
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Delete school
export const deleteSchool = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to delete schools (only superadmin)
        if (!DELETE_SCHOOLS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/schools/${id}`,
                'DELETE',
                'schools.delete'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only superadmin can delete schools." 
            });
        }

        // Get the target school
        const schoolResult = await db.query(
            'SELECT * FROM schools WHERE id = $1', 
            [id]
        );

        if (schoolResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "School not found"
            });
        }

        const targetSchool = schoolResult.rows[0];

        const schoolOwnerKey = getSchoolOwnerKey(id);
        const existingAssetRefs = await getMediaAssetRefsByOwner({
            ownerType: MEDIA_OWNER_TYPES.schools,
            ownerKey: schoolOwnerKey,
            client: db
        });

        // Delete school (CASCADE will handle related tables)
        await db.query('DELETE FROM schools WHERE id = $1', [id]);

        for (const fieldName of [MEDIA_FIELD_NAMES.schoolLogoUrl, MEDIA_FIELD_NAMES.schoolThumbnailUrl]) {
            await deleteMediaAssetRef({
                ownerType: MEDIA_OWNER_TYPES.schools,
                ownerKey: schoolOwnerKey,
                fieldName,
                client: db
            });
        }

        await deleteCloudinaryAssetsSafely(existingAssetRefs.map((item) => item.public_id), logError, {
            requesterId: currentUserId,
            schoolId: id
        });

        // Audit log successful school deletion
        auditLog('DELETE_SCHOOL', currentUserId, {
            schoolId: id,
            schoolName: targetSchool.name,
            schoolSlug: targetSchool.slug
        }, req);

        // Security log for school deletion
        SecurityLogger.logSecurityAction(
            null, // No target user ID for school
            currentUserId,
            'delete_school',
            'Superadmin deletion',
            req.ip
        );

        logInfo('School deleted successfully', {
            deletedBy: currentUserId,
            schoolId: id,
            schoolName: targetSchool.name
        });

        res.json({
            success: true,
            message: "School deleted successfully"
        });

    } catch (error) {
        logError('Delete school failed', error, {
            deletedBy: req.user?.id,
            schoolId: req.params?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get schools statistics
export const getSchoolsStats = async (req, res) => {
    try {
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view stats
        if (!ALLOWED_SCHOOLS_ROLES.includes(currentUserRole)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot view schools statistics." 
            });
        }

        const statusResult = await db.query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM schools
            GROUP BY status
            ORDER BY 
                CASE status
                    WHEN 'partner' THEN 1
                    WHEN 'active' THEN 2
                    WHEN 'paused' THEN 3
                    WHEN 'pending' THEN 4
                END
        `);

        const totalResult = await db.query('SELECT COUNT(*) as total FROM schools');

        const regionResult = await db.query(`
            SELECT 
                r.name as region_name,
                COUNT(s.id) as schools_count
            FROM regions r
            LEFT JOIN schools s ON r.id = s.region_id
            GROUP BY r.id, r.name
            ORDER BY schools_count DESC
        `);

        const typeResult = await db.query(`
            SELECT 
                st.name as type_name,
                COUNT(s.id) as schools_count
            FROM school_types st
            LEFT JOIN schools s ON st.id = s.type_id
            GROUP BY st.id, st.name
            ORDER BY schools_count DESC
        `);

        res.json({
            success: true,
            data: {
                byStatus: statusResult.rows,
                byRegion: regionResult.rows,
                byType: typeResult.rows,
                total: parseInt(totalResult.rows[0].total)
            }
        });

    } catch (error) {
        logError('Get schools stats failed', error, {
            requesterId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

export const uploadSchoolImage = async (req, res) => {
    const currentUserRole = req.user?.role_id;
    const currentUserId = req.user?.id;

    try {
        if (!ALLOWED_SCHOOLS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                "/api/schools/upload-image",
                "POST",
                "schools.upload"
            );

            return res.status(403).json({
                success: false,
                message: "Access denied. You cannot upload school images."
            });
        }

        ensureCloudinaryReady();

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image file"
            });
        }

        const imageTypeRaw = String(req.body?.type || "logo").trim().toLowerCase();
        const imageType = ALLOWED_SCHOOL_IMAGE_TYPES.has(imageTypeRaw) ? imageTypeRaw : "logo";
        validateImageUploadFile({
            file: req.file,
            allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
            maxFileSize: SCHOOL_IMAGE_MAX_FILE_SIZE,
            imageLabel: imageType
        });

        const folderRoot = String(process.env.CLOUDINARY_FOLDER || "duhocNB").trim() || "duhocNB";

        const uploadResult = await uploadImageToCloudinary({
            file: req.file,
            folder: `${folderRoot}/schools/${imageType}`,
            transformation: [{ quality: "auto", fetch_format: "auto" }]
        });

        return res.json({
            success: true,
            message: "Upload image success",
            data: {
                imageType,
                url: uploadResult.url,
                publicId: uploadResult.publicId,
                width: uploadResult.width,
                height: uploadResult.height,
                bytes: uploadResult.bytes,
                format: uploadResult.format
            }
        });
    } catch (error) {
        const isValidationError = String(error?.message || "").toLowerCase().includes("invalid")
            || String(error?.message || "").toLowerCase().includes("exceeds")
            || String(error?.message || "").toLowerCase().includes("please select");

        logError("Upload school image failed", error, {
            requesterId: currentUserId,
            imageType: req.body?.type
        });

        return res.status(isValidationError ? 400 : 500).json({
            success: false,
            message: error?.message || "Upload image failed"
        });
    }
};

export const deleteSchoolImage = async (req, res) => {
    const currentUserRole = req.user?.role_id;
    const currentUserId = req.user?.id;

    try {
        if (!ALLOWED_SCHOOLS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                "/api/schools/upload-image",
                "DELETE",
                "schools.upload.delete"
            );

            return res.status(403).json({
                success: false,
                message: "Access denied. You cannot delete uploaded school images."
            });
        }

        const publicId = String(req.body?.publicId || "").trim();
        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: "publicId is required"
            });
        }

        ensureCloudinaryReady();
        await deleteCloudinaryAssetByPublicId(publicId);

        return res.json({
            success: true,
            message: "Deleted uploaded image"
        });
    } catch (error) {
        logError("Delete school image failed", error, {
            requesterId: currentUserId
        });

        return res.status(500).json({
            success: false,
            message: error?.message || "Delete image failed"
        });
    }
};