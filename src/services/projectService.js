import apiClient from './apiClient';
import streamingService from './streamingService';

class ProjectService {
  // Create new project
  async createProject(data) {
    try {
      const response = await apiClient.post('/projects', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get user's projects
  async getProjects(limit = 6, offset = 0) {
    try {
      const response = await apiClient.get(`/projects?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search projects
  async searchProjects(query, limit = 6, offset = 0) {
    try {
      const response = await apiClient.get(`/projects/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get project details
  async getProjectDetails(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update project
  async updateProject(projectId, data) {
    try {
      const response = await apiClient.put(`/projects/${projectId}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete project
  async deleteProject(projectId) {
    try {
      const response = await apiClient.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get project threads
  async getProjectThreads(projectId, limit = 6, offset = 0) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/threads?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send message in project thread
  async sendProjectMessage(projectId, data) {
    try {
      const response = await apiClient.post(`/projects/${projectId}/message`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Stream message in project thread
  async streamProjectMessage(projectId, message, options = {}) {
    try {
      return await streamingService.streamProjectMessage(projectId, message, options);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get project statistics
  async getProjectStats(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/stats`);
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

const projectService = new ProjectService();
export default projectService;
