import apiClient from './apiClient';

class SubscriptionService {
  // Get available subscription plans
  async getPlans() {
    try {
      const response = await apiClient.get('/subscription/plans');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get current subscription details
  async getCurrentSubscription() {
    try {
      const response = await apiClient.get('/subscription/current');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create subscription order
  async createSubscriptionOrder(planType) {
    try {
      const response = await apiClient.post('/subscription/create', { planType });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upgrade subscription
  async upgradeSubscription(planType) {
    try {
      const response = await apiClient.post('/subscription/upgrade', { planType });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Downgrade subscription
  async downgradeSubscription(planType) {
    try {
      const response = await apiClient.post('/subscription/downgrade', { planType });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cancel subscription
  async cancelSubscription(reason = '') {
    try {
      const response = await apiClient.post('/subscription/cancel', { reason });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create add-on order
  async createAddonOrder() {
    try {
      const response = await apiClient.post('/subscription/addon');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get subscription stats
  async getSubscriptionStats() {
    try {
      const response = await apiClient.get('/subscription/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Verify payment
  async verifyPayment(paymentData) {
    try {
      const response = await apiClient.post('/payment/verify', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get payment history
  async getPaymentHistory(limit = 10, offset = 0) {
    try {
      const response = await apiClient.get(`/payment/history?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get payment stats
  async getPaymentStats() {
    try {
      const response = await apiClient.get('/payment/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get transaction details
  async getTransactionDetails(transactionId) {
    try {
      const response = await apiClient.get(`/payment/transaction/${transactionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Download invoice
  async downloadInvoice(invoiceUrl) {
    try {
      // Remove leading /api/ from invoiceUrl since baseURL already includes it
      const cleanInvoiceUrl = invoiceUrl.startsWith('/api/') ? invoiceUrl.substring(5) : invoiceUrl;

      // Create full URL by combining base URL with clean invoice path
      const fullUrl = `${apiClient.defaults.baseURL}/${cleanInvoiceUrl}`;

      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = ''; // Let the server determine the filename
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Helper method to handle errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // Format currency for display
  formatCurrency(amount, currency = 'INR') {
    // Handle null, undefined, or non-numeric values
    if (amount === null || amount === undefined || isNaN(amount)) {
      return currency === 'INR' ? '₹0' : '0';
    }

    const numericAmount = Number(amount);
    if (currency === 'INR') {
      return `₹${numericAmount.toLocaleString('en-IN')}`;
    }
    return `${numericAmount}`;
  }

  // Format plan type for display
  formatPlanType(planType) {
    const planNames = {
      'EXPLORER': 'Explorer',
      'CREATOR': 'Creator',
      'PRO': 'Pro',
      'ADDON': 'Add-on Pack'
    };
    return planNames[planType] || planType;
  }

  // Get plan color for UI
  getPlanColor(planType) {
    const planColors = {
      'EXPLORER': '#10b981', // Green
      'CREATOR': '#fcd469', // Yellow
      'PRO': '#8b5cf6', // Purple
      'ADDON': '#f59e0b' // Orange
    };
    return planColors[planType] || '#6b7280';
  }

  // Check if plan is active
  isPlanActive(status) {
    return status === 'ACTIVE';
  }

  // Get status color for UI
  getStatusColor(status) {
    const statusColors = {
      'ACTIVE': '#10b981',
      'SUSPENDED': '#f59e0b',
      'CANCELLED': '#ef4444',
      'EXPIRED': '#6b7280'
    };
    return statusColors[status] || '#6b7280';
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;
