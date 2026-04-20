import db from "../../src/config/db.js";
import { logInfo, logError } from "../../src/utils/logger.js";

/**
 * Seed initial regions data
 * This script populates the regions table with common Japanese regions
 */

const regions = [
    {
        name: 'Tokyo',
        slug: 'tokyo'
    },
    {
        name: 'Osaka',
        slug: 'osaka'
    },
    {
        name: 'Kyoto',
        slug: 'kyoto'
    },
    {
        name: 'Yokohama',
        slug: 'yokohama'
    },
    {
        name: 'Kobe',
        slug: 'kobe'
    },
    {
        name: 'Nagoya',
        slug: 'nagoya'
    },
    {
        name: 'Fukuoka',
        slug: 'fukuoka'
    },
    {
        name: 'Sendai',
        slug: 'sendai'
    },
    {
        name: 'Sapporo',
        slug: 'sapporo'
    },
    {
        name: 'Hiroshima',
        slug: 'hiroshima'
    }
];

async function seedRegions() {
    try {
        logInfo('Starting regions seeding...');
        
        // Check if regions already exist
        const existingRegions = await db.query('SELECT COUNT(*) as count FROM regions');
        const regionCount = parseInt(existingRegions.rows[0].count);
        
        if (regionCount > 0) {
            logInfo(`Regions table already has ${regionCount} entries. Skipping seed.`);
            return;
        }
        
        // Insert regions
        for (const region of regions) {
            try {
                // Check if slug already exists
                const existingSlug = await db.query(
                    'SELECT id FROM regions WHERE slug = $1', 
                    [region.slug]
                );
                
                if (existingSlug.rows.length === 0) {
                    await db.query(
                        'INSERT INTO regions (name, slug) VALUES ($1, $2)',
                        [region.name, region.slug]
                    );
                    
                    logInfo(`✓ Created region: ${region.name}`);
                } else {
                    logInfo(`- Region ${region.name} already exists, skipping`);
                }
                
            } catch (error) {
                logError(`Failed to create region ${region.name}`, error);
            }
        }
        
        // Verify seeding results
        const finalCount = await db.query('SELECT COUNT(*) as count FROM regions');
        const newRegionCount = parseInt(finalCount.rows[0].count);
        
        logInfo(`✓ Regions seeding completed. Total regions: ${newRegionCount}`);
        
    } catch (error) {
        logError('Regions seeding failed', error);
        throw error;
    }
}

// Execute seeding if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        await seedRegions();
        process.exit(0);
    } catch (error) {
        logError('Seeding process failed', error);
        process.exit(1);
    }
}

export default seedRegions;