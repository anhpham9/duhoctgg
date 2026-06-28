import db from '../config/db.js'

export const ensureAboutContentTableExists = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS about_content (
            id SERIAL PRIMARY KEY,
            section_key VARCHAR(50) UNIQUE NOT NULL,
            title VARCHAR(255) NOT NULL,
            subtitle VARCHAR(255),
            type VARCHAR(20) NOT NULL DEFAULT 'paragraph' CHECK (type IN ('paragraph', 'timeline')),
            content TEXT NOT NULL,
            timeline_items JSONB NOT NULL DEFAULT '[]'::jsonb,
            image_url TEXT,
            image_cloudinary_public_id VARCHAR(255),
            sort_order INT NOT NULL DEFAULT 0,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    `)

    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_about_content_section_key ON about_content(section_key)
    `)

    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_about_content_sort ON about_content(sort_order, is_active)
    `)

    await db.query(`
        ALTER TABLE about_content
        ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255)
    `)

    await db.query(`
        ALTER TABLE about_content
        ADD COLUMN IF NOT EXISTS type VARCHAR(20)
    `)

    await db.query(`
        UPDATE about_content
        SET type = 'paragraph'
        WHERE type = 'p'
    `)

    await db.query(`
        UPDATE about_content
        SET type = COALESCE(type, 'paragraph')
    `)

    await db.query(`
        ALTER TABLE about_content
        ALTER COLUMN type SET DEFAULT 'paragraph'
    `)

    await db.query(`
        ALTER TABLE about_content
        ALTER COLUMN type SET NOT NULL
    `)

    await db.query(`
        ALTER TABLE about_content
        DROP CONSTRAINT IF EXISTS about_content_type_check
    `)

    await db.query(`
        ALTER TABLE about_content
        ADD CONSTRAINT about_content_type_check CHECK (type IN ('paragraph', 'timeline'))
    `)

    await db.query(`
        ALTER TABLE about_content
        ADD COLUMN IF NOT EXISTS timeline_items JSONB NOT NULL DEFAULT '[]'::jsonb
    `)
}

export const ensureAboutMissionsTableExists = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS about_missions (
            id SERIAL PRIMARY KEY,
            icon VARCHAR(100),
            title VARCHAR(255) NOT NULL,
            type VARCHAR(20) NOT NULL DEFAULT 'paragraph' CHECK (type IN ('paragraph', 'list')),
            description TEXT NOT NULL,
            sort_order INT NOT NULL DEFAULT 0,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    `)

    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_about_missions_sort
        ON about_missions(sort_order, is_active)
    `)

    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_about_missions_active
        ON about_missions(is_active)
    `)
}
