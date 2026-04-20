import type { IUser } from "~/types/user";

export default defineNuxtRouteMiddleware(async (to) => {
    console.log('👥 Permission middleware called for:', to.path);
    
    // 👇 CHẶN LOGIN PAGE
    if (to.path === "/login") {
        console.log('✅ Skipping permission for login page');
        return;
    }

    // Skip permission check for non-admin routes
    if (!to.path.startsWith('/admin')) {
        console.log('✅ Skipping permission for non-admin route');
        return;
    }

    // Chỉ chạy trên client side và sau khi hydration
    if (import.meta.server) {
        console.log('🚫 Skipping permission middleware on server');
        return;
    }
    if (!process.client) {
        console.log('🚫 Not on client side for permission');
        return;
    }

    console.log('🔄 Running permission middleware on client');

    // Đợi cho Vue hydration hoàn thành
    return new Promise((resolve) => {
        nextTick(async () => {
            try {
                // Fetch user data từ API (auth middleware đã check authentication rồi)
                const config = useRuntimeConfig();
                const API_BASE = config.public.apiBase;
                
                const response = await fetch(`${API_BASE}/auth/me`, {
                    method: 'GET',
                    credentials: 'include', // Include httpOnly cookies
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    console.log('❌ Failed to get user data in permission middleware');
                    // Don't redirect here as auth middleware should handle this
                    resolve();
                    return;
                }

                const data = await response.json();
                const user: IUser = data.user;
                
                if (!user || !user.role_id) {
                    console.log('❌ No valid user data in permission middleware');
                    resolve();
                    return;
                }

                console.log('👤 User data from API:', user);

                // Superadmin có tất cả quyền
                if (user.role_id === 1) {
                    console.log('✅ Superadmin access granted');
                    resolve();
                    return;
                }

                // Kiểm tra quyền cho từng trang admin
                if (to.path.startsWith("/admin/users") && ![1, 2, 3].includes(user.role_id)) {
                    console.log('🚫 User role not allowed for /admin/users, redirecting');
                    resolve(navigateTo("/admin"));
                    return;
                }

                if (to.path.startsWith("/admin/contacts") && ![1, 2, 3, 5].includes(user.role_id)) {
                    console.log('🚫 User role not allowed for /admin/contacts, redirecting');
                    resolve(navigateTo("/admin"));
                    return;
                }

                if (to.path.startsWith("/admin/schools") && ![1, 2, 3].includes(user.role_id)) {
                    console.log('🚫 User role not allowed for /admin/schools, redirecting');
                    resolve(navigateTo("/admin"));
                    return;
                }

                if (to.path.startsWith("/admin/news") && ![1, 2, 3, 4].includes(user.role_id)) {
                    console.log('🚫 User role not allowed for /admin/news, redirecting');
                    resolve(navigateTo("/admin"));
                    return;
                }

                if (to.path.startsWith("/admin/content") && ![1, 2, 3].includes(user.role_id)) {
                    console.log('🚫 User role not allowed for /admin/content, redirecting');
                    resolve(navigateTo("/admin"));
                    return;
                }

                if (to.path.startsWith("/admin/settings") && ![1, 2].includes(user.role_id)) {
                    console.log('🚫 User role not allowed for /admin/settings, redirecting');
                    resolve(navigateTo("/admin"));
                    return;
                }

                console.log('✅ Permission check passed');
                resolve();
            } catch (error) {
                console.error('❌ Permission middleware error:', error);
                // Don't redirect on error, let auth middleware handle it
                resolve();
            }
        });
    });
});