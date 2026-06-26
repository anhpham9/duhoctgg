# Ngày 1 (nối tiếp ngày 3 backend)

## 🎯 PHẦN 1 — Tạo project Nuxt

```
duhocNB> npx nuxi init frontend
Need to install the following packages:
nuxi@3.34.0
Ok to proceed? (y) y


        .d$b.
       i$$A$$L  .d$b
     .$$F` `$$L.$$A$$.
    j$$'    `4$$:` `$$.
   j$$'     .4$:    `$$.
  j$$`     .$$:      `4$L
 :$$:____.d$$:  _____.:$$:
 `4$$$$$$$$P` .i$$$$$$$$P`

┌  Welcome to Nuxt!
│
◇  Templates loaded
│
◇  Which template would you like to use?
│  minimal – Minimal setup for Nuxt 4
│
◇  Creating project in frontend
│
◇  The directory frontend already exists. What would you like to do?
│  Override its contents
│
◇  Downloaded minimal template
│
◇  Which package manager would you like to use?
│  npm
│
◇  Initialize git repository?
│  No
│
◇  Dependencies installed
│
◇  Would you like to browse and install modules?
│  No
│
└  ✨ Nuxt project has been created with the minimal template.

╭── 👉 Next steps ───╮
│                    │
│   › cd frontend    │
│   › npm run dev    │
│                    │
╰────────────────────╯
```

### 📁 Cấu trúc sau khi tạo

```
duhocNB/
  ├── backend/
  └── frontend/
```

## 🎯 PHẦN 2 — Chạy frontend


```BASH
npm run dev
```

👉 mở:

```
http://localhost:3000
```

## 🎯 PHẦN 3 — Cấu hình gọi API backend

### 🧱 Tạo config

📁 nuxt.config.ts

```
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBase: "http://localhost:5000/api"
    }
  }
})
```

## 🎯 PHẦN 4 — Tạo page login

📁 pages/login.vue

```
<template>
    <div>
        <h2>Login</h2>

        <input v-model="username" placeholder="Username" />
        <br /><br />

        <input v-model="password" type="password" placeholder="Password" />
        <br /><br />

        <button @click="handleLogin">Login</button>
    </div>
</template>

<script setup>
const config = useRuntimeConfig();

const username = ref("");
const password = ref("");

const handleLogin = async () => {
    try {
        const res = await $fetch(`${config.public.apiBase}/auth/login`, {
            method: "POST",
            body: {
                username: username.value,
                password: password.value
            }
        });

        localStorage.setItem("token", res.token);

        alert("Login success!");
    } catch (err) {
        alert("Login failed");
    }
};
</script>
```

## 🎯 PHẦN 5 — Tạo app.vue

Kiểm tra xem, nếu mặc định Nuxt đang dùng 📁 app/app.vue, thì xóa đi.

tạo app.vue trực tiếp trong thư mục 📁frontend

```
<template>
    <NuxtPage />
</template>
```

## 🎯 PHẦN 6 — Test thực tế

👉 Backend chạy:

```
# npm run dev
http://localhost:5000
```

👉 Frontend:

```
# npm run dev
http://localhost:3000/login
```

## 🎯 Flow sẽ như sau

```
Frontend (Nuxt)
   ↓
POST /api/auth/login
   ↓
Backend trả JWT
   ↓
Frontend lưu localStorage
```

# Ngày 2 (nối tiếp ngày 4 backend)

## 🧱 PHẦN 3 — Frontend: Auth flow

### 🧱 Update login

📁 pages/login.vue

```
localStorage.setItem("token", res.token);
navigateTo("/admin");
```

### 🧱 Tạo page admin

📁 pages/admin/index.vue

```
<template>
    <h1>Admin Dashboard</h1>
</template>
```

### 🧱 Gửi token mỗi request

📁 composables/useApi.js

```
export const useApi = (url, options = {}) => {
    const token = localStorage.getItem("token");

    return $fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
```

## 🧱 PHẦN 4 — Frontend: Route Middleware

### 🧱 Middleware

📁 middleware/auth.ts

```
export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.server) return;

    // 👇 CHẶN LOGIN PAGE
    if (to.path === "/login") return;

    const token = localStorage.getItem("token");

    if (!token) {
        return navigateTo("/login");
    }
});
```

### 🧱 Apply vào các page cần auth

```
<script setup>
definePageMeta({
  middleware: "auth",
});
</script>
```

### 🎯 Sau bước này bạn sẽ có

```
✔ Login
✔ JWT
✔ Protected API
✔ RBAC backend
✔ Protected frontend route
```

## 🧱 PHẦN 5 — Frontend: RBAC

### 🧱 2. Decode token (lấy role)

👉 cài lib:

```
npm install jwt-decode
```

📁 utils/auth.js

```
import { jwtDecode } from "jwt-decode";

export const getUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  return jwtDecode(token);
};
```

### 🧱 3. Ẩn menu theo role

📁 layouts/admin.vue

```
<script setup>
import { getUser } from "~/utils/auth";

const user = getUser();
</script>

<template>
  <div class="admin-layout">
    <aside>
      <ul>
        <li v-if="user?.role_id === 1">User Management</li>
        <li>News</li>
        <li v-if="user?.role_id !== 5">Settings</li>
      </ul>
    </aside>

    <slot />
  </div>
</template>
```

### 🧱 4. Middleware kiểm tra quyền

📁 types/user.ts

```
export interface IUser {
  id: number;
  role_id: number;
}
```

📁 middleware/permission.ts

```
import { jwtDecode } from "jwt-decode";
import type { IUser } from "~/types/user";

export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.server) return;

    // 👇 CHẶN LOGIN PAGE
    if (to.path === "/login") return;

    const token = localStorage.getItem("token");

    if (!token) return navigateTo("/login");

    let user: IUser;

    try {
        user = jwtDecode(token) as IUser;
    } catch {
        return navigateTo("/login");
    }

    if (to.path.startsWith("/admin/users") && user.role_id !== 1) {
        return navigateTo("/admin");
    }
});
```

### 🧱 5. Apply vào page

📁 pages/admin/users.vue

```
<script setup>
definePageMeta({
  middleware: ["auth", "permission"],
});
</script>
```

### 🎯 Flow hoàn chỉnh

```
Frontend → gửi token
Backend → authenticate
         → checkPermission
         → cho / chặn

Frontend:
✔ ẩn menu
✔ chặn route
```

# Ngày 3

## 🎯 1. Tư duy tổng thể (rất quan trọng)

Có 3 loại UI:

```
1. Public site (index, about, schools, news...)
2. Login (riêng biệt)
3. Admin (dashboard, users...)
```

👉 tương ứng với 3 layout

## 🧱 2. Cấu trúc thư mục chuẩn

```
frontend/
├── layouts/
│   ├── default.vue      ← giao diện public
│   ├── admin.vue        ← giao diện admin
│   └── empty.vue        ← login
│
├── pages/
│   ├── index.vue
│   ├── about.vue
│   ├── login.vue
│   └── admin/
│       ├── index.vue
│       ├── users.vue
│       └── schools.vue
│
├── assets/
│   ├── css/
│   │   └── main.css
│   └── js/
│       └── main.js
```

## 🎨 3. Thêm CSS global

### 🧱 Bước 1 — tạo file

📁 assets/css/main.css

```
body {
  font-family: Arial, sans-serif;
}

.container {
  max-width: 1200px;
  margin: auto;
}

```

### 🧱 Bước 2 — import vào config

📁 nuxt.config.ts

```
export default defineNuxtConfig({
  css: ["~/assets/css/main.css"],
});
```

### 🧱 Bước 3 — CSS cho từng layout

🟢 Layout PUBLIC

📁 layouts/default.vue

```
<script setup>
import "~/assets/css/public.css";
</script>

<template>
  <div class="public-layout">
    <header>Header</header>
    <slot />
  </div>
</template>
```

## ⚡ 4. Thêm JS global

### 🧱 Cách 1 (khuyên dùng trong Nuxt)

👉 KHÔNG dùng `<script>` như `HTML`

👉 dùng plugin

📁 plugins/main.js

```
export default defineNuxtPlugin(() => {
  console.log("Global JS loaded");
});

```

### 🧱 Cách 2 (nếu là script ngoài)


```
export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: "/js/custom.js",
          defer: true,
        },
      ],
    },
  },
});
```

## 🧱 5. Layout PUBLIC (default)

📁 layouts/default.vue

```
<template>
  <div>
    <header>Header Public</header>

    <main>
      <slot />
    </main>

    <footer>Footer</footer>
  </div>
</template>
```

👉 các page:

```
index.vue
about.vue
schools.vue
news.vue
```

👉 tự động dùng layout này

## 🧱 6. Layout LOGIN (riêng)

📁 layouts/empty.vue

```
<template>
  <div>
    <slot />
  </div>
</template>
```

📁 pages/login.vue

```
<script setup>
definePageMeta({
  layout: "empty",
});
</script>

<template>
  <h2>Login</h2>
</template>
```

## 🧱 7. Layout ADMIN

📁 layouts/admin.vue

```
<template>
  <div class="admin-layout">
    <aside>Sidebar</aside>

    <div class="content">
      <header>Admin Header</header>

      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
```

📁 pages/admin/index.vue

```
<script setup>
definePageMeta({
  layout: "admin",
  middleware: "auth",
});
</script>

<template>
  <h1>Dashboard</h1>
</template>
```

👉 các page admin khác cũng tương tự:

```
admin/users.vue
admin/schools.vue
```

# Ngày 4 (Nối tiếp ngày 4 backend)

## Thêm xử lý RBAC cho frontend

📁 composables/usePermissionGuard.js

```
import { ref, onMounted, computed, readonly, nextTick } from "vue"
import { jwtDecode } from "jwt-decode"

/**
 * Composable for handling permission checks in admin pages
 * @param {Array} allowedRoles - Array of role IDs that can access this page
 * @param {Object} options - Additional options
 * @returns {Object} - Permission state and methods
 */
export const usePermissionGuard = (allowedRoles = [], options = {}) => {
    const {
        redirectTo = '/admin',
        redirectDelay = 2000,
        autoRedirect = true
    } = options

    const isCheckingPermission = ref(true)
    const hasPermission = ref(false)
    const currentUser = ref(null)
    const permissionError = ref(null)

    // Role mapping for display
    const roleMap = {
        1: 'Superadmin',     // Toàn quyền
        2: 'Admin',          // Admin (toàn quyền trừ tạo tài khoản admin + super admin)
        3: 'Manager',        // Quản lý
        4: 'Editor',         // Biên tập nội dung
        5: 'Consultant'      // Tư vấn
    }

    const checkPermissions = async () => {
        if (!process.client) {
            isCheckingPermission.value = false
            return
        }
        
        try {
            const token = localStorage.getItem('token')
            
            if (!token) {
                console.warn('🚫 No token found, redirecting to login')
                await navigateTo('/login')
                return
            }

            // Decode JWT token
            const user = jwtDecode(token)
            currentUser.value = user
            
            // Check permissions
            hasPermission.value = allowedRoles.includes(user.role_id)
            
            if (!hasPermission.value) {
                console.warn(`🚫 User role ${user.role_id} not allowed. Required roles: [${allowedRoles.join(', ')}]`)
                permissionError.value = {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: 'Bạn không có quyền truy cập trang này.',
                    userRole: user.role_id,
                    requiredRoles: allowedRoles
                }

                if (autoRedirect) {
                    setTimeout(async () => {
                        await navigateTo(redirectTo)
                    }, redirectDelay)
                }
            } else {
                console.log(`✅ Permission granted for role ${user.role_id}`)
            }
            
        } catch (error) {
            console.error('❌ Permission check error:', error)
            permissionError.value = {
                code: 'TOKEN_ERROR',
                message: 'Lỗi xác thực. Vui lòng đăng nhập lại.',
                error: error.message
            }
            
            if (autoRedirect) {
                setTimeout(async () => {
                    await navigateTo('/login')
                }, redirectDelay)
            }
        } finally {
            isCheckingPermission.value = false
        }
    }

    const getUserRoleName = () => {
        if (!currentUser.value) return 'Unknown'
        return roleMap[currentUser.value.role_id] || `Role ${currentUser.value.role_id}`
    }

    const getUserInfo = () => {
        if (!currentUser.value) return null
        return {
            id: currentUser.value.id,
            username: currentUser.value.username,
            role_id: currentUser.value.role_id,
            role_name: getUserRoleName()
        }
    }

    const retryPermissionCheck = () => {
        isCheckingPermission.value = true
        hasPermission.value = false
        permissionError.value = null
        checkPermissions()
    }

    // Auto-check permissions on mount
    onMounted(() => {
        checkPermissions()
    })

    return {
        // States
        isCheckingPermission: readonly(isCheckingPermission),
        hasPermission: readonly(hasPermission),
        currentUser: readonly(currentUser),
        permissionError: readonly(permissionError),
        
        // Methods
        checkPermissions,
        getUserRoleName,
        getUserInfo,
        retryPermissionCheck
    }
}

// Predefined permission sets for common admin pages
export const ADMIN_PERMISSIONS = {
    SUPERADMIN_ONLY: [1],              // Chỉ Superadmin
    ADMIN_LEVEL: [1, 2],               // Superadmin + Admin
    MANAGEMENT_LEVEL: [1, 2, 3],       // Superadmin + Admin + Manager
    CONTENT_EDITORS: [1, 2, 3, 4],     // Superadmin + Admin + Manager + Editor
    CONTACT_HANDLERS: [1, 2, 3, 5],    // Superadmin + Admin + Manager + Consultant
    ALL_ROLES: [1, 2, 3, 4, 5]         // Tất cả roles
}
```

📁 components/admin/PermissionGuard.vue

```
<template>
    <div class="permission-guard">
        <!-- Loading state while checking permissions -->
        <div v-if="isCheckingPermission" class="loading-container">
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>{{ loadingMessage }}</p>
            </div>
        </div>

        <!-- Access denied -->
        <div v-else-if="!hasPermission" class="access-denied">
            <div class="denied-content">
                <i class="fas fa-ban"></i>
                <h2>{{ deniedTitle }}</h2>
                <p>{{ deniedMessage }}</p>

                <!-- Error details in development -->
                <div v-if="showErrorDetails && permissionError" class="error-details">
                    <details>
                        <summary>Chi tiết lỗi</summary>
                        <pre>{{ JSON.stringify(permissionError, null, 2) }}</pre>
                    </details>
                </div>

                <div class="denied-actions">
                    <button @click="handleBackClick" class="btn-back">
                        <i class="fas fa-arrow-left"></i>
                        {{ backButtonText }}
                    </button>

                    <button v-if="showRetry" @click="retryPermissionCheck" class="btn-retry">
                        <i class="fas fa-redo"></i>
                        Thử lại
                    </button>
                </div>
            </div>
        </div>

        <!-- Main content - only shown when permission granted -->
        <div v-else class="permission-granted">
            <!-- User info banner (optional) -->
            <div v-if="showUserInfo" class="user-info-banner">
                <small>
                    <i class="fas fa-user"></i>
                    Đăng nhập với quyền: <strong>{{ getUserRoleName() }}</strong>
                    <span v-if="currentUser"> - {{ currentUser.username }}</span>
                </small>
            </div>

            <!-- Slot for main content -->
            <slot :user="getUserInfo()" :userRole="getUserRoleName()"></slot>
        </div>
    </div>
</template>

<script setup>
// Import the composable and navigateTo
import { usePermissionGuard } from '~/composables/usePermissionGuard'

const props = defineProps({
    allowedRoles: {
        type: Array,
        required: true
    },
    redirectTo: {
        type: String,
        default: '/admin'
    },
    redirectDelay: {
        type: Number,
        default: 2000
    },
    autoRedirect: {
        type: Boolean,
        default: true
    },
    loadingMessage: {
        type: String,
        default: 'Kiểm tra quyền truy cập...'
    },
    deniedTitle: {
        type: String,
        default: 'Truy cập bị từ chối'
    },
    deniedMessage: {
        type: String,
        default: 'Bạn không có quyền truy cập trang này.'
    },
    backButtonText: {
        type: String,
        default: 'Quay lại Dashboard'
    },
    showUserInfo: {
        type: Boolean,
        default: false
    },
    showRetry: {
        type: Boolean,
        default: true
    },
    showErrorDetails: {
        type: Boolean,
        default: false // Set to true in development
    }
})

// Use the permission guard composable
const {
    isCheckingPermission,
    hasPermission,
    currentUser,
    permissionError,
    getUserRoleName,
    getUserInfo,
    retryPermissionCheck
} = usePermissionGuard(props.allowedRoles, {
    redirectTo: props.redirectTo,
    redirectDelay: props.redirectDelay,
    autoRedirect: props.autoRedirect
})

const handleBackClick = () => {
    navigateTo(props.redirectTo)
}

// Expose methods for parent components if needed
defineExpose({
    hasPermission,
    currentUser,
    getUserInfo,
    retryPermissionCheck
})
</script>
```
## Gắn xử lý RBAC cho Admin menu

📁 components/admin/AdminSidebar.vue

```
<template>
    <aside class="sidebar" id="sidebar" :class="{ collapsed: isCollapsed, active: isMobileOpen }">
        <div class="sidebar-header">
            <div class="sidebar-logo">
                <img src="/assets/images/admin/logo01.png" alt="Du Học NB" class="logo-img">
                <h3 class="logo-text">Du Học NB</h3>
            </div>
            <button class="sidebar-toggle" id="sidebarToggle" @click="handleSidebarToggle">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <nav class="sidebar-nav">
            <ul class="nav-list">
                <li class="nav-item" :class="{ active: isActivePage('/admin') }">
                    <NuxtLink to="/admin" class="nav-link" @click="handleNavLinkClick">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                    </NuxtLink>
                </li>
                <li v-if="canAccessUsers" class="nav-item" :class="{ active: isActivePage('/admin/users') }">
                    <NuxtLink to="/admin/users" class="nav-link" @click="handleNavLinkClick">
                        <i class="fas fa-users"></i>
                        <span>Người dùng</span>
                    </NuxtLink>
                </li>
                <li v-if="canAccessContacts" class="nav-item" :class="{ active: isActivePage('/admin/contacts') }">
                    <NuxtLink to="/admin/contacts" class="nav-link" @click="handleNavLinkClick">
                        <i class="fas fa-address-book"></i>
                        <span>Liên hệ</span>
                    </NuxtLink>
                </li>
                <li v-if="canAccessSchools" class="nav-item" :class="{ active: isActivePage('/admin/schools') }">
                    <NuxtLink to="/admin/schools" class="nav-link" @click="handleNavLinkClick">
                        <i class="fas fa-university"></i>
                        <span>Trường học</span>
                    </NuxtLink>
                </li>
                <li v-if="canAccessNews" class="nav-item has-submenu" :class="{ active: openSubmenus.includes('news') }">
                    <a href="#" class="nav-link" @click="toggleSubmenu('news')">
                        <i class="fas fa-newspaper"></i>
                        <span>Tin tức</span>
                        <i class="fas fa-chevron-down submenu-arrow" :class="{ 'rotated': openSubmenus.includes('news') }"></i>
                    </a>
                    <ul class="submenu" :class="{ 'open': openSubmenus.includes('news') }">
                        <li><NuxtLink to="/admin/news" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/news') }">Danh sách tin</NuxtLink></li>
                        <li><NuxtLink to="/admin/news/categories" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/news/categories') }">Danh mục</NuxtLink></li>
                    </ul>
                </li>
                <li v-if="canAccessContent" class="nav-item has-submenu" :class="{ active: openSubmenus.includes('content') }">
                    <a href="#" class="nav-link" @click="toggleSubmenu('content')">
                        <i class="fas fa-file-alt"></i>
                        <span>Nội dung</span>
                        <i class="fas fa-chevron-down submenu-arrow" :class="{ 'rotated': openSubmenus.includes('content') }"></i>
                    </a>
                    <ul class="submenu" :class="{ 'open': openSubmenus.includes('content') }">
                        <li><NuxtLink to="/admin/content/homepage" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/content/homepage') }">Trang chủ</NuxtLink></li>
                        <li><NuxtLink to="/admin/content/about" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/content/about') }">Giới thiệu</NuxtLink></li>
                        <li><NuxtLink to="/admin/content/schools" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/content/schools') }">Trường học</NuxtLink></li>
                        <li><NuxtLink to="/admin/content/conditions" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/content/conditions') }">Điều kiện</NuxtLink></li>
                        <li><NuxtLink to="/admin/content/news" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/content/news') }">Tin tức</NuxtLink></li>
                        <li><NuxtLink to="/admin/content/contact" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/content/contact') }">Liên hệ</NuxtLink></li>
                        <li><NuxtLink to="/admin/content/faq" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/content/faq') }">FAQ</NuxtLink></li>
                    </ul>
                </li>
                <li v-if="canAccessSettings" class="nav-item has-submenu" :class="{ active: openSubmenus.includes('settings') }">
                    <a href="#" class="nav-link" @click="toggleSubmenu('settings')">
                        <i class="fas fa-cog"></i>
                        <span>Cài đặt</span>
                        <i class="fas fa-chevron-down submenu-arrow" :class="{ 'rotated': openSubmenus.includes('settings') }"></i>
                    </a>
                    <ul class="submenu" :class="{ 'open': openSubmenus.includes('settings') }">
                        <li><NuxtLink to="/admin/settings/general" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/settings/general') }">Chung</NuxtLink></li>
                        <li><NuxtLink to="/admin/settings/seo" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/settings/seo') }">SEO</NuxtLink></li>
                        <li><NuxtLink to="/admin/settings/backup" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/settings/backup') }">Sao lưu & Khôi phục</NuxtLink></li>
                    </ul>
                </li>
            </ul>
        </nav>

        <div class="sidebar-bottom">
            <button @click="handleLogout" class="logout-btn">
                <i class="fas fa-sign-out-alt"></i>
                <span>Đăng xuất</span>
            </button>
        </div>
    </aside>
</template>

<script setup>
// ========================================
// SIDEBAR NAVIGATION COMPONENT
// ========================================

import { jwtDecode } from "jwt-decode"

const route = useRoute()
const router = useRouter()

// ========================================
// REACTIVE STATE
// ========================================

const openSubmenus = ref([])
const isCollapsed = ref(false)
const isMobileOpen = ref(false)
const isMobile = ref(false)

// ========================================
// USER PERMISSIONS
// ========================================

// Get current user from JWT token
const currentUser = computed(() => {
    if (!process.client) return null
    
    const token = localStorage.getItem('token')
    if (!token) return null
    
    try {
        return jwtDecode(token)
    } catch (error) {
        console.error('Error decoding token:', error)
        return null
    }
})

// Permission checks based on role_id
const canAccessUsers = computed(() => {
    if (!currentUser.value) return false
    // Only Superadmin (1), Admin (2) and Manager (3) can access users
    return [1, 2, 3].includes(currentUser.value.role_id)
})

const canAccessContacts = computed(() => {
    if (!currentUser.value) return false
    // Superadmin (1), Admin (2), Manager (3), and Consultant (5) can access contacts
    return [1, 2, 3, 5].includes(currentUser.value.role_id)
})

const canAccessSchools = computed(() => {
    if (!currentUser.value) return false
    // Superadmin (1), Admin (2), Manager (3) can access schools
    return [1, 2, 3].includes(currentUser.value.role_id)
})

const canAccessNews = computed(() => {
    if (!currentUser.value) return false
    // Superadmin (1), Admin (2), Manager (3), and Editor (4) can access news
    return [1, 2, 3, 4].includes(currentUser.value.role_id)
})

const canAccessContent = computed(() => {
    if (!currentUser.value) return false
    // Superadmin (1), Admin (2), Manager (3) can access content
    return [1, 2, 3].includes(currentUser.value.role_id)
})

const canAccessSettings = computed(() => {
    if (!currentUser.value) return false
    // Only Superadmin (1) and Admin (2) can access settings
    return [1, 2].includes(currentUser.value.role_id)
})

// ========================================
// NAVIGATION HELPERS
// ========================================

const isActivePage = (path) => {
    if (path === '/admin') {
        return route.path === '/admin'
    }
    return route.path.startsWith(path)
}

const toggleSubmenu = (submenu) => {
    // Enhanced submenu logic: close other submenus when opening a new one
    if (openSubmenus.value.includes(submenu)) {
        openSubmenus.value = openSubmenus.value.filter(item => item !== submenu)
    } else {
        // Close all other submenus and open the selected one
        openSubmenus.value = [submenu]
    }
}

// Close all submenus
const closeAllSubmenus = () => {
    openSubmenus.value = []
}

// Check if current route belongs to any submenu
const getCurrentSubmenu = (path) => {
    if (path.startsWith('/admin/news')) return 'news'
    if (path.startsWith('/admin/content')) return 'content'
    if (path.startsWith('/admin/settings')) return 'settings'
    return null
}

// Check if a specific submenu item is active
const isSubmenuItemActive = (path) => {
    return route.path === path
}

// Auto-close sidebar and handle submenu logic
const handleNavLinkClick = () => {
    // Close all submenus when clicking on non-submenu nav items
    closeAllSubmenus()
    
    // Close mobile sidebar if needed
    if (isMobile.value && isMobileOpen.value) {
        // Delay to allow navigation to complete
        setTimeout(closeMobileSidebar, 100)
    }
}

// Handle submenu link clicks (keep submenu open)
const handleSubmenuLinkClick = () => {
    // Only close mobile sidebar, don't close submenu
    if (isMobile.value && isMobileOpen.value) {
        setTimeout(closeMobileSidebar, 100)
    }
}

// ========================================
// USER ACTIONS  
// ========================================

const handleLogout = () => {
    if (process.client) {
        localStorage.removeItem('token')
        
        // Show toast (if available globally)
        if (window.showToast) {
            window.showToast('Đang đăng xuất...', 'info')
        }
        
        setTimeout(() => {
            navigateTo('/login')
        }, 500)
    }
}

// ========================================
// SIDEBAR CONTROLS
// ========================================

const handleSidebarToggle = () => {
    if (isMobile.value) {
        // Mobile behavior: close sidebar
        closeMobileSidebar()
    } else {
        // Desktop behavior: toggle collapsed state
        isCollapsed.value = !isCollapsed.value
    }
}

const closeMobileSidebar = () => {
    isMobileOpen.value = false
    document.body.classList.remove('sidebar-open')
    // Restore page scroll when sidebar closes
    if (process.client) {
        document.body.style.overflow = ''
    }
}

const openMobileSidebar = () => {
    isMobileOpen.value = true
    document.body.classList.add('sidebar-open')
    // Prevent page scroll when mobile sidebar opens
    if (process.client) {
        document.body.style.overflow = 'hidden'
    }
}

// ========================================
// RESPONSIVE HANDLING
// ========================================

const handleResponsive = () => {
    const wasMobile = isMobile.value
    isMobile.value = process.client ? window.innerWidth <= 768 : false
    
    // If switching from mobile to desktop and sidebar is active, close sidebar
    if (wasMobile && !isMobile.value && isMobileOpen.value) {
        closeMobileSidebar()
    }
}

// ========================================
// LIFECYCLE & EVENT LISTENERS
// ========================================

onMounted(() => {
    // Initial responsive check
    handleResponsive()
    
    // Listen for window resize
    if (process.client) {
        window.addEventListener('resize', handleResponsive)
    }
    
    // Handle mobile overlay clicks from parent layout
    const mobileOverlay = document.getElementById('mobileOverlay')
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileSidebar)
    }
    
    // Expose functions globally for mobile toggle button in header
    if (process.client) {
        window.sidebarControls = {
            openMobileSidebar,
            closeMobileSidebar,
            toggleCollapsed: () => isCollapsed.value = !isCollapsed.value
        }
    }
})

// ========================================
// ROUTE WATCHER FOR AUTO-CLOSE
// ========================================

// Watch route changes to auto-close mobile sidebar
watch(() => route.path, (newPath) => {
    // Close mobile sidebar on route change
    if (isMobile.value && isMobileOpen.value) {
        setTimeout(closeMobileSidebar, 150)
    }
    
    // Auto-manage submenus based on current route
    const currentSubmenu = getCurrentSubmenu(newPath)
    if (currentSubmenu) {
        // If navigating to a submenu area, open that submenu
        if (!openSubmenus.value.includes(currentSubmenu)) {
            openSubmenus.value = [currentSubmenu]
        }
    } else {
        // If navigating to non-submenu area, close all submenus
        closeAllSubmenus()
    }
})

onUnmounted(() => {
    // Clean up event listeners
    if (process.client) {
        window.removeEventListener('resize', handleResponsive)
        // Clean up global reference
        if (window.sidebarControls) {
            delete window.sidebarControls
        }
    }
})

// ========================================
// EXPOSE FUNCTIONS FOR PARENT COMPONENTS
// ========================================

defineExpose({
    openMobileSidebar,
    closeMobileSidebar,
    toggleCollapsed: () => isCollapsed.value = !isCollapsed.value,
    isCollapsed: readonly(isCollapsed),
    isMobileOpen: readonly(isMobileOpen)
})
</script>

<style scoped>
/* ========================================
   SUBMENU ANIMATIONS
   ======================================== */
/* .submenu-arrow {
    transition: transform 0.3s ease;
}

.submenu-arrow.rotated {
    transform: rotate(180deg);
} */

/* .submenu {
    display: none;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
}

.submenu.open {
    display: block;
    opacity: 1;
    transform: translateY(0);
} */

/* ========================================
   SIDEBAR STATES
   ======================================== */
/* .sidebar {
    transition: all 0.3s ease;
}

.sidebar.collapsed {
    width: 70px;
} */
/* 
.sidebar.collapsed .logo-text,
.sidebar.collapsed .nav-link span {
    opacity: 0;
    width: 0;
    overflow: hidden;
}

.sidebar.collapsed .submenu {
    display: none !important;
} */

/* ========================================
   MOBILE RESPONSIVE
   ======================================== */
@media (max-width: 768px) {
    /* .sidebar {
        transform: translateX(-100%);
        position: fixed;
        z-index: 1000;
    }
    
    .sidebar.active {
        transform: translateX(0);
    } */
}

/* ========================================
   SUBMENU ACTIVE STATES
   ======================================== */
/* .nav-item.has-submenu.active > .nav-link {
    background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
    background-color: rgba(255, 255, 255, 0.05);
} */
</style>
```

## Gắn xử lý RBAC cho các pages

📁 pages/admin/users.vue

```
<template>
    <PermissionGuard :allowed-roles="ADMIN_PERMISSIONS.MANAGEMENT_LEVEL" :show-user-info="false"
        denied-title="Không thể truy cập Quản lý Người dùng"
        denied-message="Chỉ Superadmin, Admin và Manager mới có thể quản lý người dùng.">
        <template #default="{ user }">
            <div class="users-page">
                <div class="page-header">
                    <h1>
                        <i class="fas fa-users"></i>
                        Quản lý Người dùng
                    </h1>
                    <p>Quản lý tài khoản và phân quyền người dùng trong hệ thống</p>
                </div>

                <div class="page-content">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <i class="fas fa-user-shield"></i>
                            <div>
                                <h3>Superadmin</h3>
                                <span>1 người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-user-tie"></i>
                            <div>
                                <h3>Admin</h3>
                                <span>3 người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-user-tie"></i>
                            <div>
                                <h3>Manager</h3>
                                <span>3 người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-user-edit"></i>
                            <div>
                                <h3>Editor</h3>
                                <span>5 người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-user-friends"></i>
                            <div>
                                <h3>Consultant</h3>
                                <span>2 người dùng</span>
                            </div>
                        </div>
                    </div>

                    <div class="placeholder-content">
                        <i class="fas fa-user-cog"></i>
                        <h3>Tính năng đang phát triển</h3>
                        <p>Giao diện quản lý người dùng sẽ có: Danh sách, Thêm/Sửa/Xóa, Phân quyền, v.v.</p>
                    </div>
                </div>
            </div>
        </template>
    </PermissionGuard>
</template>

<script setup>
// Import permission constants and PermissionGuard component
import { ADMIN_PERMISSIONS } from '~/composables/usePermissionGuard'
import PermissionGuard from '~/components/admin/PermissionGuard.vue'

definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>
```

# ABC

## Restore and Backup Feature

Đã làm xong backend end-to-end cho backup/restore để khớp với frontend trang backup.

**Đã triển khai**
1. Tạo bảng lịch sử backup (migration):
    create_backup_records_table.sql
2. Thêm service backup đầy đủ:
    backup.service.js

    - Tạo backup thủ công (json snapshot dữ liệu bảng public)
    - Upload backup file lên server
    - Download theo id
    - Restore từ file backup json
    - Lịch sử backup
    - Cấu hình auto backup daily
    - Cron chạy mỗi phút, đến đúng giờ thì chạy daily backup
    - Retention tự động xóa bản cũ, giữ tối đa 30 bản
3. Thêm controller backup:
    backup.controller.js
    - Role check cho Superadmin/Admin
    - Audit log cho create/upload/download/restore/config update
    - Xử lý lỗi chuẩn response
4. Mở rộng routes settings:
    settings.routes.js
    - GET /settings/backups/history
    - POST /settings/backups/create
    - POST /settings/backups/upload
    - GET /settings/backups/:id/download
    - POST /settings/backups/restore
    - GET /settings/backups/config
    - PUT /settings/backups/config
5. Bật scheduler khi app start:
    app.js
    - Gọi startBackupScheduler khi server listen
6. Tăng độ an toàn transaction restore:
    db.js
    - Thêm getClient để dùng transaction đúng connection
        backup.service.js
    - Restore dùng BEGIN/COMMIT/ROLLBACK trên cùng client
7. Cài dependency upload:
    package.json
    - Thêm multer
        package-lock.json
    - Lock dependency tương ứng


**Đã kiểm tra**

1. Kiểm tra lỗi file: không có lỗi ở các file backend mới/sửa.
2. Smoke-check import module backup service: thành công.

Việc bạn cần chạy để dùng ngay

1. Chạy migration:

```
psql -U <db_user> -d <db_name> -f create_backup_records_table.sql
```

2. Khởi động lại backend:
    npm run dev (trong thư mục backend)

**Lưu ý kỹ thuật*

1. Restore hiện hỗ trợ chuẩn backup json do hệ thống tạo.
2. Nếu upload file zip/sql/bak không đúng format json snapshot, endpoint restore sẽ trả lỗi định dạng không hỗ trợ. Upload vẫn lưu vào lịch sử bình thường.
3. Retention được ép cứng giữ 30 bản gần nhất theo yêu cầu.

**Response mẫu khi gọi endpoint**

```
{
  "success": true,
  "data": {
    "schedulerRunning": true,
    "startedAt": "2026-06-12T02:00:00.000Z",
    "lastRunAt": "2026-06-12T02:00:00.000Z",
    "lastRunStatus": "success",
    "lastRunBackupId": 5,
    "lastRunBackupName": "backup-auto-2026-06-12T02-00-00-000Z.json",
    "lastErrorMessage": null,
    "totalAutoRuns": 3,
    "config": { "enabled": true, "frequency": "daily", "runAt": "02:00", "retentionCount": 30 },
    "nextRunAt": "2026-06-13T02:00:00.000Z"
  }
}
```

Quyết định kiến trúc:

- Social links → Tách ra /admin/settings/social, unlimited entries với CRUD (icon, name, url, description, order) — cần thêm bảng DB
- Logo preview + upload, favicon upload, Google Maps → Giữ ở General Settings, thêm UI upload + preview tại chỗ
- Maintenance mode → Giữ ở General Settings (liên quan operational config, không liên quan backup/restore)
- SEO → Tách ra /admin/settings/seo — gom SEO fields + thêm OG image URL

# Mapping mới cho notification types:


```
'contact_submission'  → 📨 fas fa-envelope       // Liên hệ gửi
'backup_completed'    → ✅ fas fa-check-circle   // Backup xong
'account_locked'      → 🔒 fas fa-lock          // Tài khoản bị khóa
'settings_changed'    → ⚙️  fas fa-cog           // Cài đặt thay đổi
'news_published'      → 📰 fas fa-newspaper     // Tin tức phát hành
'school_updated'      → 🏫 fas fa-school        // Trường học cập nhật
'user_registered'     → 👤 fas fa-user-plus     // User đăng ký
'system_alert'        → ⚠️  fas fa-exclamation-triangle // Cảnh báo hệ thống

```

