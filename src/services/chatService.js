import apiClient from './apiClient';
import streamingService from './streamingService';

class ChatService {
  // Send message in thread (regular or project)
  async sendMessage(data) {
    try {
      const response = await apiClient.post('/threads/message', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Stream message in thread (regular or project)
  async streamMessage(message, options = {}) {
    try {
      return await streamingService.streamThreadMessage(message, options);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get user's regular threads
  async getThreads(limit = 6, offset = 0) {
    try {
      const response = await apiClient.get(`/threads?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get thread details
  async getThreadDetails(threadId) {
    try {
      const response = await apiClient.get(`/threads/${threadId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get thread messages
  async getThreadMessages(threadId, limit = 50, offset = 0) {
    try {
      const response = await apiClient.get(`/threads/${threadId}/messages?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update thread name
  async updateThreadName(threadId, name) {
    try {
      const response = await apiClient.put(`/threads/${threadId}/name`, { name });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete thread
  async deleteThread(threadId) {
    try {
      const response = await apiClient.delete(`/threads/${threadId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Legacy chat message (supports guest users)
  async sendLegacyMessage(data) {
    try {
      const response = await apiClient.post('/chat/message', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Stream legacy chat message (supports guest users)
  async streamLegacyMessage(message, options = {}) {
    try {
      return await streamingService.streamChatMessage(message, options);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get legacy chats
  async getLegacyChats() {
    try {
      const response = await apiClient.get('/chat/chats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get legacy chat messages
  async getLegacyChatMessages(chatId) {
    try {
      const response = await apiClient.get(`/chat/chats/${chatId}/messages`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Regenerate message
  async regenerateMessage(messageId, options = {}) {
    try {
      return await streamingService.streamRegenerateMessage(messageId, options);
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

const chatService = new ChatService();
export default chatService;
