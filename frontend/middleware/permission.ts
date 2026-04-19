import { jwtDecode } from "jwt-decode";
import type { IUser } from "~/types/user";

export default defineNuxtRouteMiddleware((to) => {
    console.log('👥 Permission middleware called for:', to.path);
    
    // 👇 CHẶN LOGIN PAGE
    if (to.path === "/login") {
        console.log('✅ Skipping permission for login page');
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
        nextTick(() => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    console.log('❌ No token in permission middleware, redirecting to login');
                    resolve(navigateTo("/login"));
                    return;
                }

                let user: IUser;

                try {
                    user = jwtDecode(token) as IUser;
                    console.log('👤 Decoded user:', user);
                } catch (error) {
                    console.error('❌ JWT decode error:', error);
                    localStorage.removeItem("token");
                    resolve(navigateTo("/login"));
                    return;
                }

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
                resolve(navigateTo("/login"));
            }
        });
    });
});