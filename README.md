# 🎓 Du Học Nhật Bản - Web System

## 📌 Giới thiệu

Hệ thống website hỗ trợ tư vấn du học Nhật Bản, bao gồm:

* Trang thông tin cho người dùng (frontend)
* Hệ thống quản trị (admin)
* API backend phục vụ dữ liệu

---

## 🏗️ Kiến trúc hệ thống

* Frontend: Nuxt.js
* Backend: Node.js (Express)
* Database: PostgreSQL
* Storage: Cloudinary

---

## 🔐 Tính năng chính

### 👤 Authentication & Authorization

* Login bằng username/password
* JWT authentication
* RBAC (Role-Based Access Control)

### 📰 Quản lý nội dung (CMS)

* Quản lý bài viết (news)
* Quản lý trang tĩnh (about, điều kiện, liên hệ)
* SEO (slug, meta title, meta description)

### 🏫 Quản lý trường học

* Danh sách trường Nhật ngữ
* Đánh giá & review từ học sinh
* FAQ theo từng trường

### 📞 Quản lý khách hàng (CRM)

* Nhận form liên hệ
* Theo dõi trạng thái (funnel)
* Gán nhân viên xử lý

---

## 🧱 Cấu trúc thư mục (Backend)

```
src/
├── config/        # DB config
├── controllers/   # Xử lý request
├── routes/        # API routes
├── services/      # Business logic
├── middlewares/   # Auth, RBAC
├── utils/         # JWT, helpers
```

---

## ⚙️ Cài đặt & chạy project

### Quick Start từ root (khuyến nghị)

Sau khi clone, đứng tại thư mục root project và chạy:

```bash
npm run setup:full
```

Lệnh trên sẽ:
1. Cài dependencies cho backend + frontend
2. Chạy migrate schema
3. Chạy full seed dữ liệu (`seedAll`)

Hoặc nếu muốn tách 2 bước:

```bash
npm run install:all
npm run setup:db
```

Kiểm tra nhanh toàn bộ luồng phân quyền:

```bash
npm run verify:permissions-all
```

### 1. Clone project

```bash
git clone https://github.com/anhpham9/project-duhocNB.git
cd backend
```

---

### 2. Cài dependencies

```bash
npm install
```

---

### 3. Tạo file .env

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=duhoc_db
DB_PASSWORD=your_password
DB_PORT=5432

JWT_SECRET=your_secret
PORT=5000
```

---

### 4. Chạy server

```bash
npm run dev
```

---

## 🔑 Tạo tài khoản admin

```bash
node scripts/createAdmin.js
```

---

## 📡 API cơ bản

### Login

```
POST /api/auth/login
```

Body:

```json
{
  "username": "admin",
  "password": "123456"
}
```

---

## 🔐 Cách sử dụng token

Header:

```
Authorization: Bearer <token>
```

---

## 🧠 Database Design

### Các bảng chính:

* users / roles / permissions
* news / categories
* contacts
* schools / reviews / faqs
* static_pages / page_contents
* settings

---

## 🚀 Định hướng phát triển

* Refresh token
* Upload ảnh (Cloudinary)
* Dashboard admin
* Logging & monitoring
* Deploy (Docker, VPS)

---

## 👨‍💻 Tác giả

* Name: ANH PHẠM
* Role: Fullstack Developer
* Tech: Node.js, PostgreSQL, Nuxt.js
