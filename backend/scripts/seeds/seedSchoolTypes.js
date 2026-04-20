import db from "../../src/config/db.js";
import { logInfo, logError } from "../../src/utils/logger.js";

/**
 * Seed initial school types data
 * This script populates the school_types table with common Japanese school categories
 */

const schoolTypes = [
    {
        name: 'Language School',
        slug: 'language-school'
    },
    {
        name: 'Vocational School',
        slug: 'vocational-school'
    },
    {
        name: 'University',
        slug: 'university'
    },
    {
        name: 'Junior College',
        slug: 'junior-college'
    },
    {
        name: 'Graduate School',
        slug: 'graduate-school'
    },
    {
        name: 'International School',
        slug: 'international-school'
    },
    {
        name: 'Business School',
        slug: 'business-school'
    },
    {
        name: 'Technical College',
        slug: 'technical-college'
    },
    {
        name: 'Art School',
        slug: 'art-school'
    },
    {
        name: 'Cooking School',
        slug: 'cooking-school'
    }
];

async function seedSchoolTypes() {
    try {
        logInfo('Starting school types seeding...');
        
        // Check if school types already exist
        const existingTypes = await db.query('SELECT COUNT(*) as count FROM school_types');
        const typeCount = parseInt(existingTypes.rows[0].count);
        
        if (typeCount > 0) {
            logInfo(`School types table already has ${typeCount} entries. Skipping seed.`);
            return;
        }
        
        // Insert school types
        for (const schoolType of schoolTypes) {
            try {
                // Check if slug already exists
                const existingSlug = await db.query(
                    'SELECT id FROM school_types WHERE slug = $1', 
                    [schoolType.slug]
                );
                
                if (existingSlug.rows.length === 0) {
                    await db.query(
                        'INSERT INTO school_types (name, slug) VALUES ($1, $2)',
                        [schoolType.name, schoolType.slug]
                    );
                    
                    logInfo(`✓ Created school type: ${schoolType.name}`);
                } else {
                    logInfo(`- School type ${schoolType.name} already exists, skipping`);
                }
                
            } catch (error) {
                logError(`Failed to create school type ${schoolType.name}`, error);
            }
        }
        
        // Verify seeding results
        const finalCount = await db.query('SELECT COUNT(*) as count FROM school_types');
        const newTypeCount = parseInt(finalCount.rows[0].count);
        
        logInfo(`✓ School types seeding completed. Total types: ${newTypeCount}`);
        
    } catch (error) {
        logError('School types seeding failed', error);
        throw error;
    }
}

// Execute seeding if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        await seedSchoolTypes();
        process.exit(0);
    } catch (error) {
        logError('Seeding process failed', error);
        process.exit(1);
    }
}

export default seedSchoolTypes;