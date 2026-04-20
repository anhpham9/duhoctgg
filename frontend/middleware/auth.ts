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
        nextTick(async () => {
            try {
                const config = useRuntimeConfig();
                
                // Check authentication status via API call with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
                
                const response = await fetch(`${config.public.apiBase}/auth/me`, {
                    method: 'GET',
                    credentials: 'include', // Include httpOnly cookies
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                const isAuthenticated = response.ok;
                console.log('🔑 Auth status:', isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated');
                
                // 👇 XỬ LÝ LOGIN PAGE
                if (to.path === "/login") {
                    if (isAuthenticated) {
                        console.log('🔄 User already logged in, redirecting to admin');
                        resolve(navigateTo("/admin"));
                        return;
                    } else {
                        console.log('✅ Not authenticated, allowing access to login page');
                        resolve();
                        return;
                    }
                }
                
                // 👇 XỬ LÝ ADMIN PAGES
                if (!isAuthenticated) {
                    console.log('🚫 Not authenticated, redirecting to login');
                    resolve(navigateTo("/login"));
                    return;
                }
                
                console.log('✅ Authenticated, allowing access to:', to.path);
                resolve();
            } catch (error) {
                console.error('❌ Auth middleware error:', error);
                
                // Handle different types of errors
                if (error.name === 'AbortError') {
                    console.log('⏰ Auth check timed out');
                } else if (error.message.includes('Failed to fetch') || error.message.includes('CONNECTION_REFUSED')) {
                    console.log('🌐 Backend server not available');
                } else {
                    console.log('🔧 Other auth error:', error.message);
                }
                
                // 👇 XỬ LÝ KHI BACKEND KHÔNG AVAILABLE
                if (to.path === "/login") {
                    // Cho phép access login page ngay cả khi backend down
                    console.log('✅ Allowing login page access despite backend issues');
                    resolve();
                    return;
                } else {
                    // Redirect về login cho admin pages
                    console.log('🚫 Backend unavailable, redirecting to login');
                    resolve(navigateTo("/login"));
                    return;
                }
            }
        });
    });
});