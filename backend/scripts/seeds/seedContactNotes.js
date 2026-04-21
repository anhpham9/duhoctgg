import db from "../../src/config/db.js";

const run = async () => {
  try {
    // Lấy danh sách contacts và users
    const contacts = await db.query(`SELECT id, name, status FROM contacts LIMIT 6`);
    const users = await db.query(`SELECT id, username FROM users WHERE role_id IN (2, 3, 5)`); // Admin, Manager, Consultant
    
    if (contacts.rows.length === 0) {
      console.log("❌ No contacts found. Please seed contacts first.");
      return;
    }

    if (users.rows.length === 0) {
      console.log("❌ No users found. Please seed users first.");
      return;
    }

    // Tạo sample notes cho từng contact để minh họa workflow
    const contactNotesData = [
      // Contact 1: Nguyễn Văn Nam (new)
      {
        contact_id: contacts.rows[0]?.id,
        user_id: users.rows[0]?.id,
        note: "Khách hàng gọi điện tư vấn lần đầu. Đã tốt nghiệp đại học IT, muốn học tiếng Nhật để phát triển sự nghiệp. Quan tâm đến các trường tại Tokyo. Đã gửi bảng giá và thông tin 5 trường phù hợp.",
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 giờ trước
      },
      {
        contact_id: contacts.rows[0]?.id,
        user_id: users.rows[0]?.id,
        note: "Follow-up: Khách hàng quan tâm đến ISI Language School và Human Academy. Hỏi thêm về quy trình xin visa và thời gian chuẩn bị hồ sơ. Hẹn call lại vào thứ 3 tuần sau.",
        created_at: new Date(Date.now() - 30 * 60 * 1000) // 30 phút trước
      },

      // Contact 2: Trần Thị Mai (pending)
      {
        contact_id: contacts.rows[1]?.id,
        user_id: users.rows[1]?.id,
        note: "Đã liên hệ khách hàng qua phone. Khách đang học năm cuối, dự kiến tốt nghiệp tháng 6. Quan tâm đến học bổng MEXT và các trường có tỷ lệ visa cao. Đã gửi thông tin chi tiết qua email.",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 ngày trước
      },
      {
        contact_id: contacts.rows[1]?.id,
        user_id: users.rows[1]?.id,
        note: "Khách hàng confirm nhận được email. Đang xem xét giữa Tokyo và Osaka. Yêu cầu thêm thông tin về chi phí sinh hoạt và cơ hội việc làm part-time. Chuẩn bị report so sánh 2 thành phố.",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 ngày trước
      },

      // Contact 3: Lê Hoàng Minh (responded)
      {
        contact_id: contacts.rows[2]?.id,
        user_id: users.rows[0]?.id,
        note: "Khách đã có N3, trình độ khá tốt. Đã tư vấn 3 trường tại Osaka: ECC, Arc Academy, J International. Khách quan tâm nhất đến ECC vì có support việc làm tốt.",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 ngày trước
      },
      {
        contact_id: contacts.rows[2]?.id,
        user_id: users.rows[0]?.id,
        note: "Đã gửi application form của ECC. Khách confirm sẽ nộp hồ sơ trong tuần này. Cần hỗ trợ dịch thuật bằng tốt nghiệp và bản sao passport. Quote phí dịch thuật: 500k VNĐ.",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 ngày trước
      },
      {
        contact_id: contacts.rows[2]?.id,
        user_id: users.rows[0]?.id,
        note: "Khách đã nộp hồ sơ hoàn tất. Đang chờ kết quả từ trường (khoảng 2-3 tuần). Đã add vào group Zalo để updates thường xuyên. Next step: chuẩn bị hồ sơ xin visa khi có acceptance letter.",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 ngày trước
      },

      // Contact 4: Phạm Thu Hương (closed)
      {
        contact_id: contacts.rows[3]?.id,
        user_id: users.rows[2]?.id,
        note: "Khách hàng đã đăng ký khóa học online 6 tháng để chuẩn bị. Payment completed: 12,000,000 VNĐ. Bắt đầu học từ thứ 2 tuần sau. Assigned teacher: Tanaka-sensei.",
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 ngày trước
      },
      {
        contact_id: contacts.rows[3]?.id,
        user_id: users.rows[2]?.id,
        note: "Follow-up sau 1 tuần học: Khách hàng feedback tích cực, tiến độ tốt. Dự kiến sẽ apply du học sau khi hoàn thành khóa online. Case closed với outcome: CONVERTED TO STUDENT.",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 ngày trước
      },

      // Contact 5: Vũ Đức Thành (new)
      {
        contact_id: contacts.rows[4]?.id,
        user_id: users.rows[1]?.id,
        note: "Lead mới từ website. Đã có N2, background IT strong. Quan tâm đến chương trình kết hợp học + làm. Cần research về work visa transition và các công ty IT tại Nhật có partnership.",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 giờ trước
      },

      // Contact 6: Đỗ Thị Lan (pending)
      {
        contact_id: contacts.rows[5]?.id,
        user_id: users.rows[0]?.id,
        note: "Tư vấn về chương trình exchange. Đã liên hệ với 2 trường đối tác: Waseda và Sophia. Khách cần chuẩn bị TOEFL và portfolio. Deadline apply: 31/3. Urgent follow-up needed.",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 ngày trước
      }
    ];

    // Insert contact notes
    for (const note of contactNotesData) {
      if (note.contact_id && note.user_id) {
        await db.query(
          `INSERT INTO contact_notes (contact_id, user_id, note, created_at)
           VALUES ($1, $2, $3, $4)`,
          [note.contact_id, note.user_id, note.note, note.created_at]
        );
        
        console.log(`✅ Created note for contact ID ${note.contact_id}`);
      }
    }

    console.log("✅ Contact notes seeded successfully");

  } catch (err) {
    console.error("❌ Contact notes seed error:", err.message);
  }
};

run();