import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing valid token on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('dashboard_token');
      const expiresAt = localStorage.getItem('token_expires_at');

      if (token && expiresAt) {
        const now = Date.now();
        const expiration = parseInt(expiresAt);

        if (now < expiration) {
          setIsAuthenticated(true);
        } else {
          // Token expired, clear it
          localStorage.removeItem('dashboard_token');
          localStorage.removeItem('token_expires_at');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (password) => {
    try {
      const response = await fetch('https://ghosttrack-analytics-production.up.railway.app/api/v1/auth/dashboard-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('Invalid password');
      }

      const data = await response.json();

      // Store token and expiration time
      localStorage.setItem('dashboard_token', data.token);
      localStorage.setItem('token_expires_at', Date.now() + (data.expires_in * 1000));

      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('dashboard_token');
    localStorage.removeItem('token_expires_at');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
