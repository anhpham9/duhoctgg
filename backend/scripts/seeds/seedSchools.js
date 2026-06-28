import db from "../../src/config/db.js";

const run = async () => {
    try {
        const FEATURE_POOL = [
            "EJU Support",
            "Hỗ trợ visa",
            "Ký túc xá",
            "JLPT Focused",
            "Văn hóa Nhật",
            "Hỗ trợ việc làm thêm",
            "Định hướng nghề nghiệp",
            "Đa quốc gia"
        ];
        const pickFeatures = (index) => {
            const count = 3 + (index % 3); // 3-5 features
            const picked = [];

            for (let j = 0; j < count; j++) {
                const value = FEATURE_POOL[(index + j * 2) % FEATURE_POOL.length];
                if (!picked.includes(value)) picked.push(value);
            }

            return picked;
        };

        const pickIntakeMonths = (index) => {
            if (index % 4 === 0) return [1, 4, 7, 10];
            if (index % 3 === 0) return [4, 10];
            if (index % 2 === 0) return [4, 7];
            return [1, 4, 7];
        };

        // Lấy region, type
        const regions = await db.query(`SELECT id FROM regions LIMIT 5`);
        const types = await db.query(`SELECT id FROM school_types LIMIT 2`);
        const regionIds = regions.rows.map(r => r.id);
        const typeIds = types.rows.map(t => t.id);
        if (regionIds.length === 0 || typeIds.length === 0) {
            console.log("❌ Cần seed regions và school_types trước!");
            return;
        }
        const schools = [];
        for (let i = 1; i <= 20; i++) {
            const ratingValue = Number((3.2 + (i % 18) * 0.1).toFixed(1));
            const reviewCountValue = 8 + (i % 35);
            const tuitionValue = 1200000 + i * 10000;
            const classSizeValue = 20 + (i % 10);
            const visaRateValue = 80 + (i % 15);
            const schoolStatus = i % 4 === 0 ? 'partner' : (i % 3 === 0 ? 'active' : (i % 2 === 0 ? 'paused' : 'pending'));

            schools.push([
                `Trường Nhật ngữ ${i}`,
                `Japanese Language School ${i}`,
                `truong-nhat-ngu-${i}`,
                `Địa chỉ số ${i}, Quận ${i % 5 + 1}, Tokyo`,
                `+81-3-1000-${String(1000 + i).slice(-4)}`,
                `+81-3-2000-${String(2000 + i).slice(-4)}`,
                `school${i}@duhocnb.example`,
                `https://school${i}.duhocnb.example`,
                tuitionValue,
                classSizeValue,
                visaRateValue,
                JSON.stringify(pickFeatures(i)),
                regionIds[i % regionIds.length],
                pickIntakeMonths(i),
                typeIds[i % typeIds.length],
                schoolStatus,
                null,
                null,
                ratingValue,
                reviewCountValue,
                new Date(),
                new Date()
            ]);
        }
        for (const s of schools) {
            await db.query(
                `INSERT INTO schools (name, name_en, slug, location, phone, fax, email, website, tuition_per_year, class_size, visa_success_rate, features, region_id, intake_months, type_id, status, logo_url, thumbnail_url, rating, review_count, created_at, updated_at)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::smallint[],$15,$16,$17,$18,$19,$20,$21,$22)
                 ON CONFLICT (slug) DO NOTHING`,
                s
            );
        }
        console.log("✅ 20 schools seeded");
    } catch (err) {
        console.error("❌ Schools seed error:", err.message);
    }
};

run();