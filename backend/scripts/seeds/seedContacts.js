import db from "../../src/config/db.js";

const run = async () => {
  try {
    // Lấy danh sách users để assign contacts
    const users = await db.query(`SELECT id, username FROM users WHERE role_id IN (2, 3, 5)`); // Admin, Manager, Consultant
    const userIds = users.rows.map(user => user.id);
    
    if (userIds.length === 0) {
      console.log("❌ No users found to assign contacts. Please seed users first.");
      return;
    }

    // Seed contacts với dữ liệu realistic cho du học Nhật
    const contactsData = [
      {
        name: 'Nguyễn Văn Nam',
        email: 'nam.nguyen@gmail.com',
        phone: '0901234567',
        message: 'Em muốn tìm hiểu về chương trình du học tiếng Nhật tại Tokyo. Em đã tốt nghiệp đại học ngành IT và muốn học thêm tiếng Nhật để phát triển sự nghiệp. Xin tư vấn về các trường và học phí.',
        status: 'new',
        contact_method: 'email',
        social_contact: null,
        assigned_to: userIds[0]
      },
      {
        name: 'Trần Thị Mai',
        email: 'mai.tran2000@yahoo.com',
        phone: '0987654321',
        message: 'Chào anh/chị, em đang học năm cuối đại học và muốn du học Nhật sau khi tốt nghiệp. Em quan tâm đến các trường có hỗ trợ visa và học bổng. Mong được tư vấn chi tiết.',
        status: 'pending',
        contact_method: 'phone',
        social_contact: null,
        assigned_to: userIds[Math.floor(Math.random() * userIds.length)],
        first_contacted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 ngày trước
      },
      {
        name: 'Lê Hoàng Minh',
        email: 'minh.le.student@hotmail.com',
        phone: '0912345678',
        message: 'Tôi đã có bằng N3 tiếng Nhật và muốn apply vào các trường ngôn ngữ tại Osaka hoặc Kyoto. Tôi quan tâm đến môi trường học tập và cơ hội việc làm part-time. Xin báo giá chi tiết.',
        status: 'responded',
        contact_method: 'email',
        social_contact: null,
        assigned_to: userIds[Math.floor(Math.random() * userIds.length)],
        first_contacted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 ngày trước
      },
      {
        name: 'Phạm Thu Hương',
        email: 'huong.pham@outlook.com',
        phone: '0934567890',
        message: 'Em muốn học tiếng Nhật từ cơ bản và dự định du học trong 2 năm tới. Em đang làm việc tại một công ty Nhật nên cần cải thiện khả năng giao tiếp. Mong được tư vấn lộ trình học phù hợp.',
        status: 'closed',
        contact_method: 'social',
        social_contact: 'Facebook: Phạm Thu Hương (@huongpham.japan)',
        assigned_to: userIds[Math.floor(Math.random() * userIds.length)],
        first_contacted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 ngày trước
        closed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 ngày trước
      },
      {
        name: 'Vũ Đức Thành',
        email: 'thanh.vu.dev@gmail.com',
        phone: '0956789012',
        message: 'Xin chào, tôi là lập trình viên có 3 năm kinh nghiệm và muốn tìm hiểu về các chương trình du học kết hợp với việc làm tại Nhật. Tôi đã có N2 và muốn nâng cao thêm. Liệu có chương trình nào phù hợp không?',
        status: 'new',
        contact_method: 'email',
        social_contact: null,
        assigned_to: null // Chưa được assign
      },
      {
        name: 'Đỗ Thị Lan',
        email: 'lan.do.japan@gmail.com',
        phone: '0967890123',
        message: 'Em đang học năm 3 đại học và muốn tham gia chương trình exchange student trước, sau đó sẽ du học dài hạn. Em muốn biết thêm về quy trình apply và các giấy tờ cần thiết.',
        status: 'pending',
        contact_method: 'phone',
        social_contact: null,
        assigned_to: userIds[Math.floor(Math.random() * userIds.length)],
        first_contacted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 ngày trước
      },
      {
        name: 'Bùi Văn Tùng',
        email: 'tung.bui2024@gmail.com',
        phone: '0978901234',
        message: 'Tôi muốn tìm hiểu về học phí và chi phí sinh hoạt khi du học Nhật. Gia đình tôi cần chuẩn bị tài chính từ sớm. Xin tư vấn về các gói học phí và hỗ trợ tài chính.',
        status: 'responded',
        contact_method: 'social',
        social_contact: 'Zalo: 0978901234',
        assigned_to: userIds[Math.floor(Math.random() * userIds.length)],
        first_contacted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 ngày trước
      },
      {
        name: 'Hoàng Thị Thảo',
        email: 'thao.hoang.student@gmail.com',
        phone: '0989012345',
        message: 'Em vừa tốt nghiệp cấp 3 với điểm khá và muốn du học Nhật luôn thay vì học đại học trong nước. Em muốn biết về các trường preparation và yêu cầu đầu vào. Gia đình em ủng hộ quyết định này.',
        status: 'new',
        contact_method: 'email',
        social_contact: null,
        assigned_to: userIds[Math.floor(Math.random() * userIds.length)]
      }
    ];

    // Insert contacts
    for (const contact of contactsData) {
      const result = await db.query(
        `INSERT INTO contacts 
         (name, email, phone, message, status, contact_method, social_contact, assigned_to, first_contacted_at, closed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          contact.name,
          contact.email, 
          contact.phone,
          contact.message,
          contact.status,
          contact.contact_method,
          contact.social_contact,
          contact.assigned_to,
          contact.first_contacted_at || null,
          contact.closed_at || null
        ]
      );
      
      console.log(`✅ Created contact: ${contact.name} (ID: ${result.rows[0].id})`);
    }

    console.log("✅ Contacts seeded successfully");

  } catch (err) {
    console.error("❌ Contacts seed error:", err.message);
  }
};

run();