// context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api'; // your API service (see step 4)

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend (optional, but good practice)
      api.get('/auth/profile')
        .then(response => {
          setUser(response.data?.data?.user || null);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('adminName');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data?.data || {};
      if (!token || !user) {
        return { success: false, message: 'Invalid login response from server' };
      }
      localStorage.setItem('token', token);
      localStorage.setItem('adminName', user.username || user.email || 'Admin');
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminName');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};