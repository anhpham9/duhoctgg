import bcrypt from "bcrypt";
import db from "../../src/config/db.js";

const run = async () => {
    try {
        const roles = await db.query(`SELECT id, name FROM roles`);
        const roleMap = Object.fromEntries(roles.rows.map(r => [r.name, r.id]));

        const hash = await bcrypt.hash("123456", 10);

        await db.query(
            `
            INSERT INTO users (name, username, email, password, role_id)
            VALUES
                ('Super Admin', 'superadmin', 'superadmin@example.com', $1, $2),
                ('Admin User', 'admin', 'admin@example.com', $1, $3),
                ('Manager User', 'manager', 'manager@example.com', $1, $4),
                ('Consultant User', 'consultant', 'consultant@example.com', $1, $5),
                ('Editor User', 'editor', 'editor@example.com', $1, $6)
            ON CONFLICT (username) DO NOTHING
            `,
            [
                hash,
                roleMap.superadmin,
                roleMap.admin,
                roleMap.manager,
                roleMap.consultant,
                roleMap.editor
            ]
        );

        console.log("✅ Users seeded");
    } catch (err) {
        console.error("❌ Users seed error:", err.message);
    }
};

run();