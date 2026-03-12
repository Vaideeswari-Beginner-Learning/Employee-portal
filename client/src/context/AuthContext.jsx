import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
// import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token) {
                try {
                    console.log('[AuthDebug] Verifying session token...', token.substring(0, 10) + '...');
                    // Verify the token with the backend - explicitly passing headers just in case interceptor isn't ready
                    const res = await api.get('/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log('[AuthDebug] Session verified for:', res.data.email);
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                } catch (err) {
                    console.error('[AuthDebug] Session verification failed. Redirecting to login.', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            } else if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            console.log('Attempting login to /auth/login');
            const res = await api.post('/auth/login', { email, password });
            console.log('Login response:', res.data);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            return res.data.user;
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Authentication failed';
            setError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setError(null);
    };


    return (
        <AuthContext.Provider value={{ user, login, logout, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth };
