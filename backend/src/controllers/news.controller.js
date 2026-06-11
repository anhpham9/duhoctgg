import db from "../config/db.js";
import { logError, logInfo, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";

// Roles that can access news: superadmin, admin, manager, editor
const ALLOWED_NEWS_ROLES = [1, 2, 3, 4];

// Roles that can delete news: superadmin, admin only
const DELETE_NEWS_ROLES = [1, 2];

// Roles that can change status: superadmin, admin, manager
const STATUS_CHANGE_ROLES = [1, 2, 3];

const NEWS_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_NEWS_STATUSES = ['draft', 'published', 'archived'];

const normalizeNewsSlug = (text = '') => {
    return String(text)
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
};

const isValidHttpUrl = (value) => {
    try {
        const url = new URL(String(value));
        return ['http:', 'https:'].includes(url.protocol);
    } catch {
        return false;
    }
};

const validateNewsPayload = (payload = {}, { isUpdate = false } = {}) => {
    const errors = {};

    const shouldValidateRequired = !isUpdate;

    if (shouldValidateRequired || Object.prototype.hasOwnProperty.call(payload, 'title')) {
        const title = String(payload.title || '').trim();
        if (!title) {
            errors.title = 'Tiêu đề là bắt buộc';
        } else if (title.length < 3) {
            errors.title = 'Tiêu đề phải có ít nhất 3 ký tự';
        } else if (title.length > 255) {
            errors.title = 'Tiêu đề không được vượt quá 255 ký tự';
        }
    }

    if (shouldValidateRequired || Object.prototype.hasOwnProperty.call(payload, 'content')) {
        const content = String(payload.content || '').trim();
        if (!content) {
            errors.content = 'Nội dung là bắt buộc';
        } else if (content.length < 10) {
            errors.content = 'Nội dung phải có ít nhất 10 ký tự';
        } else if (content.length > 50000) {
            errors.content = 'Nội dung không được vượt quá 50000 ký tự';
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'slug')) {
        const rawSlug = payload.slug;
        if (rawSlug !== undefined && rawSlug !== null && String(rawSlug).trim() !== '') {
            const slug = String(rawSlug).trim().toLowerCase();
            if (slug.length < 2) {
                errors.slug = 'Slug phải có ít nhất 2 ký tự';
            } else if (slug.length > 255) {
                errors.slug = 'Slug không được vượt quá 255 ký tự';
            } else if (!NEWS_SLUG_PATTERN.test(slug)) {
                errors.slug = 'Slug chỉ gồm chữ thường, số và dấu gạch ngang';
            }
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'excerpt') && payload.excerpt !== undefined && payload.excerpt !== null) {
        const excerpt = String(payload.excerpt).trim();
        if (!excerpt) {
            errors.excerpt = 'Mô tả ngắn là bắt buộc';
        }
        if (excerpt.length > 500) {
            errors.excerpt = 'Mô tả ngắn không được vượt quá 500 ký tự';
        }
    } else if (!isUpdate) {
        errors.excerpt = 'Mô tả ngắn là bắt buộc';
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'thumbnail_url') && payload.thumbnail_url !== undefined && payload.thumbnail_url !== null && String(payload.thumbnail_url).trim() !== '') {
        if (!isValidHttpUrl(payload.thumbnail_url)) {
            errors.thumbnail_url = 'Thumbnail URL không hợp lệ (chỉ chấp nhận http/https)';
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'category_id') && payload.category_id !== undefined && payload.category_id !== null && String(payload.category_id).trim() !== '') {
        const categoryId = Number(payload.category_id);
        if (!Number.isInteger(categoryId) || categoryId < 1) {
            errors.category_id = 'Danh mục không hợp lệ';
        }
    } else if (!isUpdate) {
        errors.category_id = 'Danh mục là bắt buộc';
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'status') && payload.status !== undefined && payload.status !== null && String(payload.status).trim() !== '') {
        const status = String(payload.status).trim().toLowerCase();
        if (!VALID_NEWS_STATUSES.includes(status)) {
            errors.status = 'Trạng thái không hợp lệ';
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'published_at') && payload.published_at !== undefined && payload.published_at !== null && String(payload.published_at).trim() !== '') {
        const publishedAt = new Date(payload.published_at);
        if (isNaN(publishedAt.getTime())) {
            errors.published_at = 'Ngày xuất bản không hợp lệ';
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'meta_title') && payload.meta_title !== undefined && payload.meta_title !== null) {
        const metaTitle = String(payload.meta_title).trim();
        if (metaTitle.length > 255) {
            errors.meta_title = 'Meta title không được vượt quá 255 ký tự';
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'meta_description') && payload.meta_description !== undefined && payload.meta_description !== null) {
        const metaDescription = String(payload.meta_description).trim();
        if (metaDescription.length > 500) {
            errors.meta_description = 'Meta description không được vượt quá 500 ký tự';
        }
    }

    return errors;
};

// Get all news with author and category info
export const getNews = async (req, res) => {
    try {
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view news
        if (!ALLOWED_NEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/news',
                'GET',
                'news.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view news." 
            });
        }

        // Build query with filters
        let query = `
            SELECT 
                n.id,
                n.title,
                n.slug,
                n.content,
                n.excerpt,
                n.thumbnail_url,
                n.status,
                n.published_at,
                n.meta_title,
                n.meta_description,
                n.created_at,
                n.updated_at,
                c.name as category_name,
                c.slug as category_slug,
                u.name as author_name,
                u.username as author_username,
                nvs.view_count
            FROM news n
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            LEFT JOIN news_view_stats nvs ON n.id = nvs.news_id
        `;

        const { status, category_id, author_id, search } = req.query;
        const conditions = [];
        const values = [];
        let paramCount = 1;

        // Filter by status
        if (status) {
            conditions.push(`n.status = $${paramCount}`);
            values.push(status);
            paramCount++;
        }

        // Filter by category
        if (category_id) {
            conditions.push(`n.category_id = $${paramCount}`);
            values.push(parseInt(category_id));
            paramCount++;
        }

        // Filter by author
        if (author_id) {
            conditions.push(`n.author_id = $${paramCount}`);
            values.push(parseInt(author_id));
            paramCount++;
        }

        // Search in title and content
        if (search) {
            conditions.push(`(n.title ILIKE $${paramCount} OR n.content ILIKE $${paramCount})`);
            values.push(`%${search}%`);
            paramCount++;
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY n.created_at DESC`;

        const result = await db.query(query, values);

        // Log data access for audit
        SecurityLogger.logDataAccess(
            currentUserId,
            'news',
            'read',
            result.rows.length,
            { role: currentUserRole, filters: req.query }
        );

        logInfo('News retrieved successfully', {
            userId: currentUserId,
            userRole: currentUserRole,
            newsCount: result.rows.length,
            filters: req.query
        });

        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        logError('Get news failed', error, {
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

// Get single news by ID
export const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view news
        if (!ALLOWED_NEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/news/${id}`,
                'GET',
                'news.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view news." 
            });
        }

        const result = await db.query(`
            SELECT 
                n.id,
                n.title,
                n.slug,
                n.content,
                n.excerpt,
                n.thumbnail_url,
                n.category_id,
                n.author_id,
                n.status,
                n.published_at,
                n.meta_title,
                n.meta_description,
                n.created_at,
                n.updated_at,
                c.name as category_name,
                c.slug as category_slug,
                u.name as author_name,
                u.username as author_username,
                nvs.view_count
            FROM news n
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            LEFT JOIN news_view_stats nvs ON n.id = nvs.news_id
            WHERE n.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "News not found" 
            });
        }

        const news = result.rows[0];

        res.json({
            success: true,
            data: news
        });

    } catch (error) {
        logError('Get news by ID failed', error, {
            requestedNewsId: req.params.id,
            requesterId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Create new news
export const createNews = async (req, res) => {
    try {
        const validationErrors = validateNewsPayload(req.body || {}, { isUpdate: false });
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu bài viết không hợp lệ',
                errors: validationErrors
            });
        }

        // Sanitize input data
        const sanitizedData = InputSanitizer.sanitizeNewsData(req.body);
        const { 
            title, 
            slug,
            content,
            excerpt,
            thumbnail_url,
            category_id,
            published_at,
            meta_title,
            meta_description
        } = sanitizedData;
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        logInfo('News creation attempt', {
            createdBy: currentUserId,
            creatorRole: currentUserRole,
            data: { title, slug, category_id }
        });

        // Check if user has permission to create news
        if (!ALLOWED_NEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/news',
                'POST',
                'news.create'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot create news." 
            });
        }

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu bài viết không hợp lệ',
                errors: {
                    title: !title ? 'Tiêu đề là bắt buộc' : undefined,
                    content: !content ? 'Nội dung là bắt buộc' : undefined
                }
            });
        }

        // Generate slug if not provided
        let newsSlug = slug;
        if (!newsSlug) {
            newsSlug = normalizeNewsSlug(title);
        }

        const sanitizedValidationErrors = validateNewsPayload(
            {
                ...sanitizedData,
                slug: newsSlug,
                title,
                content
            },
            { isUpdate: false }
        );

        if (Object.keys(sanitizedValidationErrors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu bài viết không hợp lệ',
                errors: sanitizedValidationErrors
            });
        }

        // Check slug uniqueness within category
        const slugCheck = await db.query(
            'SELECT id FROM news WHERE slug = $1 AND category_id IS NOT DISTINCT FROM $2', 
            [newsSlug, category_id || null]
        );

        if (slugCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Slug đã tồn tại trong danh mục này',
                errors: {
                    slug: 'Slug đã tồn tại trong danh mục này'
                }
            });
        }

        // Validate category if provided
        if (category_id) {
            const categoryCheck = await db.query(
                'SELECT id FROM categories WHERE id = $1', 
                [category_id]
            );

            if (categoryCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Danh mục không hợp lệ',
                    errors: {
                        category_id: 'Danh mục không tồn tại'
                    }
                });
            }
        }

        // Determine status based on user role
        // Editor creates with draft status, others can choose
        let status = 'draft';
        if (currentUserRole !== 4 && req.body.status) { // Not editor
            const validStatuses = ['draft', 'published', 'archived'];
            if (validStatuses.includes(req.body.status)) {
                status = req.body.status;
            }
        }

        // Resolve published_at based on payload/status
        const resolvedPublishedAt = published_at || new Date().toISOString();
        const resolvedMetaTitle = meta_title || title;
        const resolvedMetaDescription = meta_description || excerpt;

        // Create news
        const result = await db.query(`
            INSERT INTO news (
                title, slug, content, excerpt, thumbnail_url,
                category_id, author_id, status, published_at, meta_title, meta_description
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [
            title,
            newsSlug,
            content,
            excerpt || null,
            thumbnail_url || null,
            category_id || null,
            currentUserId, // author_id
            status,
            resolvedPublishedAt,
            resolvedMetaTitle,
            resolvedMetaDescription
        ]);

        const newNews = result.rows[0];

        // Initialize view stats
        await db.query(
            'INSERT INTO news_view_stats (news_id, view_count) VALUES ($1, 0)',
            [newNews.id]
        );

        // Audit log successful news creation
        auditLog('CREATE_NEWS', currentUserId, {
            newsId: newNews.id,
            newsTitle: newNews.title,
            newsSlug: newNews.slug,
            categoryId: newNews.category_id,
            status: newNews.status
        }, req);

        logInfo('News created successfully', {
            createdBy: currentUserId,
            newsId: newNews.id,
            newsTitle: newNews.title,
            status: newNews.status
        });

        res.status(201).json({
            success: true,
            message: "News created successfully",
            data: newNews
        });

    } catch (error) {
        logError('Create news failed', error, {
            createdBy: req.user?.id,
            targetData: req.body ? { ...req.body } : {}
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Update news
export const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const validationErrors = validateNewsPayload(req.body || {}, { isUpdate: true });
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu bài viết không hợp lệ',
                errors: validationErrors
            });
        }

        const sanitizedData = InputSanitizer.sanitizeNewsData(req.body);
        const { 
            title, 
            slug,
            content,
            excerpt,
            thumbnail_url,
            category_id,
            status,
            published_at,
            meta_title,
            meta_description
        } = sanitizedData;
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to update news
        if (!ALLOWED_NEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/news/${id}`,
                'PUT',
                'news.update'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot update news." 
            });
        }

        // Get the target news
        const newsResult = await db.query(
            'SELECT * FROM news WHERE id = $1', 
            [id]
        );

        if (newsResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "News not found"
            });
        }

        const existingNews = newsResult.rows[0];

        // Check if editor is trying to change status
        if (currentUserRole === 4 && status && status !== existingNews.status) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/news/${id}`,
                'PUT',
                'news.change_status'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Editors cannot change news status." 
            });
        }

        // Build dynamic update query
        const updateData = {};
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (title !== undefined) {
            updateData.title = title;
            updates.push(`title = $${paramCount}`);
            values.push(title);
            paramCount++;
        }

        if (slug !== undefined) {
            // Check slug uniqueness within category
            const currentCategoryId = category_id !== undefined ? category_id : existingNews.category_id;
            const slugCheck = await db.query(
                'SELECT id FROM news WHERE slug = $1 AND category_id IS NOT DISTINCT FROM $2 AND id != $3', 
                [slug, currentCategoryId || null, id]
            );

            if (slugCheck.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Slug đã tồn tại trong danh mục này',
                    errors: {
                        slug: 'Slug đã tồn tại trong danh mục này'
                    }
                });
            }

            updateData.slug = slug;
            updates.push(`slug = $${paramCount}`);
            values.push(slug);
            paramCount++;
        }

        if (content !== undefined) {
            updateData.content = content;
            updates.push(`content = $${paramCount}`);
            values.push(content);
            paramCount++;
        }

        if (excerpt !== undefined) {
            updateData.excerpt = excerpt;
            updates.push(`excerpt = $${paramCount}`);
            values.push(excerpt || null);
            paramCount++;
        }

        if (thumbnail_url !== undefined) {
            updateData.thumbnail_url = thumbnail_url;
            updates.push(`thumbnail_url = $${paramCount}`);
            values.push(thumbnail_url || null);
            paramCount++;
        }

        if (category_id !== undefined) {
            if (category_id) {
                // Validate category exists
                const categoryCheck = await db.query(
                    'SELECT id FROM categories WHERE id = $1', 
                    [category_id]
                );

                if (categoryCheck.rows.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Danh mục không hợp lệ',
                        errors: {
                            category_id: 'Danh mục không tồn tại'
                        }
                    });
                }
            }

            updateData.category_id = category_id;
            updates.push(`category_id = $${paramCount}`);
            values.push(category_id || null);
            paramCount++;
        }

        if (status !== undefined && STATUS_CHANGE_ROLES.includes(currentUserRole)) {
            const validStatuses = ['draft', 'published', 'archived'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạng thái không hợp lệ',
                    errors: {
                        status: 'Trạng thái không hợp lệ'
                    }
                });
            }
            updateData.status = status;
            updates.push(`status = $${paramCount}`);
            values.push(status);
            paramCount++;

            // Set published_at if status changed to published
            if (status === 'published' && existingNews.status !== 'published' && published_at === undefined) {
                updates.push(`published_at = NOW()`);
            }
        }

        if (published_at !== undefined && STATUS_CHANGE_ROLES.includes(currentUserRole)) {
            updateData.published_at = published_at;
            updates.push(`published_at = $${paramCount}`);
            values.push(published_at || null);
            paramCount++;
        }

        if (meta_title !== undefined) {
            updateData.meta_title = meta_title;
            updates.push(`meta_title = $${paramCount}`);
            values.push(meta_title || null);
            paramCount++;
        }

        if (meta_description !== undefined) {
            updateData.meta_description = meta_description;
            updates.push(`meta_description = $${paramCount}`);
            values.push(meta_description || null);
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
            UPDATE news 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(updateQuery, values);
        const updatedNews = result.rows[0];

        // Audit log successful news update
        auditLog('UPDATE_NEWS', currentUserId, {
            newsId: id,
            newsTitle: updatedNews.title,
            updatedFields: Object.keys(updateData),
            previousStatus: existingNews.status,
            newStatus: updatedNews.status
        }, req);

        logInfo('News updated successfully', {
            updatedBy: currentUserId,
            newsId: id,
            updatedFields: Object.keys(updateData)
        });

        res.json({
            success: true,
            message: "News updated successfully",
            data: updatedNews
        });

    } catch (error) {
        logError('Update news failed', error, {
            updatedBy: req.user?.id,
            newsId: req.params?.id,
            updateData: req.body
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Delete news
export const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to delete news (only superadmin, admin)
        if (!DELETE_NEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/news/${id}`,
                'DELETE',
                'news.delete'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot delete news." 
            });
        }

        // Get the target news
        const newsResult = await db.query(
            'SELECT * FROM news WHERE id = $1', 
            [id]
        );

        if (newsResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "News not found"
            });
        }

        const targetNews = newsResult.rows[0];

        // Delete news (CASCADE will handle related tables)
        await db.query('DELETE FROM news WHERE id = $1', [id]);

        // Audit log successful news deletion
        auditLog('DELETE_NEWS', currentUserId, {
            newsId: id,
            newsTitle: targetNews.title,
            newsSlug: targetNews.slug,
            authorId: targetNews.author_id
        }, req);

        // Security log for news deletion
        SecurityLogger.logSecurityAction(
            null, // No target user ID for news
            currentUserId,
            'delete_news',
            'Admin deletion',
            req.ip
        );

        logInfo('News deleted successfully', {
            deletedBy: currentUserId,
            newsId: id,
            newsTitle: targetNews.title
        });

        res.json({
            success: true,
            message: "News deleted successfully"
        });

    } catch (error) {
        logError('Delete news failed', error, {
            deletedBy: req.user?.id,
            newsId: req.params?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get news statistics
export const getNewsStats = async (req, res) => {
    try {
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view stats
        if (!ALLOWED_NEWS_ROLES.includes(currentUserRole)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot view news statistics." 
            });
        }

        const statusResult = await db.query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM news
            GROUP BY status
            ORDER BY 
                CASE status
                    WHEN 'draft' THEN 1
                    WHEN 'published' THEN 2
                    WHEN 'archived' THEN 3
                END
        `);

        const totalResult = await db.query('SELECT COUNT(*) as total FROM news');

        const categoryResult = await db.query(`
            SELECT 
                c.name as category_name,
                COUNT(n.id) as news_count
            FROM categories c
            LEFT JOIN news n ON c.id = n.category_id
            GROUP BY c.id, c.name
            ORDER BY news_count DESC
        `);

        res.json({
            success: true,
            data: {
                byStatus: statusResult.rows,
                byCategory: categoryResult.rows,
                total: parseInt(totalResult.rows[0].total)
            }
        });

    } catch (error) {
        logError('Get news stats failed', error, {
            requesterId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Track news view
export const trackNewsView = async (req, res) => {
    try {
        const { id } = req.params;
        const ip_address = req.ip;
        const user_agent = req.get('User-Agent');

        // Check if news exists
        const newsCheck = await db.query('SELECT id FROM news WHERE id = $1', [id]);
        if (newsCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "News not found"
            });
        }

        // Record view
        await db.query(`
            INSERT INTO news_views (news_id, ip_address, user_agent)
            VALUES ($1, $2, $3)
        `, [id, ip_address, user_agent]);

        // Update view stats (simple increment)
        await db.query(`
            INSERT INTO news_view_stats (news_id, view_count)
            VALUES ($1, 1)
            ON CONFLICT (news_id) 
            DO UPDATE SET view_count = news_view_stats.view_count + 1
        `, [id]);

        res.json({
            success: true,
            message: "View tracked successfully"
        });

    } catch (error) {
        logError('Track news view failed', error, {
            newsId: req.params?.id,
            ip: req.ip
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};