-- Migration 003: Create About Page Management Tables
-- Created: 2026-06-22
-- Purpose: Support dynamic management of about page content (team members, stats, reasons)

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
