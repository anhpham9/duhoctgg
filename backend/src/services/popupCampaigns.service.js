import db from "../config/db.js";

export const POPUP_PAGES = ["all", "home", "about", "schools", "news", "contact", "conditions"];
export const POPUP_POSITIONS = ["center", "bottom-right", "bottom-left", "top-right", "top-left", "fullscreen"];
export const POPUP_CLOSE_TYPES = ["session", "day", "always"];

export const ensurePopupCampaignsTableExists = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS popup_campaigns (
            id BIGSERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            desktop_image TEXT NOT NULL,
            mobile_image TEXT,
            link TEXT,
            page VARCHAR(50) NOT NULL CHECK (page IN ('all', 'home', 'about', 'schools', 'news', 'contact', 'conditions')),
            position VARCHAR(50) NOT NULL CHECK (position IN ('center', 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'fullscreen')),
            priority INTEGER NOT NULL DEFAULT 0,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            start_at TIMESTAMPTZ,
            end_at TIMESTAMPTZ,
            close_type VARCHAR(20) NOT NULL CHECK (close_type IN ('session', 'day', 'always')),
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CHECK (end_at IS NULL OR start_at IS NULL OR end_at >= start_at)
        )
    `);

    await db.query(`CREATE INDEX IF NOT EXISTS idx_popup_campaigns_active_page ON popup_campaigns(is_active, page)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_popup_campaigns_schedule ON popup_campaigns(start_at, end_at)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_popup_campaigns_priority ON popup_campaigns(priority DESC, created_at DESC)`);
};
