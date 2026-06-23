import db from '../config/db.js'

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
