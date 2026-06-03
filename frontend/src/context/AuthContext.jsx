import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('aura_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('aura_user');
    const savedToken = localStorage.getItem('aura_token');
    
    if (savedUser && savedToken) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to login');
    }

    localStorage.setItem('aura_token', data.token);
    localStorage.setItem('aura_user', JSON.stringify(data.user));
    setCurrentUser(data.user);
    setToken(data.token);
    return data.user;
  };

  const register = async (name, email, password, role) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to register');
    }

    localStorage.setItem('aura_token', data.token);
    localStorage.setItem('aura_user', JSON.stringify(data.user));
    setCurrentUser(data.user);
    setToken(data.token);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    setCurrentUser(null);
    setToken(null);
  };

  const getAuthHeader = () => {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  const value = {
    currentUser,
    token,
    loading,
    login,
    register,
    logout,
    getAuthHeader,
    isAuthenticated: !!currentUser,
    isOrganizer: currentUser?.role === 'organizer',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
