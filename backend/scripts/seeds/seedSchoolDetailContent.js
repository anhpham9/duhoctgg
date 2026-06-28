import db from "../../src/config/db.js";

const PROGRAM_ICONS = ["fas fa-graduation-cap", "fas fa-book-open", "fas fa-language", "fas fa-award"];
const ADMISSION_ICONS = ["fas fa-file-signature", "fas fa-passport", "fas fa-yen-sign", "fas fa-check-circle"];
const FACILITY_ICONS = ["fas fa-building", "fas fa-bed", "fas fa-users", "fas fa-wifi", "fas fa-utensils"];

const buildProgramCards = (schoolName, index) => {
    const intake = index % 2 === 0 ? "Thang 4 & 10" : "Thang 1, 4 & 7";
    return [
        {
            icon: PROGRAM_ICONS[index % PROGRAM_ICONS.length],
            courseName: "Khoa so cap",
            courseDescription: `Lo trinh can ban cho hoc vien moi tai ${schoolName}, tap trung ngu phap va hoi thoai hang ngay.`,
            durationText: "12 thang",
            priceText: "760,000 JPY/nam",
            targetText: "Muc tieu dat JLPT N4/N3",
            sortOrder: 0,
            isActive: true
        },
        {
            icon: PROGRAM_ICONS[(index + 1) % PROGRAM_ICONS.length],
            courseName: "Khoa trung cap",
            courseDescription: `Chu trong ky nang hoc thuat va giao tiep trong moi truong thuc te, phu hop hoc vien da co nen tang.`,
            durationText: "18 thang",
            priceText: "830,000 JPY/nam",
            targetText: "Muc tieu dat JLPT N2",
            sortOrder: 1,
            isActive: true
        },
        {
            icon: PROGRAM_ICONS[(index + 2) % PROGRAM_ICONS.length],
            courseName: "Lop luyen thi dai hoc",
            courseDescription: "Tang cuong EJU, viet luan va phong van de vao truong chuyen mon hoac dai hoc Nhat Ban.",
            durationText: "6-12 thang",
            priceText: "420,000 JPY/khoa",
            targetText: `Lich hoc linh hoat theo ky nhap hoc ${intake}`,
            sortOrder: 2,
            isActive: true
        }
    ];
};

const buildAdmissionCards = (index) => [
    {
        icon: ADMISSION_ICONS[index % ADMISSION_ICONS.length],
        criterionName: "Hoc van",
        sortOrder: 0,
        isActive: true,
        items: [
            { itemText: "Tot nghiep THPT tro len", sortOrder: 0 },
            { itemText: "Bang diem day du 3 nam gan nhat", sortOrder: 1 }
        ]
    },
    {
        icon: ADMISSION_ICONS[(index + 1) % ADMISSION_ICONS.length],
        criterionName: "Nang luc tieng Nhat",
        sortOrder: 1,
        isActive: true,
        items: [
            { itemText: "Toi thieu 150 gio hoc tieng Nhat", sortOrder: 0 },
            { itemText: "Khuyen khich co chung chi JLPT N5 tro len", sortOrder: 1 }
        ]
    },
    {
        icon: ADMISSION_ICONS[(index + 2) % ADMISSION_ICONS.length],
        criterionName: "Tai chinh va ho so visa",
        sortOrder: 2,
        isActive: true,
        items: [
            { itemText: "Chung minh tai chinh theo yeu cau Cuc xuat nhap canh", sortOrder: 0 },
            { itemText: "Ho so bao lanh day du, hop le", sortOrder: 1 }
        ]
    }
];

const buildFacilityCards = (index) => [
    {
        icon: FACILITY_ICONS[index % FACILITY_ICONS.length],
        serviceName: "Ky tuc xa",
        contentDetail: "Ky tuc xa cach truong 10-20 phut di tau, co quan ly ho tro 24/7 va nhieu loai phong phu hop ngan sach.",
        sortOrder: 0,
        isActive: true
    },
    {
        icon: FACILITY_ICONS[(index + 1) % FACILITY_ICONS.length],
        serviceName: "Phong tu hoc va thu vien",
        contentDetail: "Khu tu hoc mo den toi, tai lieu cap nhat lien tuc, phu hop luyen thi JLPT va EJU.",
        sortOrder: 1,
        isActive: true
    },
    {
        icon: FACILITY_ICONS[(index + 2) % FACILITY_ICONS.length],
        serviceName: "Ho tro viec lam them",
        contentDetail: "Bo phan ho tro nghe nghiep ket noi cong viec part-time an toan va huong dan quy dinh lao dong cho du hoc sinh.",
        sortOrder: 2,
        isActive: true
    }
];

const upsertOverviewTables = async (client, schoolId, schoolName) => {
    await client.query(
        `INSERT INTO school_detail_contents (school_id, short_intro, founding_history, school_philosophy, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (school_id)
         DO UPDATE SET
             short_intro = EXCLUDED.short_intro,
             founding_history = EXCLUDED.founding_history,
             school_philosophy = EXCLUDED.school_philosophy,
             updated_at = NOW()`,
        [
            schoolId,
            `${schoolName} la truong Nhat ngu co moi truong hoc tap than thien, dinh huong ro rang cho du hoc sinh Viet Nam.`,
            `${schoolName} duoc phat trien theo dinh huong dao tao tieng Nhat thuc tien, lien ket chat che voi cac truong chuyen mon va doanh nghiep tai Nhat Ban.`,
            "Toi uu hoa hanh trinh hoc tieng Nhat, phat trien ky nang hoc thuat va ky nang song de hoc vien hoi nhap ben vung tai Nhat Ban."
        ]
    );

    await client.query(
        `INSERT INTO school_program_overviews (school_id, hero_title, hero_description, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (school_id)
         DO UPDATE SET
             hero_title = EXCLUDED.hero_title,
             hero_description = EXCLUDED.hero_description,
             updated_at = NOW()`,
        [
            schoolId,
            "Chuong trinh hoc theo muc tieu",
            "Thiet ke linh hoat tu so cap den luyen thi, ket hop ngu phap, hoi thoai va luyen de de toi uu ket qua dau ra."
        ]
    );

    await client.query(
        `INSERT INTO school_admission_overviews (school_id, hero_title, hero_description, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (school_id)
         DO UPDATE SET
             hero_title = EXCLUDED.hero_title,
             hero_description = EXCLUDED.hero_description,
             updated_at = NOW()`,
        [
            schoolId,
            "Dieu kien tuyen sinh ro rang",
            "He thong tieu chi minh bach, co checklist cu the va doi ngu tu van dong hanh tu luc chuan bi ho so den khi nhap hoc."
        ]
    );

    await client.query(
        `INSERT INTO school_facility_overviews (school_id, hero_title, hero_description, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (school_id)
         DO UPDATE SET
             hero_title = EXCLUDED.hero_title,
             hero_description = EXCLUDED.hero_description,
             updated_at = NOW()`,
        [
            schoolId,
            "Co so vat chat va dich vu ho tro",
            "Moi truong hoc va sinh hoat duoc dau tu dong bo, ket hop dich vu ho tro hoc tap, viec lam them va dinh huong nghe nghiep."
        ]
    );
};

const reseedProgramCards = async (client, schoolId, cards) => {
    await client.query("DELETE FROM school_program_cards WHERE school_id = $1", [schoolId]);

    for (const card of cards) {
        await client.query(
            `INSERT INTO school_program_cards
                (school_id, icon, course_name, course_description, duration_text, price_text, target_text, sort_order, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
            [
                schoolId,
                card.icon,
                card.courseName,
                card.courseDescription,
                card.durationText,
                card.priceText,
                card.targetText,
                card.sortOrder,
                card.isActive
            ]
        );
    }
};

const reseedAdmissionCards = async (client, schoolId, cards) => {
    await client.query("DELETE FROM school_admission_cards WHERE school_id = $1", [schoolId]);

    for (const card of cards) {
        const inserted = await client.query(
            `INSERT INTO school_admission_cards
                (school_id, icon, criterion_name, sort_order, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
             RETURNING id`,
            [schoolId, card.icon, card.criterionName, card.sortOrder, card.isActive]
        );

        const admissionCardId = inserted.rows[0]?.id;
        if (!admissionCardId) continue;

        for (const item of card.items || []) {
            await client.query(
                `INSERT INTO school_admission_card_items
                    (admission_card_id, item_text, sort_order, created_at, updated_at)
                 VALUES ($1, $2, $3, NOW(), NOW())`,
                [admissionCardId, item.itemText, item.sortOrder]
            );
        }
    }
};

const reseedFacilityCards = async (client, schoolId, cards) => {
    await client.query("DELETE FROM school_facility_cards WHERE school_id = $1", [schoolId]);

    for (const card of cards) {
        await client.query(
            `INSERT INTO school_facility_cards
                (school_id, icon, service_name, content_detail, sort_order, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [schoolId, card.icon, card.serviceName, card.contentDetail, card.sortOrder, card.isActive]
        );
    }
};

const run = async () => {
    const client = await db.getClient();
    try {
        await client.query("BEGIN");

        const schoolsResult = await client.query("SELECT id, name FROM schools ORDER BY id ASC LIMIT 12");
        if (!schoolsResult.rows.length) {
            console.log("Khong tim thay du lieu schools. Hay seed schools truoc.");
            await client.query("ROLLBACK");
            return;
        }

        for (let index = 0; index < schoolsResult.rows.length; index++) {
            const school = schoolsResult.rows[index];
            const schoolId = Number(school.id);
            const schoolName = String(school.name || `School ${schoolId}`);

            await upsertOverviewTables(client, schoolId, schoolName);
            await reseedProgramCards(client, schoolId, buildProgramCards(schoolName, index));
            await reseedAdmissionCards(client, schoolId, buildAdmissionCards(index));
            await reseedFacilityCards(client, schoolId, buildFacilityCards(index));
        }

        await client.query("COMMIT");
        console.log(`Seeded school detail content for ${schoolsResult.rows.length} schools`);
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("seedSchoolDetailContent error:", err.message);
    } finally {
        client.release();
    }
};

run();
