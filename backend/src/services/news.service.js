import db from "../config/db.js";

const toValidInt = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const getNewsListData = async ({ status, categoryId, authorId, search } = {}) => {
    let query = `
        SELECT
            n.id,
            n.title,
            n.slug,
            n.content,
            n.excerpt,
            n.thumbnail_url,
            n.status,
            n.is_featured,
            n.published_at,
            n.meta_title,
            n.meta_description,
            n.created_at,
            n.updated_at,
            c.name as category_name,
            c.slug as category_slug,
            u.name as author_name,
            u.username as author_username,
            COALESCE(nvs.view_count, 0) as view_count
        FROM news n
        LEFT JOIN categories c ON n.category_id = c.id
        LEFT JOIN users u ON n.author_id = u.id
        LEFT JOIN news_view_stats nvs ON n.id = nvs.news_id
    `;

    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (status) {
        conditions.push(`n.status = $${paramCount}`);
        values.push(status);
        paramCount++;
    }

    const validCategoryId = toValidInt(categoryId);
    if (validCategoryId) {
        conditions.push(`n.category_id = $${paramCount}`);
        values.push(validCategoryId);
        paramCount++;
    }

    const validAuthorId = toValidInt(authorId);
    if (validAuthorId) {
        conditions.push(`n.author_id = $${paramCount}`);
        values.push(validAuthorId);
        paramCount++;
    }

    if (search) {
        conditions.push(`(n.title ILIKE $${paramCount} OR n.content ILIKE $${paramCount})`);
        values.push(`%${search}%`);
        paramCount++;
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY n.created_at DESC";

    const result = await db.query(query, values);
    return result.rows;
};

export const getNewsByIdData = async (id) => {
    const result = await db.query(
        `
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
                n.is_featured,
                n.published_at,
                n.meta_title,
                n.meta_description,
                n.created_at,
                n.updated_at,
                c.name as category_name,
                c.slug as category_slug,
                u.name as author_name,
                u.username as author_username,
                COALESCE(nvs.view_count, 0) as view_count
            FROM news n
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            LEFT JOIN news_view_stats nvs ON n.id = nvs.news_id
            WHERE n.id = $1
        `,
        [id]
    );

    return result.rows[0] || null;
};

export const getPublicNewsListData = async ({ page = 1, limit = 6, search = "", categorySlug = "" } = {}) => {
    const safePage = Math.max(Number.parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 6, 1), 30);
    const offset = (safePage - 1) * safeLimit;

    const normalizedSearch = String(search || "").trim();
    const normalizedCategorySlug = String(categorySlug || "").trim();

    const whereConditions = ["n.status = 'published'"];
    const values = [];
    let paramCount = 1;

    if (normalizedCategorySlug) {
        whereConditions.push(`c.slug = $${paramCount}`);
        values.push(normalizedCategorySlug);
        paramCount++;
    }

    if (normalizedSearch) {
        whereConditions.push(`(n.title ILIKE $${paramCount} OR n.excerpt ILIKE $${paramCount} OR n.content ILIKE $${paramCount})`);
        values.push(`%${normalizedSearch}%`);
        paramCount++;
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    const listQuery = `
        SELECT
            n.id,
            n.title,
            n.slug,
            n.excerpt,
            n.thumbnail_url,
            n.published_at,
            n.created_at,
            c.name as category_name,
            c.slug as category_slug,
            u.name as author_name,
            COALESCE(nvs.view_count, 0) as view_count
        FROM news n
        LEFT JOIN categories c ON n.category_id = c.id
        LEFT JOIN users u ON n.author_id = u.id
        LEFT JOIN news_view_stats nvs ON n.id = nvs.news_id
        ${whereClause}
        ORDER BY COALESCE(n.published_at, n.created_at) DESC, n.id DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM news n
        LEFT JOIN categories c ON n.category_id = c.id
        ${whereClause}
    `;

    const [listResult, countResult] = await Promise.all([
        db.query(listQuery, [...values, safeLimit, offset]),
        db.query(countQuery, values)
    ]);

    const total = Number.parseInt(countResult.rows[0]?.total || "0", 10);
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    const [featuredResult, categoryResult, recentResult] = await Promise.all([
        db.query(`
            SELECT
                n.id,
                n.title,
                n.slug,
                n.excerpt,
                n.thumbnail_url,
                n.is_featured,
                n.published_at,
                c.name as category_name,
                c.slug as category_slug,
                u.name as author_name,
                COALESCE(nvs.view_count, 0) as view_count
            FROM news n
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            LEFT JOIN news_view_stats nvs ON n.id = nvs.news_id
            WHERE n.status = 'published' AND n.is_featured = TRUE
            ORDER BY COALESCE(n.updated_at, n.created_at) DESC
            LIMIT 1
        `),
        db.query(`
            SELECT
                c.id,
                c.name,
                c.slug,
                COUNT(n.id)::INTEGER as news_count
            FROM categories c
            LEFT JOIN news n ON n.category_id = c.id AND n.status = 'published'
            GROUP BY c.id, c.name, c.slug
            ORDER BY news_count DESC, c.name ASC
        `),
        db.query(`
            SELECT
                n.id,
                n.title,
                n.slug,
                n.thumbnail_url,
                n.published_at
            FROM news n
            WHERE n.status = 'published'
            ORDER BY COALESCE(n.published_at, n.created_at) DESC
            LIMIT 5
        `)
    ]);

    let featured = featuredResult.rows[0] || null;

    if (!featured) {
        const fallbackFeatured = await db.query(`
            SELECT
                n.id,
                n.title,
                n.slug,
                n.excerpt,
                n.thumbnail_url,
                n.is_featured,
                n.published_at,
                c.name as category_name,
                c.slug as category_slug,
                u.name as author_name,
                COALESCE(nvs.view_count, 0) as view_count
            FROM news n
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            LEFT JOIN news_view_stats nvs ON n.id = nvs.news_id
            WHERE n.status = 'published'
            ORDER BY COALESCE(n.published_at, n.created_at) DESC, n.id DESC
            LIMIT 1
        `);

        featured = fallbackFeatured.rows[0] || null;
    }

    return {
        data: listResult.rows,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages
        },
        featured,
        categories: categoryResult.rows,
        recent: recentResult.rows,
        filters: {
            search: normalizedSearch,
            category: normalizedCategorySlug || null
        }
    };
};

export const getPublicNewsDetailData = async (slug) => {
    const normalizedSlug = String(slug || "").trim();

    if (!normalizedSlug) {
        return null;
    }

    const articleResult = await db.query(
        `
            SELECT
                n.id,
                n.title,
                n.slug,
                n.content,
                n.excerpt,
                n.thumbnail_url,
                n.is_featured,
                n.published_at,
                n.created_at,
                n.meta_title,
                n.meta_description,
                n.category_id,
                c.name as category_name,
                c.slug as category_slug,
                u.name as author_name,
                COALESCE(nvs.view_count, 0) as view_count
            FROM news n
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            LEFT JOIN news_view_stats nvs ON n.id = nvs.news_id
            WHERE n.status = 'published' AND n.slug = $1
            LIMIT 1
        `,
        [normalizedSlug]
    );

    const article = articleResult.rows[0] || null;

    if (!article) {
        return null;
    }

    const articleDateExpr = "COALESCE(n.published_at, n.created_at)";

    const [relatedResult, recentResult, categoryResult, prevResult, nextResult] = await Promise.all([
        db.query(
            `
                SELECT
                    n.id,
                    n.title,
                    n.slug,
                    n.excerpt,
                    n.thumbnail_url,
                    n.published_at,
                    c.name as category_name,
                    c.slug as category_slug,
                    COALESCE(nvs.view_count, 0) as view_count
                FROM news n
                LEFT JOIN categories c ON n.category_id = c.id
                LEFT JOIN news_view_stats nvs ON n.id = nvs.news_id
                WHERE n.status = 'published'
                    AND n.id != $1
                    AND ($2::INT IS NULL OR n.category_id = $2)
                ORDER BY ${articleDateExpr} DESC, n.id DESC
                LIMIT 5
            `,
            [article.id, article.category_id || null]
        ),
        db.query(
            `
                SELECT
                    n.id,
                    n.title,
                    n.slug,
                    n.thumbnail_url,
                    n.published_at
                FROM news n
                WHERE n.status = 'published' AND n.id != $1
                ORDER BY ${articleDateExpr} DESC, n.id DESC
                LIMIT 5
            `,
            [article.id]
        ),
        db.query(
            `
                SELECT
                    c.id,
                    c.name,
                    c.slug,
                    COUNT(n.id)::INTEGER as news_count
                FROM categories c
                LEFT JOIN news n ON n.category_id = c.id AND n.status = 'published'
                GROUP BY c.id, c.name, c.slug
                ORDER BY news_count DESC, c.name ASC
            `
        ),
        db.query(
            `
                SELECT
                    n.id,
                    n.title,
                    n.slug
                FROM news n
                WHERE n.status = 'published'
                    AND ${articleDateExpr} < $1
                ORDER BY ${articleDateExpr} DESC, n.id DESC
                LIMIT 1
            `,
            [article.published_at || article.created_at]
        ),
        db.query(
            `
                SELECT
                    n.id,
                    n.title,
                    n.slug
                FROM news n
                WHERE n.status = 'published'
                    AND ${articleDateExpr} > $1
                ORDER BY ${articleDateExpr} ASC, n.id ASC
                LIMIT 1
            `,
            [article.published_at || article.created_at]
        )
    ]);

    return {
        data: article,
        related: relatedResult.rows,
        recent: recentResult.rows,
        categories: categoryResult.rows,
        navigation: {
            prev: prevResult.rows[0] || null,
            next: nextResult.rows[0] || null
        }
    };
};

export const setNewsFeaturedState = async ({ newsId, isFeatured }) => {
    const client = await db.getClient();

    try {
        await client.query("BEGIN");

        const targetResult = await client.query(
            `SELECT id, status, is_featured FROM news WHERE id = $1`,
            [newsId]
        );

        if (targetResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return { success: false, reason: "not_found" };
        }

        const target = targetResult.rows[0];

        if (isFeatured && target.status !== "published") {
            await client.query("ROLLBACK");
            return { success: false, reason: "invalid_status" };
        }

        if (isFeatured) {
            await client.query(
                `UPDATE news SET is_featured = FALSE WHERE is_featured = TRUE AND id != $1`,
                [newsId]
            );

            await client.query(
                `UPDATE news SET is_featured = TRUE, updated_at = NOW() WHERE id = $1`,
                [newsId]
            );
        } else {
            await client.query(
                `UPDATE news SET is_featured = FALSE, updated_at = NOW() WHERE id = $1`,
                [newsId]
            );
        }

        await client.query("COMMIT");
        return { success: true };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};
