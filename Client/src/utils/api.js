/**
 * API Utility Functions
 * Handles all HTTP requests to the backend with authentication support
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Base fetch wrapper with credentials included
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  const config = {
    credentials: 'include', // Include cookies for session auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Handle non-JSON responses (like redirects)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    }

    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Initiate Google OAuth login
 * Redirects user to backend OAuth endpoint
 */
export const loginWithGoogle = () => {
  window.location.href = `${API_URL}/auth/google`;
};

/**
 * Fetch current authenticated user
 * @returns {Promise<object>} User data with wallet info
 */
export const fetchUser = async () => {
  try {
    const data = await apiFetch('/auth/me');
    return data.user;
  } catch (error) {
    // User not authenticated
    return null;
  }
};

/**
 * Check authentication status
 * @returns {Promise<object>} Auth status
 */
export const checkAuthStatus = async () => {
  try {
    const data = await apiFetch('/auth/status');
    return data;
  } catch (error) {
    return { authenticated: false };
  }
};

/**
 * Logout user and destroy session
 * Redirects to backend logout endpoint
 */
export const logout = () => {
  // Clear localStorage
  localStorage.removeItem('user');

  // Redirect to backend logout (which will redirect back to frontend)
  window.location.href = `${API_URL}/auth/logout`;
};

/**
 * Fetch user credits
 * @returns {Promise<object>} Credits data
 */
export const fetchCredits = async () => {
  try {
    const data = await apiFetch('/api/credits');
    return data.data;
  } catch (error) {
    console.error('Error fetching credits:', error);
    return null;
  }
};

/**
 * Create video generation job
 * @param {object} videoData - Video generation parameters
 * @returns {Promise<object>} Video creation response
 */
export const createVideo = async (videoData) => {
  return await apiFetch('/api/videos', {
    method: 'POST',
    body: JSON.stringify(videoData),
  });
};

/**
 * Get all videos with pagination
 * @param {object} params - Query parameters
 * @returns {Promise<object>} Videos list
 */
export const fetchVideos = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = `/api/videos${queryString ? `?${queryString}` : ''}`;
  return await apiFetch(endpoint);
};

/**
 * Get video status by ID
 * @param {string} videoId - Video ID
 * @returns {Promise<object>} Video status
 */
export const fetchVideoStatus = async (videoId) => {
  return await apiFetch(`/api/videos/${videoId}`);
};

export default {
  loginWithGoogle,
  fetchUser,
  checkAuthStatus,
  logout,
  fetchCredits,
  createVideo,
  fetchVideos,
  fetchVideoStatus,
};
