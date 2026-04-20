import db from "../../src/config/db.js";
import { logInfo, logError } from "../../src/utils/logger.js";

/**
 * Seed sample schools data
 * This script populates the schools table with sample Japanese schools
 * Prerequisites: regions and school_types must be seeded first
 */

const sampleSchools = [
    {
        name: 'Tokyo International Language Academy',
        slug: 'tokyo-international-language-academy',
        location: 'Shibuya, Tokyo, Japan',
        tuition_per_year: 800000,
        class_size: 12,
        visa_success_rate: 95,
        features: {
            'dormitory': true,
            'part_time_job': true,
            'university_preparation': true,
            'jlpt_preparation': true,
            'scholarships': ['academic', 'attendance']
        },
        region_slug: 'tokyo',
        type_slug: 'language-school',
        status: 'active',
        logo_url: 'https://example.com/tokyo-academy-logo.png',
        thumbnail_url: 'https://example.com/tokyo-academy-thumb.png'
    },
    {
        name: 'Osaka Culinary Institute',
        slug: 'osaka-culinary-institute',
        location: 'Namba, Osaka, Japan',
        tuition_per_year: 1200000,
        class_size: 16,
        visa_success_rate: 88,
        features: {
            'dormitory': false,
            'part_time_job': true,
            'internship': true,
            'restaurant_partnerships': true,
            'scholarships': ['merit']
        },
        region_slug: 'osaka',
        type_slug: 'cooking-school',
        status: 'active',
        logo_url: 'https://example.com/osaka-culinary-logo.png',
        thumbnail_url: 'https://example.com/osaka-culinary-thumb.png'
    },
    {
        name: 'Kyoto Traditional Arts University',
        slug: 'kyoto-traditional-arts-university',
        location: 'Gion, Kyoto, Japan',
        tuition_per_year: 1500000,
        class_size: 20,
        visa_success_rate: 92,
        features: {
            'dormitory': true,
            'cultural_activities': true,
            'tea_ceremony': true,
            'calligraphy': true,
            'scholarships': ['cultural', 'academic']
        },
        region_slug: 'kyoto',
        type_slug: 'art-school',
        status: 'active',
        logo_url: 'https://example.com/kyoto-arts-logo.png',
        thumbnail_url: 'https://example.com/kyoto-arts-thumb.png'
    },
    {
        name: 'Yokohama Business College',
        slug: 'yokohama-business-college',
        location: 'Minato Mirai, Yokohama, Japan',
        tuition_per_year: 1000000,
        class_size: 25,
        visa_success_rate: 90,
        features: {
            'dormitory': true,
            'part_time_job': true,
            'business_japanese': true,
            'internship': true,
            'job_placement': true,
            'scholarships': ['merit', 'need_based']
        },
        region_slug: 'yokohama',
        type_slug: 'business-school',
        status: 'active',
        logo_url: 'https://example.com/yokohama-business-logo.png',
        thumbnail_url: 'https://example.com/yokohama-business-thumb.png'
    },
    {
        name: 'Nagoya Technical Institute',
        slug: 'nagoya-technical-institute',
        location: 'Sakae, Nagoya, Japan',
        tuition_per_year: 1100000,
        class_size: 18,
        visa_success_rate: 87,
        features: {
            'dormitory': false,
            'part_time_job': true,
            'equipment_access': true,
            'industry_partnerships': true,
            'scholarships': ['technical']
        },
        region_slug: 'nagoya',
        type_slug: 'technical-college',
        status: 'active',
        logo_url: 'https://example.com/nagoya-tech-logo.png',
        thumbnail_url: 'https://example.com/nagoya-tech-thumb.png'
    }
];

async function seedSchools() {
    try {
        logInfo('Starting schools seeding...');
        
        // Check if schools already exist
        const existingSchools = await db.query('SELECT COUNT(*) as count FROM schools');
        const schoolCount = parseInt(existingSchools.rows[0].count);
        
        if (schoolCount > 0) {
            logInfo(`Schools table already has ${schoolCount} entries. Skipping seed.`);
            return;
        }
        
        // Get regions and school types for mapping
        const regions = await db.query('SELECT id, slug FROM regions');
        const schoolTypes = await db.query('SELECT id, slug FROM school_types');
        
        const regionMap = {};
        const typeMap = {};
        
        regions.rows.forEach(r => {
            regionMap[r.slug] = r.id;
        });
        
        schoolTypes.rows.forEach(t => {
            typeMap[t.slug] = t.id;
        });
        
        // Insert schools
        for (const school of sampleSchools) {
            try {
                // Get region and type IDs
                const regionId = regionMap[school.region_slug];
                const typeId = typeMap[school.type_slug];
                
                if (!regionId || !typeId) {
                    logError(`Cannot find region (${school.region_slug}) or type (${school.type_slug}) for school ${school.name}`);
                    continue;
                }
                
                // Check if slug already exists
                const existingSlug = await db.query(
                    'SELECT id FROM schools WHERE slug = $1', 
                    [school.slug]
                );
                
                if (existingSlug.rows.length === 0) {
                    await db.query(`
                        INSERT INTO schools (
                            name, slug, location, tuition_per_year, class_size,
                            visa_success_rate, features, region_id, type_id,
                            status, logo_url, thumbnail_url
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    `, [
                        school.name,
                        school.slug,
                        school.location,
                        school.tuition_per_year,
                        school.class_size,
                        school.visa_success_rate,
                        JSON.stringify(school.features),
                        regionId,
                        typeId,
                        school.status,
                        school.logo_url,
                        school.thumbnail_url
                    ]);
                    
                    logInfo(`✓ Created school: ${school.name}`);
                } else {
                    logInfo(`- School ${school.name} already exists, skipping`);
                }
                
            } catch (error) {
                logError(`Failed to create school ${school.name}`, error);
            }
        }
        
        // Verify seeding results
        const finalCount = await db.query('SELECT COUNT(*) as count FROM schools');
        const newSchoolCount = parseInt(finalCount.rows[0].count);
        
        logInfo(`✓ Schools seeding completed. Total schools: ${newSchoolCount}`);
        
    } catch (error) {
        logError('Schools seeding failed', error);
        throw error;
    }
}

// Execute seeding if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        await seedSchools();
        process.exit(0);
    } catch (error) {
        logError('Seeding process failed', error);
        process.exit(1);
    }
}

export default seedSchools;