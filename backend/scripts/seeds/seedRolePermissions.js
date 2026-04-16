import db from "../../src/config/db.js";

const run = async () => {
    try {
        // lấy role
        const roles = await db.query(`SELECT id, name FROM roles`);
        const permissions = await db.query(`SELECT id, name FROM permissions`);

        const roleMap = Object.fromEntries(roles.rows.map(r => [r.name, r.id]));
        const permMap = Object.fromEntries(permissions.rows.map(p => [p.name, p.id]));

        const data = [
            // admin
            [roleMap.admin, permMap["news.create"]],
            [roleMap.admin, permMap["news.update"]],
            [roleMap.admin, permMap["contact.view"]],
            [roleMap.admin, permMap["contact.update"]],

            // manager
            [roleMap.manager, permMap["user.manage"]],
            [roleMap.manager, permMap["settings.update"]],

            // editor
            [roleMap.editor, permMap["news.create"]],
            [roleMap.editor, permMap["news.update"]],

            // consultant
            [roleMap.consultant, permMap["contact.view"]],
            [roleMap.consultant, permMap["contact.update"]],
        ];

        for (const [role_id, permission_id] of data) {
            await db.query(
                `INSERT INTO role_permissions (role_id, permission_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING`,
                [role_id, permission_id]
            );
        }

        console.log("✅ Role-Permissions seeded");
    } catch (err) {
        console.error("❌ RolePermissions seed error:", err.message);
    }
};

run();