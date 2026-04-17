export default defineNuxtRouteMiddleware((to) => {
    console.log('🔍 Auth middleware called for:', to.path);
    
    // Chỉ chạy trên client side và sau khi hydration
    if (import.meta.server) {
        console.log('🚫 Skipping auth middleware on server');
        return;
    }
    if (!process.client) {
        console.log('🚫 Not on client side');
        return;
    }

    console.log('🔄 Running auth middleware on client');

    // Đợi cho Vue hydration hoàn thành
    return new Promise((resolve) => {
        nextTick(() => {
            try {
                const token = localStorage.getItem("token");
                console.log('🔑 Token check:', token ? '✅ Token found' : '❌ No token');
                
                // 👇 XỬ LÝ LOGIN PAGE
                if (to.path === "/login") {
                    if (token) {
                        console.log('🔄 User already logged in, redirecting to admin');
                        resolve(navigateTo("/admin"));
                        return;
                    } else {
                        console.log('✅ No token, allowing access to login page');
                        resolve();
                        return;
                    }
                }
                
                // 👇 XỬ LÝ ADMIN PAGES
                if (!token) {
                    console.log('🚫 No token, redirecting to login');
                    resolve(navigateTo("/login"));
                    return;
                }
                
                console.log('✅ Token exists, allowing access to:', to.path);
                resolve();
            } catch (error) {
                console.error('❌ Auth middleware error:', error);
                resolve(navigateTo("/login"));
            }
        });
    });
});