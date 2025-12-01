import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../utils/api';
import socketService from '../utils/socket';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Connect socket with token
        socketService.connect(parsedUser.token);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      console.log('AuthContext: Calling register API with:', userData);
      const response = await authAPI.register(userData);
      console.log('AuthContext: Register response:', response.data);
      const userDataResponse = response.data;

      localStorage.setItem('user', JSON.stringify(userDataResponse));
      setUser(userDataResponse);

      // Connect socket
      socketService.connect(userDataResponse.token);

      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Register error:', error);
      console.error('AuthContext: Error response:', error.response?.data);
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const userData = response.data;

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Connect socket
      socketService.connect(userData.token);

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);

    // Disconnect socket
    socketService.disconnect();

    toast.info('Logged out successfully');
  };

  const updateUser = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.data;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
