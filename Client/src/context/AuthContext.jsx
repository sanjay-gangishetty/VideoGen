/**
 * Authentication Context
 * Provides authentication state and functions throughout the app
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { fetchUser, loginWithGoogle, logout as apiLogout } from '../utils/api';

const AuthContext = createContext(null);

/**
 * Custom hook to use auth context
 * @returns {object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Auth Provider Component
 * Wraps app and provides authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Load user from localStorage or fetch from API
   */
  const loadUser = async () => {
    try {
      setLoading(true);

      // Try to load from localStorage first
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        const parsedUser = JSON.parse(cachedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }

      // Fetch fresh user data from API
      const userData = await fetchUser();

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        // Cache in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Not authenticated
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login with Google OAuth
   */
  const login = () => {
    loginWithGoogle();
  };

  /**
   * Logout user
   */
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    apiLogout();
  };

  /**
   * Refetch user data (useful after operations that might change user state)
   */
  const refetchUser = async () => {
    try {
      const userData = await fetchUser();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error refetching user:', error);
    }
  };

  /**
   * Update user credits locally (optimistic update)
   * @param {number} newBalance - New credit balance
   */
  const updateCredits = (newBalance) => {
    if (user && user.wallet) {
      const updatedUser = {
        ...user,
        wallet: {
          ...user.wallet,
          currentBalance: newBalance,
        },
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refetchUser,
    updateCredits,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
