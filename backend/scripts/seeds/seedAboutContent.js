import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const aboutContentItems = [
    {
        section_key: 'content',
        title: 'VỀ CHÚNG TÔI',
        subtitle: 'Chuyên gia tư vấn du học Nhật Bản hàng đầu Việt Nam',
        type: 'paragraph',
        content: `Du Học NB được thành lập từ năm 2020 với sứ mệnh giúp các bạn trẻ Việt Nam thực hiện ước mơ du học tại đất nước mặt trời mọc. Với đội ngũ chuyên gia giàu kinh nghiệm và mạng lưới đối tác rộng khắp, chúng tôi đã đồng hành thành công cùng hàng nghìn học sinh trên con đường chinh phục tri thức tại Nhật Bản.

Chúng tôi hiểu rằng mỗi học sinh đều có những mong muốn, khả năng và hoàn cảnh khác nhau. Vì vậy, chúng tôi cam kết cung cấp dịch vụ tư vấn cá nhân hóa, từ khâu chọn trường, chuẩn bị hồ sơ cho đến hỗ trợ cuộc sống tại Nhật Bản.

Với phương châm "Uy tín - Chất lượng - Tận tâm", Du Học NB không chỉ là nơi cung cấp dịch vụ mà còn là người bạn đồng hành đáng tin cậy của các bạn trẻ trên hành trình khám phá và phát triển bản thân tại xứ sở anh đào.`,
        image_url: '/assets/images/students-group.webp',
        sort_order: 0,
        is_active: true,
        timeline_items: []
    },
    {
        section_key: 'history',
        title: 'LỊCH SỬ PHÁT TRIỂN',
        subtitle: 'Những cột mốc quan trọng trong hành trình phát triển của Du Học NB',
        type: 'timeline',
        content: '',
        image_url: '',
        sort_order: 100,
        is_active: true,
        timeline_items: [
            { year: '2020', title: 'Thành Lập Công Ty', content: 'Du Học NB chính thức ra đời với sứ mệnh giúp các bạn trẻ Việt Nam thực hiện ước mơ du học tại Nhật Bản.' },
            { year: '2021', title: 'Mở Rộng Hoạt Động', content: 'Du Học NB mở rộng hoạt động, tăng cường hợp tác với các trường học và tổ chức giáo dục tại Nhật Bản.' },
            { year: '2022', title: 'Đạt Mốc 500 Học Sinh', content: 'Du Học NB tự hào đạt mốc 500 học sinh được tư vấn và hỗ trợ thành công.' },
            { year: '2023', title: 'Mở Rộng Dịch Vụ', content: 'Du Học NB mở rộng dịch vụ, bao gồm hỗ trợ học bổng và định hướng nghề nghiệp cho học sinh.' },
            { year: '2024', title: 'Cột Mốc 1000 Học Sinh', content: 'Du Học NB đạt cột mốc 1000 học sinh được tư vấn và hỗ trợ thành công.' },
            { year: '2026', title: 'Hiện Tại', content: 'Du Học NB tiếp tục phát triển và nâng cao chất lượng dịch vụ, đồng hành cùng học sinh trên con đường du học.' }
        ]
    }
];

async function run() {
    try {
        console.log('Seeding about_content...');

        await db.query(`DELETE FROM about_content WHERE section_key NOT IN ('content', 'history')`)

        for (const item of aboutContentItems) {
            await db.query(
                                `INSERT INTO about_content (section_key, title, subtitle, type, content, timeline_items, image_url, sort_order, is_active)
                                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 ON CONFLICT (section_key) DO UPDATE SET 
                   title = EXCLUDED.title,
                                     subtitle = EXCLUDED.subtitle,
                   type = EXCLUDED.type,
                   content = EXCLUDED.content,
                   timeline_items = EXCLUDED.timeline_items,
                   image_url = EXCLUDED.image_url,
                                     sort_order = EXCLUDED.sort_order,
                                     is_active = EXCLUDED.is_active,
                   updated_at = NOW()`,
                                [item.section_key, item.title, item.subtitle || '', item.type || 'paragraph', item.content, JSON.stringify(item.timeline_items || []), item.image_url, item.sort_order, item.is_active]
            );
        }

        console.log('✅ About content seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding about content:', error.message);
        process.exit(1);
    }
}

run();
