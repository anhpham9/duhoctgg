// Authentication composable for cookie-based auth
export const useAuth = () => {
    const config = useRuntimeConfig();
    
    const login = async (credentials) => {
        try {
            const response = await fetch(`${config.public.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Include cookies
                body: JSON.stringify(credentials)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error' };
        }
    };

    const logout = async () => {
        try {
            const response = await fetch(`${config.public.apiBase}/auth/logout`, {
                method: 'POST',
                credentials: 'include' // Include cookies
            });
            
            // Clear any remaining localStorage data
            localStorage.removeItem('token');
            localStorage.removeItem('rememberedUsername');
            localStorage.removeItem('rememberLogin');
            
            if (response.ok) {
                // Redirect to login
                await navigateTo('/login');
                return { success: true };
            } else {
                return { success: false, message: 'Logout failed' };
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Even if API call fails, still redirect to login
            await navigateTo('/login');
            return { success: false, message: 'Network error' };
        }
    };

    const getUser = async () => {
        try {
            const response = await fetch(`${config.public.apiBase}/auth/me`, {
                method: 'GET',
                credentials: 'include', // Include httpOnly cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.user;
            }
            return null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    };

    const isAuthenticated = async () => {
        try {
            const response = await fetch(`${config.public.apiBase}/auth/me`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    };

    return {
        login,
        logout,
        getUser,
        isAuthenticated
    };
};