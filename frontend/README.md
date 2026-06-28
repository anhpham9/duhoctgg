# 🌐 Frontend - Du Học Nhật Bản

## 📌 Giới thiệu

Frontend của hệ thống website tư vấn du học Nhật Bản.
Xây dựng bằng Nuxt.js, kết nối với backend API (Node.js).

---

## 🛠️ Công nghệ sử dụng

* Nuxt 4
* Vue 3 (Composition API)
* Fetch API ($fetch)
* CSS / SCSS (tùy chỉnh)

---

## 📁 Cấu trúc thư mục

```
frontend/
├── pages/        # Các trang (routing tự động)
├── components/   # UI components
├── layouts/      # Layout chung (header, footer)
├── composables/  # Logic dùng lại (API, auth...)
├── assets/       # CSS, images
```

---

## ⚙️ Cài đặt & chạy

### 1. Cài dependencies

```bash
npm install
```

---

### 2. Chạy dev

```bash
npm run dev
```

👉 Mở trình duyệt:

```
http://localhost:3000
```

---

## 🔗 Kết nối Backend

Cấu hình trong:

```
nuxt.config.ts
```

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: "http://localhost:5000/api"
    }
  }
})
```

---

## 🔐 Authentication

* Gọi API login:

```
POST /api/auth/login
```

* Lưu token:

```js
localStorage.setItem("token", res.token);
```

---

## 🚀 Định hướng phát triển

* Trang login + dashboard admin
* Trang danh sách trường học
* Trang tin tức
* SEO (meta, slug)
* Responsive UI

---

## 📸 Screenshots

- Login page
- Homepage

---

## 🌐 Deployment

* Frontend: Vercel (planned)
* Backend: VPS / Render

---

## 👨‍💻 Developer

* Name: ANH PHẠM
* Stack: Nuxt, Node.js, PostgreSQL
