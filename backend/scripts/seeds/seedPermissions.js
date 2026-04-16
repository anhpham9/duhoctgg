import db from "../../src/config/db.js";

const run = async () => {
    try {
        await db.query(`
            INSERT INTO permissions (name, description)
            VALUES
                ('news.create', 'Create news'),
                ('news.update', 'Update news'),
                ('news.delete', 'Delete news'),

                ('contact.view', 'View contacts'),
                ('contact.update', 'Update contact status'),

                ('user.manage', 'Manage users'),

                ('settings.update', 'Update settings')
            ON CONFLICT (name) DO NOTHING
        `);

        console.log("✅ Permissions seeded");
    } catch (err) {
        console.error("❌ Permissions seed error:", err.message);
    }
};

run();