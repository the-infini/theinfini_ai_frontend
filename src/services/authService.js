import apiClient from './apiClient';
import sessionManager from '../utils/sessionManager';

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Verify registration OTP
  async verifyRegistration(verificationData) {
    try {
      const response = await apiClient.post('/auth/verify-registration', verificationData);
      if (response.data.success && response.data.data.token) {
        this.setAuthData(response.data.data);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Login with password
  async login(loginData) {
    try {
      const response = await apiClient.post('/auth/login', loginData);
      if (response.data.success && response.data.data.token) {
        this.setAuthData(response.data.data);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Request OTP for login
  async requestOTP(identifier) {
    try {
      const response = await apiClient.post('/auth/request-otp', { identifier });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Verify OTP for login
  async verifyOTP(otpData) {
    try {
      const response = await apiClient.post('/auth/verify-otp', otpData);
      if (response.data.success && response.data.data.token) {
        this.setAuthData(response.data.data);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Resend OTP
  async resendOTP(identifier) {
    try {
      const response = await apiClient.post('/auth/resend-otp', { identifier });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Logout user
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Verify token
  async verifyToken(token) {
    try {
      const response = await apiClient.post('/auth/verify-token', { token });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Check if user exists
  async checkUserExists(identifier) {
    try {
      const response = await apiClient.get('/auth/check-user', {
        params: { identifier }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await apiClient.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh-token');
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Helper methods
  setAuthData(authData) {
    if (authData.token) {
      localStorage.setItem('authToken', authData.token);
    }
    if (authData.user) {
      localStorage.setItem('user', JSON.stringify(authData.user));
    }
  }

  clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('csrfToken');
    // Clear session data when clearing auth data
    sessionManager.clearSessionId();
  }

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getStoredToken() {
    return localStorage.getItem('authToken');
  }

  isAuthenticated() {
    return !!this.getStoredToken();
  }

  handleError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error(error.message || 'An unexpected error occurred');
  }
}

const authService = new AuthService();
export default authService;
