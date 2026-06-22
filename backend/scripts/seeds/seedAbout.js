import db from "../../src/config/db.js";

const run = async () => {
    try {
        console.log('Seeding about page data...')

        // Check if data already exists
        const existingStats = await db.query('SELECT COUNT(*) as count FROM about_stats')
        if (existingStats.rows[0].count > 0) {
            console.log('About stats already seeded, skipping...')
            return
        }

        // Seed about_stats
        const statsData = [
            { icon: 'fas fa-users', number: 2500, label: 'Học sinh thành công', sort_order: 0 },
            { icon: 'fas fa-handshake', number: 150, label: 'Trường đối tác', sort_order: 1 },
            { icon: 'fas fa-percentage', number: 98, label: 'Tỷ lệ visa thành công (%)', sort_order: 2 },
            { icon: 'fas fa-business-time', number: 6, label: 'Năm kinh nghiệm', sort_order: 3 }
        ]

        for (const stat of statsData) {
            await db.query(
                'INSERT INTO about_stats (icon, number, label, sort_order, is_active) VALUES ($1, $2, $3, $4, $5)',
                [stat.icon, stat.number, stat.label, stat.sort_order, true]
            )
        }
        console.log('✓ Seeded about_stats')

        // Seed about_reasons
        const reasonsData = [
            {
                icon: 'fas fa-certificate',
                title: 'Được Chứng Nhận',
                description: 'Được cấp phép hoạt động hợp pháp bởi các cơ quan chức năng. Là đại diện chính thức của nhiều trường danh tiếng tại Nhật Bản.',
                sort_order: 0
            },
            {
                icon: 'fas fa-user-tie',
                title: 'Đội Ngũ Chuyên Nghiệp',
                description: 'Tư vấn viên có trình độ cao, từng du học tại Nhật Bản. Hiểu rõ văn hóa, học bổng và cơ hội việc làm tại Nhật.',
                sort_order: 1
            },
            {
                icon: 'fas fa-handshake',
                title: 'Cam Kết Rõ Ràng',
                description: 'Ký hợp đồng minh bạch, cam kết hoàn tiền 100% nếu visa bị từ chối do lỗi của công ty. Hỗ trợ trọn đời cho học sinh.',
                sort_order: 2
            },
            {
                icon: 'fas fa-dollar-sign',
                title: 'Chi Phí Hợp Lý',
                description: 'Mức phí tư vấn cạnh tranh nhất thị trường. Tư vấn miễn phí, chỉ thu phí khi học sinh có kết quả tích cực.',
                sort_order: 3
            },
            {
                icon: 'fas fa-clock',
                title: 'Tiến Độ Nhanh Chóng',
                description: 'Quy trình xử lý hồ sơ nhanh chóng, chuyên nghiệp. Luôn cập nhật tình hình hồ sơ cho học sinh và phụ huynh.',
                sort_order: 4
            },
            {
                icon: 'fas fa-life-ring',
                title: 'Hỗ Trợ Toàn Diện',
                description: 'Không chỉ tư vấn du học mà còn hỗ trợ việc làm thêm, tìm chỗ ở, thích ứng văn hóa và định cư lâu dài.',
                sort_order: 5
            }
        ]

        for (const reason of reasonsData) {
            await db.query(
                'INSERT INTO about_reasons (icon, title, description, sort_order, is_active) VALUES ($1, $2, $3, $4, $5)',
                [reason.icon, reason.title, reason.description, reason.sort_order, true]
            )
        }
        console.log('✓ Seeded about_reasons')

        // Seed team_members
        const teamData = [
            {
                name: 'Nguyễn Văn A',
                position: 'CEO & Founder',
                description: '10+ năm kinh nghiệm trong lĩnh vực tư vấn du học. Cử nhân Đại học Waseda, Nhật Bản.',
                photo_url: '/assets/images/news-2.jpg',
                social_links: {
                    facebook: 'https://facebook.com',
                    tiktok: '',
                    email: 'vana@duhocnb.com'
                },
                sort_order: 0
            },
            {
                name: 'Trần Thị B',
                position: 'Giám đốc Tư vấn',
                description: 'Chuyên gia tư vấn với 8 năm kinh nghiệm. Thạc sĩ Đại học Tokyo, chuyên ngành Giáo dục.',
                photo_url: '/assets/images/news-3.jpg',
                social_links: {
                    facebook: 'https://facebook.com',
                    tiktok: '',
                    email: 'thib@duhocnb.com'
                },
                sort_order: 1
            },
            {
                name: 'Lê Văn C',
                position: 'Trưởng phòng Visa',
                description: 'Chuyên gia xử lý hồ sơ visa với tỷ lệ thành công 99%. Cử nhân Đại học Keio, chuyên ngành Luật.',
                photo_url: '/assets/images/school-1.jpg',
                social_links: {
                    facebook: 'https://facebook.com',
                    tiktok: '',
                    email: 'vanc@duhocnb.com'
                },
                sort_order: 2
            },
            {
                name: 'Phạm Thị D',
                position: 'Tư vấn viên Senior',
                description: 'Tư vấn viên giàu kinh nghiệm, đã hỗ trợ 500+ học sinh thành công. Thạc sĩ Đại học Osaka, chuyên ngành Kinh tế.',
                photo_url: '/assets/images/school-2.jpg',
                social_links: {
                    facebook: 'https://facebook.com',
                    tiktok: '',
                    email: 'thid@duhocnb.com'
                },
                sort_order: 3
            }
        ]

        for (const member of teamData) {
            await db.query(
                'INSERT INTO team_members (name, position, description, photo_url, social_links, sort_order, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [member.name, member.position, member.description, member.photo_url, JSON.stringify(member.social_links), member.sort_order, true]
            )
        }
        console.log('✓ Seeded team_members')

        console.log('✓ About page data seeded successfully')
    } catch (error) {
        console.error('Error seeding about data:', error)
        throw error
    }
}

run();
