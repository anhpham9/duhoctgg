
import db from "../../src/config/db.js";

const firstNames = ['An', 'Binh', 'Chi', 'Dung', 'Huy', 'Khanh', 'Linh', 'Minh', 'Nam', 'Phuong', 'Quang', 'Trang', 'Tuan', 'Vy'];
const lastNames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Phan', 'Vu', 'Dang', 'Bui', 'Do'];
const reviewTemplates = [
  'Giang vien nhiet tinh, ho tro hoc vien rat tot. Co so vat chat hien dai va lop hoc de theo sat.',
  'Moi truong hoc tap than thien, chuong trinh hoc phu hop cho du hoc sinh quoc te.',
  'Thong tin ve hoc bong ro rang, phong dao tao phan hoi nhanh va chuyen nghiep.',
  'Toi hai long voi chat luong giang day va cach nha truong ho tro trong qua trinh hoc tap.'
];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFrom = (arr) => arr[randInt(0, arr.length - 1)];

const randomName = () => `${randFrom(lastNames)} ${randFrom(firstNames)}`;
const randomAvatarUrl = () => `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(randomName())}`;
const randomCoursePeriod = () => {
  const start = randInt(2021, 2026);
  const end = randInt(start + 1, start + 4);
  return `${start}-${end}`;
};

const nationalities = [
  'Việt Nam', 'Nhật Bản', 'Hàn Quốc', 'Trung Quốc', 'Mỹ', 'Úc', 'Anh', 'Pháp', 'Đức', 'Thái Lan'
];

const run = async () => {
  try {
    const res = await db.query('SELECT id FROM schools');
    const schoolIds = res.rows.map(row => row.id);
    if (schoolIds.length === 0) {
      console.log('No schools found. Please seed schools first.');
      return;
    }

    let total = 0;
    for (const schoolId of schoolIds) {
      const numReviews = randInt(2, 4);
      for (let i = 0; i < numReviews; i++) {
        const studentName = randomName();
        const avatarUrl = randomAvatarUrl();
        const nationality = randFrom(nationalities);
        const coursePeriod = randomCoursePeriod();
        const rating = randInt(3, 5);
        const content = `${randFrom(reviewTemplates)} ${randFrom(reviewTemplates)}`;
        await db.query(
          `INSERT INTO school_reviews (school_id, student_name, avatar_url, nationality, course_period, rating, content)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [schoolId, studentName, avatarUrl, nationality, coursePeriod, rating, content]
        );
        total++;
      }
    }
    console.log(`✅ Seeded ${total} school reviews.`);
  } catch (err) {
    console.error('❌ Error seeding school_reviews:', err.message);
  }
};

run();
