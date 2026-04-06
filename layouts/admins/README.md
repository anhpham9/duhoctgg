# Dashboard Admin - Du Học NB

## 📁 Cấu trúc Files

### 🌐 HTML Pages
- `dashboard.html` - Trang dashboard chính
- `login.html` - Trang đăng nhập admin

### 🎨 CSS Architecture
- `assets/css/style.css` - **CSS tái sử dụng** (sidebar, header, cards, components)
- `assets/css/dashboard.css` - **CSS riêng cho dashboard** (charts, activities, stats)
- `assets/css/responsive.css` - **Tất cả responsive breakpoints**
- `assets/css/login.css` - CSS riêng cho trang login

### 🔧 JavaScript
- `assets/js/dashboard.js` - Tương tác dashboard (sidebar, mobile menu, notifications)

### 🖼️ Assets
- `assets/images/` - Thư mục chứa hình ảnh

## 🎯 Tính năng Dashboard

### ✅ Layout Components (Reusable)
- **Sidebar Navigation** với submenu
- **Header** với search, notifications, profile dropdown
- **Mobile responsive** với overlay
- **Card components** tái sử dụng
- **Stat cards** với icons và animations

### ✅ Dashboard Specific
- **Thống kê overview** (4 stat cards)
- **Biểu đồ cột** interactive với hover effects
- **Activity feed** thời gian thực
- **Quick actions** grid
- **Top schools** ranking list
- **Breadcrumb navigation**

### ✅ Interactions
- **Sidebar toggle** (desktop/mobile)
- **Mobile menu** với overlay
- **Profile dropdown**
- **Search functionality** 
- **Chart interactions** (click bars)
- **Notification system** (toast messages)
- **Keyboard shortcuts** (Ctrl+K for search, Esc to close)

## 📱 Responsive Design

### 🖥️ Desktop (1200px+)
- Sidebar 260px width
- Full dashboard grid (2 columns)
- All features visible

### 💻 Tablet (768px - 1024px)
- Sidebar 240px width
- Single column dashboard
- Condensed quick actions (4 columns)

### 📱 Mobile (≤768px)
- Sidebar overlay với mobile toggle
- Stack layout (single column)
- Compressed components
- Touch-friendly interactions

### 📲 Small Mobile (≤480px)
- Full-width sidebar overlay
- Vertical quick actions
- Stacked activity items
- Hidden breadcrumbs

## 🎨 Color Scheme

### 🔴 Primary Colors
- **Main**: `#d32f2f` (Du Học NB red)
- **Dark**: `#b71c1c`
- **Light**: `#ff5722`

### ⚪ Neutral Colors
- **Background**: `#f5f5f5`
- **Cards**: `#ffffff`
- **Text**: `#333333`
- **Muted**: `#666666`

### 🌈 Status Colors
- **Success**: `#28a745`
- **Warning**: `#ffc107`
- **Danger**: `#dc3545`
- **Info**: `#17a2b8`

## 🔄 Reusability

### 📋 Components có thể tái sử dụng
1. **Sidebar** - Copy sidebar HTML + CSS từ style.css
2. **Header** - Copy header HTML + CSS từ style.css
3. **Cards** - Sử dụng `.dashboard-card` class
4. **Stats** - Sử dụng `.stat-card` structure
5. **Mobile behavior** - JavaScript tự động work

### 📝 Để tạo page mới:
1. Copy cấu trúc HTML từ dashboard.html
2. Thay nội dung trong `.dashboard-container`
3. Tạo CSS riêng cho page đó (ví dụ: `users.css`)
4. Import đúng thứ tự: style.css → page.css → responsive.css

## 🚀 Setup Instructions

### 1. File Structure
```
layouts/admins/
├── dashboard.html
├── login.html
├── assets/
│   ├── css/
│   │   ├── style.css (reusable)
│   │   ├── dashboard.css (specific)
│   │   ├── responsive.css (all breakpoints)
│   │   └── login.css
│   ├── js/
│   │   └── dashboard.js
│   └── images/
│       ├── logo01.png
│       └── avatar-placeholder.jpg
```

### 2. CSS Import Order
```html
<link rel="stylesheet" href="assets/css/style.css">
<link rel="stylesheet" href="assets/css/dashboard.css">
<link rel="stylesheet" href="assets/css/responsive.css">
```

### 3. Required Images
- `logo01.png` - Logo Du Học NB
- `avatar-placeholder.jpg` - Default avatar

## 🎯 Next Steps

### 📄 Pages cần tạo tiếp:
- `users.html` - Quản lý người dùng
- `contacts.html` - Quản lý liên hệ  
- `schools.html` - Quản lý trường học
- `applications.html` - Quản lý đơn đăng ký
- `news.html` - Quản lý tin tức
- `settings.html` - Cài đặt hệ thống

### 🔧 Features cần thêm:
- Data tables với sort/filter
- Form validation
- File upload components
- Date picker
- Rich text editor
- Modal dialogs

## 📞 Support

Tất cả components đã được tối ưu để:
- ✅ Tái sử dụng dễ dàng
- ✅ Mobile-first responsive
- ✅ Touch-friendly
- ✅ Accessible
- ✅ Performance optimized
- ✅ Cross-browser compatible

Sử dụng màu chủ đạo `#d32f2f` nhất quán trong toàn bộ hệ thống! 🎨
