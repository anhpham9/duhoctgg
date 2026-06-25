import db from "../config/db.js";

export const ensureHomepageSectionsTableExists = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS homepage_sections (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            subtitle VARCHAR(255) NOT NULL,
            type VARCHAR(20) NOT NULL DEFAULT 'paragraph' CHECK (type IN ('paragraph', 'list', 'card')),
            description TEXT,
            contact_btn_show BOOLEAN NOT NULL DEFAULT false,
            contact_btn_text VARCHAR(100),
            paragraph_text TEXT,
            image_url TEXT,
            image_cloudinary_public_id VARCHAR(255),
            image_position SMALLINT NOT NULL DEFAULT 1 CHECK (image_position IN (0, 1)),
            list_icon VARCHAR(100),
            list_items JSONB NOT NULL DEFAULT '[]'::jsonb,
            card_desktop_columns SMALLINT NOT NULL DEFAULT 4,
            card_tablet_columns SMALLINT NOT NULL DEFAULT 2,
            card_layout VARCHAR(20) CHECK (card_layout IN ('bg-red', 'bg-white', 'border-top')) DEFAULT 'bg-red',
            card_items JSONB NOT NULL DEFAULT '[]'::jsonb,
            sort_order INT NOT NULL DEFAULT 0,
            is_active BOOLEAN NOT NULL DEFAULT true,
            CONSTRAINT chk_homepage_card_columns_by_type CHECK (
                (type = 'card' AND card_desktop_columns BETWEEN 1 AND 6 AND card_tablet_columns BETWEEN 1 AND 4)
                OR (type <> 'card')
            ),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    `);

    await db.query(`CREATE INDEX IF NOT EXISTS idx_homepage_sections_sort ON homepage_sections(sort_order, is_active)`);

    await db.query(`ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS paragraph_text TEXT`);
    await db.query(`ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS image_url TEXT`);
    await db.query(`ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS image_cloudinary_public_id VARCHAR(255)`);
    await db.query(`ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS image_position SMALLINT NOT NULL DEFAULT 1`);
    await db.query(`ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS list_icon VARCHAR(100)`);
    await db.query(`ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS card_desktop_columns SMALLINT NOT NULL DEFAULT 4`);
    await db.query(`ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS card_tablet_columns SMALLINT NOT NULL DEFAULT 2`);
    await db.query(`ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS list_items JSONB NOT NULL DEFAULT '[]'::jsonb`);
    await db.query(`ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS card_layout VARCHAR(20) DEFAULT 'bg-red'`);
    await db.query(`ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS card_items JSONB NOT NULL DEFAULT '[]'::jsonb`);

    await db.query(`ALTER TABLE homepage_sections DROP CONSTRAINT IF EXISTS chk_homepage_card_columns_by_type`);
    await db.query(`ALTER TABLE homepage_sections DROP CONSTRAINT IF EXISTS chk_homepage_image_position`);
    await db.query(`ALTER TABLE homepage_sections ADD CONSTRAINT chk_homepage_image_position CHECK (image_position IN (0, 1))`);
    await db.query(`ALTER TABLE homepage_sections ADD CONSTRAINT chk_homepage_card_columns_by_type CHECK ((type = 'card' AND card_desktop_columns BETWEEN 1 AND 6 AND card_tablet_columns BETWEEN 1 AND 4) OR (type <> 'card'))`);
};
