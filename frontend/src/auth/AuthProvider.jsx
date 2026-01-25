import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await api.post('/auth/login', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    
    // Refresh user
    const meResponse = await api.get('/auth/me');
    setUser(meResponse.data);
    return meResponse.data; // Return user data for component logic
  };

  const register = async (userData) => {
    // userData: { name, email, password, role, otp }
    const response = await api.post('/auth/register', userData);
    return response.data;
  };

  const sendOtp = async (email, reason = "login") => {
    const response = await api.post('/auth/send-otp', { email, reason });
    return response.data;
  };

  const resetPassword = async (data) => {
    // data: { email, otp, new_password }
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refetchUser = async () => {
    try {
        const response = await api.get('/auth/me');
        setUser(response.data);
    } catch (error) {
        console.error("Failed to refetch user", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, sendOtp, resetPassword, loading, refetchUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
