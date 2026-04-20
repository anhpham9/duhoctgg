import db from "../config/db.js";
import { logError, logInfo, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";

// Roles that can manage school reviews: superadmin, admin, manager
const MANAGE_REVIEWS_ROLES = [1, 2, 3];

// Get all school reviews
export const getSchoolReviews = async (req, res) => {
    try {
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view school reviews
        if (!MANAGE_REVIEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/school-reviews',
                'GET',
                'school_reviews.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view school reviews." 
            });
        }

        const { school_id, rating, nationality } = req.query;
        let query = `
            SELECT 
                sr.*,
                s.name as school_name
            FROM school_reviews sr
            LEFT JOIN schools s ON sr.school_id = s.id
        `;
        
        const conditions = [];
        const values = [];
        let paramCount = 1;

        // Filter by school
        if (school_id) {
            conditions.push(`sr.school_id = $${paramCount}`);
            values.push(parseInt(school_id));
            paramCount++;
        }

        // Filter by rating
        if (rating) {
            conditions.push(`sr.rating = $${paramCount}`);
            values.push(parseInt(rating));
            paramCount++;
        }

        // Filter by nationality
        if (nationality) {
            conditions.push(`sr.nationality ILIKE $${paramCount}`);
            values.push(`%${nationality}%`);
            paramCount++;
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY sr.created_at DESC`;

        const result = await db.query(query, values);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        logError('Get school reviews failed', error, {
            userId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get school review by ID
export const getSchoolReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view school reviews
        if (!MANAGE_REVIEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/school-reviews/${id}`,
                'GET',
                'school_reviews.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view school reviews." 
            });
        }

        const result = await db.query(`
            SELECT 
                sr.*,
                s.name as school_name
            FROM school_reviews sr
            LEFT JOIN schools s ON sr.school_id = s.id
            WHERE sr.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "School review not found" 
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        logError('Get school review by ID failed', error, {
            requestedReviewId: req.params.id,
            requesterId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Create new school review
export const createSchoolReview = async (req, res) => {
    try {
        // Sanitize input data
        const sanitizedData = InputSanitizer.sanitizeSchoolReviewData(req.body);
        const { 
            school_id,
            student_name,
            avatar_url,
            nationality,
            course_period,
            rating,
            content
        } = sanitizedData;
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        logInfo('School review creation attempt', {
            createdBy: currentUserId,
            creatorRole: currentUserRole,
            data: { school_id, student_name, rating }
        });

        // Check if user has permission to create school reviews
        if (!MANAGE_REVIEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/school-reviews',
                'POST',
                'school_reviews.create'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot create school reviews." 
            });
        }

        // Validate required fields
        if (!school_id || !student_name || !rating) {
            return res.status(400).json({
                success: false,
                message: "School ID, student name, and rating are required"
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

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

        // Create school review
        const result = await db.query(`
            INSERT INTO school_reviews (
                school_id, student_name, avatar_url, nationality, 
                course_period, rating, content
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            school_id,
            student_name,
            avatar_url || null,
            nationality || null,
            course_period || null,
            rating,
            content || null
        ]);

        const newReview = result.rows[0];

        // Update school rating and review count
        await updateSchoolRating(school_id);

        // Audit log successful school review creation
        auditLog('CREATE_SCHOOL_REVIEW', currentUserId, {
            reviewId: newReview.id,
            schoolId: newReview.school_id,
            rating: newReview.rating,
            studentName: newReview.student_name
        }, req);

        logInfo('School review created successfully', {
            createdBy: currentUserId,
            reviewId: newReview.id,
            schoolId: newReview.school_id,
            rating: newReview.rating
        });

        res.status(201).json({
            success: true,
            message: "School review created successfully",
            data: newReview
        });

    } catch (error) {
        logError('Create school review failed', error, {
            createdBy: req.user?.id,
            targetData: req.body ? { ...req.body } : {}
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Update school review
export const updateSchoolReview = async (req, res) => {
    try {
        const { id } = req.params;
        const sanitizedData = InputSanitizer.sanitizeSchoolReviewData(req.body);
        const { 
            student_name,
            avatar_url,
            nationality,
            course_period,
            rating,
            content
        } = sanitizedData;
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to update school reviews
        if (!MANAGE_REVIEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/school-reviews/${id}`,
                'PUT',
                'school_reviews.update'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot update school reviews." 
            });
        }

        // Get the target review
        const reviewResult = await db.query(
            'SELECT * FROM school_reviews WHERE id = $1', 
            [id]
        );

        if (reviewResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "School review not found"
            });
        }

        const existingReview = reviewResult.rows[0];

        // Build dynamic update query
        const updateData = {};
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (student_name !== undefined) {
            updateData.student_name = student_name;
            updates.push(`student_name = $${paramCount}`);
            values.push(student_name);
            paramCount++;
        }

        if (avatar_url !== undefined) {
            updateData.avatar_url = avatar_url;
            updates.push(`avatar_url = $${paramCount}`);
            values.push(avatar_url || null);
            paramCount++;
        }

        if (nationality !== undefined) {
            updateData.nationality = nationality;
            updates.push(`nationality = $${paramCount}`);
            values.push(nationality || null);
            paramCount++;
        }

        if (course_period !== undefined) {
            updateData.course_period = course_period;
            updates.push(`course_period = $${paramCount}`);
            values.push(course_period || null);
            paramCount++;
        }

        if (rating !== undefined) {
            // Validate rating range
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be between 1 and 5"
                });
            }
            updateData.rating = rating;
            updates.push(`rating = $${paramCount}`);
            values.push(rating);
            paramCount++;
        }

        if (content !== undefined) {
            updateData.content = content;
            updates.push(`content = $${paramCount}`);
            values.push(content || null);
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
            UPDATE school_reviews 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(updateQuery, values);
        const updatedReview = result.rows[0];

        // Update school rating if rating changed
        if (rating !== undefined && rating !== existingReview.rating) {
            await updateSchoolRating(existingReview.school_id);
        }

        // Audit log successful review update
        auditLog('UPDATE_SCHOOL_REVIEW', currentUserId, {
            reviewId: id,
            schoolId: updatedReview.school_id,
            updatedFields: Object.keys(updateData)
        }, req);

        logInfo('School review updated successfully', {
            updatedBy: currentUserId,
            reviewId: id,
            updatedFields: Object.keys(updateData)
        });

        res.json({
            success: true,
            message: "School review updated successfully",
            data: updatedReview
        });

    } catch (error) {
        logError('Update school review failed', error, {
            updatedBy: req.user?.id,
            reviewId: req.params?.id,
            updateData: req.body
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Delete school review
export const deleteSchoolReview = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to delete school reviews
        if (!MANAGE_REVIEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/school-reviews/${id}`,
                'DELETE',
                'school_reviews.delete'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot delete school reviews." 
            });
        }

        // Get the target review
        const reviewResult = await db.query(
            'SELECT * FROM school_reviews WHERE id = $1', 
            [id]
        );

        if (reviewResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "School review not found"
            });
        }

        const targetReview = reviewResult.rows[0];

        // Delete review
        await db.query('DELETE FROM school_reviews WHERE id = $1', [id]);

        // Update school rating after deletion
        await updateSchoolRating(targetReview.school_id);

        // Audit log successful review deletion
        auditLog('DELETE_SCHOOL_REVIEW', currentUserId, {
            reviewId: id,
            schoolId: targetReview.school_id,
            studentName: targetReview.student_name,
            rating: targetReview.rating
        }, req);

        logInfo('School review deleted successfully', {
            deletedBy: currentUserId,
            reviewId: id,
            schoolId: targetReview.school_id
        });

        res.json({
            success: true,
            message: "School review deleted successfully"
        });

    } catch (error) {
        logError('Delete school review failed', error, {
            deletedBy: req.user?.id,
            reviewId: req.params?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Helper function to update school rating and review count
async function updateSchoolRating(schoolId) {
    try {
        const result = await db.query(`
            SELECT 
                AVG(rating)::DECIMAL(2,1) as avg_rating,
                COUNT(*) as review_count
            FROM school_reviews 
            WHERE school_id = $1
        `, [schoolId]);

        const { avg_rating, review_count } = result.rows[0];

        await db.query(`
            UPDATE schools 
            SET rating = $1, review_count = $2
            WHERE id = $3
        `, [avg_rating || 0, review_count || 0, schoolId]);

        logInfo('School rating updated', {
            schoolId,
            avgRating: avg_rating,
            reviewCount: review_count
        });

    } catch (error) {
        logError('Update school rating failed', error, {
            schoolId
        });
    }
}