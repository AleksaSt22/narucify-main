import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('dm-order-token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Auth error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token: newToken, user: userData } = response.data;
    
    localStorage.setItem('dm-order-token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    
    return response.data;
  };

  const register = async (email, password, businessName) => {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      business_name: businessName
    });
    // Registration now requires email verification - don't auto-login
    return response.data;
  };

  const loginWithToken = (newToken, userData) => {
    localStorage.setItem('dm-order-token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('dm-order-token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUser();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithToken, register, logout, refreshUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
