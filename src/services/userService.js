import apiClient from './apiClient';

class UserService {
  // Get user profile with credits
  async getProfile() {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/user/profile', profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const response = await apiClient.get('/user/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get user activity log
  async getActivityLog(params = {}) {
    try {
      const response = await apiClient.get('/user/activity', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get user preferences
  async getPreferences() {
    try {
      const response = await apiClient.get('/user/preferences');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update user preferences
  async updatePreferences(preferences) {
    try {
      const response = await apiClient.put('/user/preferences', preferences);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await apiClient.put('/user/password', passwordData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get credit summary
  async getCreditSummary() {
    try {
      const response = await apiClient.get('/user/credits');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get credit transactions
  async getCreditTransactions(params = {}) {
    try {
      const response = await apiClient.get('/user/credits/transactions', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update user plan
  async updatePlan(plan) {
    try {
      const response = await apiClient.put('/user/plan', { plan });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Export user data
  async exportUserData() {
    try {
      const response = await apiClient.get('/user/export');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Deactivate account
  async deactivateAccount() {
    try {
      const response = await apiClient.post('/user/deactivate');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload profile picture (placeholder)
  async uploadProfilePicture(profilePictureUrl) {
    try {
      const response = await apiClient.post('/user/profile/picture', {
        profilePictureUrl
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Helper method to handle errors
  handleError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error(error.message || 'An unexpected error occurred');
  }
}

const userService = new UserService();
export default userService;
