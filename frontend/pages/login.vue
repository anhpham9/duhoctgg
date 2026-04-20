<template>
    <div class="login-wrapper">
        <div class="login-card">
            <div class="login-header">
                <div class="logo-container">
                    <img src="/assets/images/admin/logo01.png" alt="Du Học NB" class="login-logo">
                </div>
                <h1>Đăng Nhập Quản Trị</h1>
            </div>

            <form class="login-form" id="loginForm">
                <div class="form-group">
                    <label for="username" hidden>Tên đăng nhập</label>
                    <div class="input-wrapper">
                        <i class="fas fa-user input-icon"></i>
                        <input v-model="username" type="text" id="username" name="username" placeholder="Nhập tên đăng nhập" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="password" hidden>Mật khẩu</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock input-icon"></i>
                        <input v-model="password" :type="showPassword ? 'text' : 'password'" id="password" name="password" placeholder="Nhập mật khẩu" required autocomplete="off">
                        <button type="button" class="toggle-password" @click="togglePassword">
                            <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                        </button>
                    </div>
                </div>

                <div class="form-options">
                    <div class="remember-me">
                        <input v-model="rememberMe" type="checkbox" id="remember" name="remember">
                        <label for="remember">Ghi nhớ đăng nhập</label>
                    </div>
                    <a href="#" class="forgot-password">Quên mật khẩu?</a>
                </div>

                <button @click="handleLogin" type="submit" class="login-btn">
                    <i class="fas fa-sign-in-alt"></i>
                    Đăng Nhập
                </button>
            </form>

            <div class="login-footer">
                <p>&copy; 2024 Du Học NB. Bảo mật và an toàn.</p>
                <div class="security-info">
                    <i class="fas fa-shield-alt"></i>
                    <span>Hệ thống được bảo mật SSL</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

definePageMeta({
    layout: "empty",
    middleware: ["auth"]  // Thêm auth middleware cho login page
});

const config = useRuntimeConfig();
const { showSuccess, showError } = useToast();

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const rememberMe = ref(false);

const togglePassword = () => {
    showPassword.value = !showPassword.value;
};

// Load saved username on component mount
onMounted(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const wasRemembered = localStorage.getItem('rememberLogin') === 'true';
    
    if (savedUsername && wasRemembered) {
        username.value = savedUsername;
        rememberMe.value = true;
    }
});

const handleLogin = async (event) => {
    event?.preventDefault();
    try {
        console.log("🔑 Starting login...", {
            apiBase: config.public.apiBase,
            username: username.value,
            hasPassword: !!password.value
        });

        // Use fetch with credentials for cookie-based auth
        const response = await fetch(`${config.public.apiBase}/auth/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Important: include cookies
            body: JSON.stringify({
                username: username.value,
                password: password.value
            })
        });

        const res = await response.json();

        if (!response.ok) {
            throw new Error(res.message || 'Login failed');
        }

        console.log("✅ Login API success, user:", res.user);
        
        // Handle remember me functionality (only username, no token)
        if (rememberMe.value) {
            localStorage.setItem('rememberedUsername', username.value);
            localStorage.setItem('rememberLogin', 'true');
        } else {
            localStorage.removeItem('rememberedUsername');
            localStorage.removeItem('rememberLogin');
        }

        // Clean up any old tokens from localStorage
        localStorage.removeItem('token');

        console.log("🚀 Attempting to navigate to /admin...");

        // Navigate first, then show success message
        try {
            await navigateTo("/admin");
            console.log("✅ navigateTo completed");
            // Show toast after successful navigation
            setTimeout(() => showSuccess("Đăng nhập thành công!"), 100);
        } catch (navError) {
            console.error("❌ navigateTo failed:", navError);
            // Fallback to window.location
            console.log("🔄 Trying window.location fallback...");
            window.location.href = "/admin";
        }
    } catch (err) {
        console.error("❌ Login error details:", err);
        showError(`Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin và thử lại.`);
    }
};
</script>