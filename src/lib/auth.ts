// Frontend authentication utilities

/**
 * Check if user is authenticated by checking for access token
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
    });

    return response.ok;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
};

/**
 * Get authentication status
 */
export const isAuthenticated = async (): Promise<boolean> => {
  // In browser environment, check for the presence of the access token cookie
  if (typeof window !== 'undefined') {
    // For client-side, we can't directly access httpOnly cookies
    // Instead, we'll make an API call to verify authentication
    return await checkAuthStatus();
  }
  return false;
};



/**
 * Get user role from the backend
 */
export const getUserRole = async (): Promise<'ADMIN' | 'AGENT' | null> => {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
    });

    if (response.ok) {
      const userData = await response.json();
      return userData.role;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

/**
 * Logout function
 */
export const logout = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // Include cookies in the request
    });
    
    // Redirect to login page after logout
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
    // Still redirect to login even if API call fails
    window.location.href = '/login';
  }
};

/**
 * Refresh access token using the refresh token
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      credentials: 'include', // Include cookies in the request
    });

    return response.ok;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return false;
  }
};