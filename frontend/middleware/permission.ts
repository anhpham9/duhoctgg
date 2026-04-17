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

    // TẠMTẮT check permission để test
    console.log('🧪 TEMPORARILY SKIPPING PERMISSION CHECK');
    return;

    // // Đợi cho Vue hydration hoàn thành
    // return new Promise((resolve) => {
    //     nextTick(() => {
    //         try {
    //             const token = localStorage.getItem("token");

    //             if (!token) {
    //                 console.log('❌ No token in permission middleware, redirecting to login');
    //                 resolve(navigateTo("/login"));
    //                 return;
    //             }

    //             let user: IUser;

    //             try {
    //                 user = jwtDecode(token) as IUser;
    //                 console.log('👤 Decoded user:', user);
    //             } catch (error) {
    //                 console.error('❌ JWT decode error:', error);
    //                 localStorage.removeItem("token");
    //                 resolve(navigateTo("/login"));
    //                 return;
    //             }

    //             if (to.path.startsWith("/admin/users") && user.role_id !== 1) {
    //                 console.log('🚫 User role not allowed for /admin/users, redirecting');
    //                 resolve(navigateTo("/admin"));
    //                 return;
    //             }
    //             console.log('✅ Permission check passed');
    //             resolve();
    //         } catch (error) {
    //             console.error('❌ Permission middleware error:', error);
    //             resolve(navigateTo("/login"));
    //         }
    //     });
    // });
});