// Auth utilities for cookie-based authentication

export const getUser = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
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

export const login = async (credentials) => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            credentials: 'include', // Include cookies
            headers: {
                'Content-Type': 'application/json'
            },
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

export const logout = async () => {
    try {
        await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            credentials: 'include' // Include cookies
        });
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        return false;
    }
};