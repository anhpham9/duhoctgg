import db from "../config/db.js";

export const MEDIA_OWNER_TYPES = {
    settings: "settings"
};

export const MEDIA_OWNER_KEYS = {
    general: "general"
};

export const MEDIA_FIELD_NAMES = {
    siteLogoUrl: "siteLogoUrl",
    siteFaviconUrl: "siteFaviconUrl"
};

export const ensureMediaAssetTableExists = async () => {
    await db.query(`
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (owner_type, owner_key, field_name)
        )
    `);

    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_media_asset_refs_owner
        ON media_asset_refs(owner_type, owner_key)
    `);

    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_media_asset_refs_field
        ON media_asset_refs(field_name)
    `);
};

export const getMediaAssetRefsByOwner = async ({ ownerType, ownerKey, client = db } = {}) => {
    const result = await client.query(
        `SELECT id, owner_type, owner_key, field_name, public_id, asset_url, resource_type,
                format, bytes, width, height, cloud_folder, created_by, updated_by,
                created_at, updated_at
         FROM media_asset_refs
         WHERE owner_type = $1 AND owner_key = $2`,
        [ownerType, ownerKey]
    );

    return result.rows;
};

export const mapMediaAssetRefsByField = (rows = []) => {
    return rows.reduce((accumulator, row) => {
        accumulator[row.field_name] = row;
        return accumulator;
    }, {});
};

export const upsertMediaAssetRef = async ({
    ownerType,
    ownerKey,
    fieldName,
    publicId,
    assetUrl,
    resourceType = "image",
    format = null,
    bytes = 0,
    width = null,
    height = null,
    cloudFolder = null,
    userId = null,
    client = db
} = {}) => {
    const result = await client.query(
        `INSERT INTO media_asset_refs (
            owner_type, owner_key, field_name, public_id, asset_url, resource_type,
            format, bytes, width, height, cloud_folder, created_by, updated_by
        ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, $12, $13
        )
        ON CONFLICT (owner_type, owner_key, field_name)
        DO UPDATE SET
            public_id = EXCLUDED.public_id,
            asset_url = EXCLUDED.asset_url,
            resource_type = EXCLUDED.resource_type,
            format = EXCLUDED.format,
            bytes = EXCLUDED.bytes,
            width = EXCLUDED.width,
            height = EXCLUDED.height,
            cloud_folder = EXCLUDED.cloud_folder,
            updated_by = EXCLUDED.updated_by,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id, owner_type, owner_key, field_name, public_id, asset_url, resource_type,
                  format, bytes, width, height, cloud_folder, created_by, updated_by,
                  created_at, updated_at`,
        [
            ownerType,
            ownerKey,
            fieldName,
            publicId,
            assetUrl,
            resourceType,
            format,
            bytes,
            width,
            height,
            cloudFolder,
            userId,
            userId
        ]
    );

    return result.rows[0] || null;
};

export const deleteMediaAssetRef = async ({ ownerType, ownerKey, fieldName, client = db } = {}) => {
    const result = await client.query(
        `DELETE FROM media_asset_refs
         WHERE owner_type = $1 AND owner_key = $2 AND field_name = $3
         RETURNING id, owner_type, owner_key, field_name, public_id, asset_url`,
        [ownerType, ownerKey, fieldName]
    );

    return result.rows[0] || null;
};
