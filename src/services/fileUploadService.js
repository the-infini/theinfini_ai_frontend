class FileUploadService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5529/api';
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.supportedTypes = [
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      // Documents
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      // Text files
      'text/plain',
      'text/markdown',
      'application/json'
    ];
  }

  /**
   * Validate file before upload
   */
  validateFile(file) {
    const errors = [];

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check file type
    if (file.type.startsWith('video/')) {
      errors.push('Video files are not supported');
    } else if (!this.supportedTypes.includes(file.type)) {
      errors.push(`Unsupported file type: ${file.type}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get file type category
   */
  getFileCategory(file) {
    if (file.type.startsWith('image/')) {
      return 'image';
    } else if (file.type === 'application/pdf') {
      return 'pdf';
    } else if (file.type.includes('word') || file.type.includes('sheet')) {
      return 'document';
    } else if (file.type.startsWith('text/') || file.type === 'application/json') {
      return 'text';
    }
    return 'unknown';
  }

  /**
   * Create FormData for file upload
   */
  createFormData(message, file, options = {}) {
    const formData = new FormData();
    
    // Add message and other data
    formData.append('message', message);
    
    if (options.sessionId) {
      formData.append('sessionId', options.sessionId);
    }
    
    if (options.threadId) {
      formData.append('threadId', options.threadId);
    }
    
    if (options.llmModel) {
      formData.append('llmModel', options.llmModel);
    }

    formData.append('hasAttachment', 'true');
    
    // Add file
    if (file) {
      formData.append('attachment', file);
    }

    return formData;
  }

  /**
   * Create streaming request with file upload
   */
  async createStreamingRequestWithFile(endpoint, message, file, options = {}) {
    const token = localStorage.getItem('authToken');

    const headers = {
      ...options.headers
      // Don't set Content-Type for FormData - browser will set it with boundary
    };

    // Add authentication header for authenticated users
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const formData = this.createFormData(message, file, options);

    const requestOptions = {
      method: 'POST',
      headers,
      body: formData,
      ...options
    };

    console.log('Creating streaming request with file:', {
      endpoint,
      hasAuth: !!token,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      sessionId: options.sessionId,
      threadId: options.threadId,
      llmModel: options.llmModel
    });

    return fetch(`${this.baseURL}${endpoint}`, requestOptions);
  }

  /**
   * Stream chat message with file attachment
   */
  async streamChatMessageWithFile(message, file, options = {}) {
    const { sessionId, llmModel = 'gpt-3.5-turbo', ...streamOptions } = options;

    // Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const requestOptions = {
      sessionId,
      llmModel
    };

    const response = await this.createStreamingRequestWithFile(
      '/chat/message/stream/attachment',
      message,
      file,
      requestOptions
    );

    return response;
  }

  /**
   * Stream thread message with file attachment
   */
  async streamThreadMessageWithFile(message, file, options = {}) {
    const { threadId, llmModel = 'gpt-3.5-turbo', ...streamOptions } = options;

    // Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const requestOptions = {
      threadId,
      llmModel
    };

    const response = await this.createStreamingRequestWithFile(
      '/threads/message/stream/attachment',
      message,
      file,
      requestOptions
    );

    return response;
  }

  /**
   * Stream project message with file attachment
   */
  async streamProjectMessageWithFile(projectId, message, file, options = {}) {
    const { threadId, llmModel = 'gpt-3.5-turbo', ...streamOptions } = options;

    // Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const requestOptions = {
      threadId,
      llmModel
    };

    const response = await this.createStreamingRequestWithFile(
      `/projects/${projectId}/message/stream/attachment`,
      message,
      file,
      requestOptions
    );

    return response;
  }

  /**
   * Get file preview for display
   */
  getFilePreview(file) {
    return new Promise((resolve, reject) => {
      const category = this.getFileCategory(file);
      
      if (category === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            type: 'image',
            url: e.target.result,
            name: file.name,
            size: file.size
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else {
        resolve({
          type: category,
          name: file.name,
          size: file.size,
          icon: this.getFileIcon(category)
        });
      }
    });
  }

  /**
   * Get file icon based on category
   */
  getFileIcon(category) {
    switch (category) {
      case 'pdf':
        return '📄';
      case 'document':
        return '📝';
      case 'text':
        return '📋';
      case 'image':
        return '🖼️';
      default:
        return '📎';
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

const fileUploadService = new FileUploadService();
export default fileUploadService;
