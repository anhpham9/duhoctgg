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
export default defineNuxtRouteMiddleware(() => {
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

  const token = localStorage.getItem("token");

  if (!token) return navigateTo("/login");

  const user = jwtDecode(token) as IUser;

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