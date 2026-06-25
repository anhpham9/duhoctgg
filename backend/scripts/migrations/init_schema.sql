-- Bạn chạy file migration này bằng lệnh psql của PostgreSQL:

-- Đảm bảo đã tạo database và có user phù hợp.
-- Mở terminal, cd vào thư mục backend.
-- Chạy lệnh sau (thay đổi user/db nếu cần):
-- psql -U <db_user> -d <db_name> -f scripts/migrations/init_schema.sql
-- Ví dụ:
-- psql -U postgres -d duhocnb -f scripts/migrations/init_schema.sql

-- ======================== ROLES ========================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- ======================== PERMISSIONS ========================
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- ======================== ROLE_PERMISSIONS ========================
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ======================== USERS ========================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password TEXT NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id)
);

-- ======================== CATEGORIES ========================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ======================== NEWS ========================
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    thumbnail_url TEXT,
    category_id INTEGER REFERENCES categories(id),
    author_id BIGINT REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (slug, category_id)
);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news(is_featured);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category_id);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at);
CREATE INDEX IF NOT EXISTS idx_news_slug_category ON news(slug, category_id);

-- ======================== NEWS_VIEWS ========================
CREATE TABLE IF NOT EXISTS news_views (
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    viewed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ======================== NEWS_VIEW_STATS ========================
CREATE TABLE IF NOT EXISTS news_view_stats (
    news_id INTEGER PRIMARY KEY REFERENCES news(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0
);

-- ======================== REGIONS ========================
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- ======================== SCHOOL_TYPES ========================
CREATE TABLE IF NOT EXISTS school_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- ======================== SCHOOLS ========================
CREATE TABLE IF NOT EXISTS schools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    location TEXT,
    phone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(150),
    website VARCHAR(255),
    tuition_per_year INTEGER NOT NULL,
    class_size INTEGER,
    visa_success_rate NUMERIC(5,2) NOT NULL,
    features JSONB,
    region_id INTEGER REFERENCES regions(id),
    intake_months SMALLINT[] CHECK (
        intake_months IS NULL OR (
            intake_months <@ ARRAY[1, 4, 7, 10]::SMALLINT[]
            AND COALESCE(array_length(intake_months, 1), 0) > 0
        )
    ),
    type_id INTEGER REFERENCES school_types(id),
    status VARCHAR(20) CHECK (status IN ('partner', 'active', 'paused', 'pending')) DEFAULT 'pending',
    logo_url TEXT,
    thumbnail_url TEXT,
    rating DECIMAL(2,1),
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_schools_region ON schools(region_id);
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);

-- ======================== SCHOOL_DETAIL_CONTENTS ========================
CREATE TABLE IF NOT EXISTS school_detail_contents (
    school_id INTEGER PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,
    short_intro TEXT,
    founding_history TEXT,
    school_philosophy TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ======================== SCHOOL_PROGRAM_OVERVIEWS ========================
CREATE TABLE IF NOT EXISTS school_program_overviews (
    school_id INTEGER PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,
    hero_title VARCHAR(255),
    hero_description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ======================== SCHOOL_PROGRAM_CARDS ========================
CREATE TABLE IF NOT EXISTS school_program_cards (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    icon VARCHAR(120),
    course_name VARCHAR(255) NOT NULL,
    course_description TEXT,
    duration_text VARCHAR(255),
    price_text VARCHAR(255),
    target_text TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_school_program_cards_school ON school_program_cards(school_id);

-- ======================== SCHOOL_ADMISSION_OVERVIEWS ========================
CREATE TABLE IF NOT EXISTS school_admission_overviews (
    school_id INTEGER PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,
    hero_title VARCHAR(255),
    hero_description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ======================== SCHOOL_ADMISSION_CARDS ========================
CREATE TABLE IF NOT EXISTS school_admission_cards (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    icon VARCHAR(120),
    criterion_name VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_school_admission_cards_school ON school_admission_cards(school_id);

-- ======================== SCHOOL_ADMISSION_CARD_ITEMS ========================
CREATE TABLE IF NOT EXISTS school_admission_card_items (
    id SERIAL PRIMARY KEY,
    admission_card_id INTEGER NOT NULL REFERENCES school_admission_cards(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_school_admission_items_card ON school_admission_card_items(admission_card_id);

-- ======================== SCHOOL_FACILITY_OVERVIEWS ========================
CREATE TABLE IF NOT EXISTS school_facility_overviews (
    school_id INTEGER PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,
    hero_title VARCHAR(255),
    hero_description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ======================== SCHOOL_FACILITY_CARDS ========================
CREATE TABLE IF NOT EXISTS school_facility_cards (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    icon VARCHAR(120),
    service_name VARCHAR(255) NOT NULL,
    content_detail TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_school_facility_cards_school ON school_facility_cards(school_id);

-- ======================== SCHOOL_REVIEWS ========================
CREATE TABLE IF NOT EXISTS school_reviews (
    id SERIAL PRIMARY KEY,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    nationality VARCHAR(100),
    course_period VARCHAR(50),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reviews_school ON school_reviews(school_id);

-- ======================== FAQS ========================
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    type VARCHAR(20) CHECK (type IN ('school', 'general')) NOT NULL,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_faqs_school ON faqs(school_id);

-- ======================== CONTACTS ========================
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20),
    message TEXT,
    status VARCHAR(30) CHECK (status IN ('new', 'pending', 'responded', 'closed')) DEFAULT 'new',
    contact_method VARCHAR(20) CHECK (contact_method IN ('phone', 'email', 'social')),
    social_contact VARCHAR(255),
    assigned_to BIGINT REFERENCES users(id),
    first_contacted_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned ON contacts(assigned_to);

-- ======================== CONTACT_NOTES ========================
CREATE TABLE IF NOT EXISTS contact_notes (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ======================== STATIC_PAGES ========================
CREATE TABLE IF NOT EXISTS static_pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    hero_title VARCHAR(255),
    hero_description TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    type VARCHAR(20) CHECK (type IN ('static', 'dynamic')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('draft', 'published')) DEFAULT 'published',
    updated_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE static_pages
DROP COLUMN IF EXISTS content;

DROP TABLE IF EXISTS page_contents;

-- ======================== SETTINGS ========================
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT,
    group_name VARCHAR(50) CHECK (group_name IN ('general', 'contact', 'seo')) NOT NULL
);

CREATE TABLE IF NOT EXISTS media_asset_refs (
    id BIGSERIAL PRIMARY KEY,
    owner_type VARCHAR(50) NOT NULL,
    owner_key VARCHAR(100) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    public_id VARCHAR(255) NOT NULL UNIQUE,
    asset_url TEXT NOT NULL,
    resource_type VARCHAR(50) DEFAULT 'image',
    format VARCHAR(20),
    bytes BIGINT DEFAULT 0,
    width INTEGER,
    height INTEGER,
    cloud_folder VARCHAR(255),
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (owner_type, owner_key, field_name)
);
CREATE INDEX IF NOT EXISTS idx_media_asset_refs_owner ON media_asset_refs(owner_type, owner_key);
CREATE INDEX IF NOT EXISTS idx_media_asset_refs_field ON media_asset_refs(field_name);

-- ======================== NOTIFICATIONS ========================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    role_id INTEGER REFERENCES roles(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_role ON notifications(role_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ======================== NOTIFICATION_SETTINGS ========================
CREATE TABLE IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    role_id INTEGER REFERENCES roles(id),
    type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user ON notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_role ON notification_settings(role_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_type ON notification_settings(type);

-- ======================== AUDIT_LOGS ========================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    object_type VARCHAR(50),
    object_id BIGINT,
    data JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_object ON audit_logs(object_type, object_id);

-- ======================== PASSWORD_RESET_TOKENS ========================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expired_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);

-- ======================== USER_SESSIONS ========================
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    expired_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);

-- ======================== FILES ========================
CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    public_id VARCHAR(255) UNIQUE NOT NULL,
    url TEXT NOT NULL,
    resource_type VARCHAR(50),
    format VARCHAR(20),
    width INTEGER,
    height INTEGER,
    bytes BIGINT,
    folder VARCHAR(255),
    tags TEXT[],
    context JSONB,
    used_in VARCHAR(50),
    used_in_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_used_in ON files(used_in, used_in_id);

-- ======================== ACTIVITY_LOGS ========================
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    object_type VARCHAR(50),
    object_id BIGINT,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);

-- Create table for backup history and file metadata
CREATE TABLE IF NOT EXISTS backup_records (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL UNIQUE,
    file_path TEXT NOT NULL,
    backup_type VARCHAR(20) NOT NULL CHECK (backup_type IN ('manual', 'auto', 'upload')),
    status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'running')),
    file_size BIGINT DEFAULT 0,
    created_by BIGINT REFERENCES users(id),
    restored_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backup_records_created_at ON backup_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_records_type ON backup_records(backup_type);
CREATE INDEX IF NOT EXISTS idx_backup_records_status ON backup_records(status);
CREATE INDEX IF NOT EXISTS idx_backup_records_created_by ON backup_records(created_by);

-- Social links table: unlimited configurable social/contact links
CREATE TABLE IF NOT EXISTS social_links (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_social_links_order ON social_links(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_social_links_active ON social_links(is_active);

-- Table: team_members (for expert team section)
-- Stores team member information with profile images and social links
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    description TEXT,
    photo_url VARCHAR(500),
    photo_cloudinary_public_id VARCHAR(255),
    social_links JSONB DEFAULT '{
        "facebook": "",
        "tiktok": "",
        "email": ""
    }'::jsonb,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for sorting and status filtering
CREATE INDEX IF NOT EXISTS idx_team_members_sort ON team_members(sort_order, is_active);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON team_members(is_active);

-- Table: about_stats (for company achievements section)
-- Stores statistics to be animated on the about page
CREATE TABLE IF NOT EXISTS about_stats (
    id SERIAL PRIMARY KEY,
    icon VARCHAR(100),
    number INT NOT NULL,
    label VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for sorting and status filtering
CREATE INDEX IF NOT EXISTS idx_about_stats_sort ON about_stats(sort_order, is_active);
CREATE INDEX IF NOT EXISTS idx_about_stats_active ON about_stats(is_active);

-- Table: about_reasons (for why choose us section)
-- Stores reason cards to be displayed on the about page
CREATE TABLE IF NOT EXISTS about_reasons (
    id SERIAL PRIMARY KEY,
    icon VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for sorting and status filtering
CREATE INDEX IF NOT EXISTS idx_about_reasons_sort ON about_reasons(sort_order, is_active);
CREATE INDEX IF NOT EXISTS idx_about_reasons_active ON about_reasons(is_active);

-- Table: about_missions (for company missions section)
-- Stores mission statements to be displayed on the about page
CREATE TABLE IF NOT EXISTS about_missions (
    id          SERIAL PRIMARY KEY,
    icon        VARCHAR(100),
    title       VARCHAR(255)  NOT NULL,
    type        VARCHAR(20)   NOT NULL DEFAULT 'paragraph' CHECK (type IN ('paragraph', 'list')),
    description TEXT          NOT NULL,   -- plain text OR JSON string (for list type)
    sort_order  INT           NOT NULL DEFAULT 0,
    is_active   BOOLEAN       NOT NULL DEFAULT true,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_about_missions_sort   ON about_missions(sort_order, is_active);
CREATE INDEX IF NOT EXISTS idx_about_missions_active ON about_missions(is_active);

-- ======================== ABOUT_CONTENT ========================
-- Table: about_content
-- Stores about page sections (content & history timeline)
-- section_key: unique identifier for each section (content, history)
-- type: paragraph (for content section) or timeline (for history section)
-- timeline_items: JSONB array of {year, title, content} objects
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
);

CREATE INDEX IF NOT EXISTS idx_about_content_section_key ON about_content(section_key);
CREATE INDEX IF NOT EXISTS idx_about_content_sort ON about_content(sort_order, is_active);

-- ======================== HOMEPAGE_SECTIONS ========================

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
    list_icon VARCHAR(100),
    list_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    card_layout VARCHAR(20) CHECK (card_layout IN ('bg-red', 'bg-white', 'border-top')) DEFAULT 'bg-red',
    card_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE homepage_sections
ADD COLUMN IF NOT EXISTS card_desktop_columns SMALLINT NOT NULL DEFAULT 4,
ADD COLUMN IF NOT EXISTS card_tablet_columns SMALLINT NOT NULL DEFAULT 2;

ALTER TABLE homepage_sections
ADD CONSTRAINT chk_homepage_card_desktop_columns
CHECK (card_desktop_columns BETWEEN 1 AND 6);

ALTER TABLE homepage_sections
ADD CONSTRAINT chk_homepage_card_tablet_columns
CHECK (card_tablet_columns BETWEEN 1 AND 4);

ALTER TABLE homepage_sections
ADD CONSTRAINT chk_homepage_card_columns_by_type
CHECK (
(type = 'card' AND card_desktop_columns BETWEEN 1 AND 6 AND card_tablet_columns BETWEEN 1 AND 4)
OR
(type <> 'card')
);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_sort ON homepage_sections(sort_order, is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_homepage_sections_sort_unique ON homepage_sections(sort_order);




