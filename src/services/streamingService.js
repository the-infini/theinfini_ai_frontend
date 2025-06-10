import sessionManager from '../utils/sessionManager';

class StreamingService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5529/api';
  }

  /**
   * Create simplified streaming request according to SIMPLE_STREAMING_API.md
   * No CSRF tokens, simplified session handling
   */
  async createStreamingRequest(endpoint, data, options = {}) {
    const token = localStorage.getItem('authToken');

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add authentication header for authenticated users
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Include session ID in request body for conversation continuity
    const requestData = { ...data };

    // Only add sessionId for guest chat endpoints, not for thread/project endpoints
    const isGuestChatEndpoint = endpoint === '/chat/message/stream';

    if (isGuestChatEndpoint) {
      // Get session ID from session manager or use provided sessionId
      const sessionId = data.sessionId || sessionManager.getCurrentSessionId();
      if (sessionId) {
        requestData.sessionId = sessionId;
      }
    }

    const requestOptions = {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData),
      ...options
    };

    console.log('Creating simplified streaming request:', {
      endpoint,
      hasAuth: !!token,
      sessionId: isGuestChatEndpoint ? requestData.sessionId : 'N/A (thread/project)',
      llmModel: requestData.llmModel
    });

    return fetch(`${this.baseURL}${endpoint}`, requestOptions);
  }

  /**
   * Parse Server-Sent Events stream
   */
  async parseSSEStream(response, callbacks = {}) {
    const {
      onStart = () => {},
      onChunk = () => {},
      onComplete = () => {},
      onError = () => {},
      onProgress = () => {},
      onMetadata = () => {}
    } = callbacks;

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'start':
                  onStart(data);
                  if (data.metadata) {
                    onMetadata(data.metadata);
                  }
                  break;

                case 'chunk':
                  fullResponse += data.content;
                  onChunk(data.content, fullResponse);
                  onProgress(fullResponse);
                  break;

                case 'complete':
                  onComplete(data.fullResponse || fullResponse, data);
                  return {
                    response: data.fullResponse || fullResponse,
                    metadata: data.metadata || {}
                  };

                case 'error':
                  onError(new Error(data.error));
                  throw new Error(data.error);

                default:
                  console.warn('Unknown SSE event type:', data.type);
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError, 'Line:', line);
            }
          }
        }
      }
    } catch (error) {
      onError(error);
      throw error;
    } finally {
      reader.releaseLock();
    }

    return {
      response: fullResponse,
      metadata: {}
    };
  }

  /**
   * Stream chat message (regular or guest)
   * Uses sessionId for conversation continuity
   */
  async streamChatMessage(message, options = {}) {
    const { sessionId, llmModel = 'gpt-3.5-turbo', ...streamOptions } = options;

    const data = {
      message,
      llmModel
    };

    // Include sessionId if provided for conversation continuity
    if (sessionId) {
      data.sessionId = sessionId;
      console.log('Using provided session ID for chat message:', sessionId);
    }

    const response = await this.createStreamingRequest('/chat/message/stream', data);
    return this.parseSSEStream(response, streamOptions);
  }

  /**
   * Stream thread message
   * Uses threadId for conversation continuity (no sessionId needed)
   */
  async streamThreadMessage(message, options = {}) {
    const { threadId, llmModel = 'gpt-3.5-turbo', ...streamOptions } = options;

    const data = {
      message,
      llmModel
    };

    // Include threadId for conversation continuity (sessionId is not used for thread messages)
    if (threadId) {
      data.threadId = threadId;
    }

    const response = await this.createStreamingRequest('/threads/message/stream', data);
    return this.parseSSEStream(response, streamOptions);
  }

  /**
   * Stream project message
   * Uses threadId for conversation continuity within the project (no sessionId needed)
   */
  async streamProjectMessage(projectId, message, options = {}) {
    const { threadId, llmModel = 'gpt-3.5-turbo', ...streamOptions } = options;

    const data = {
      message,
      llmModel
    };

    // Include threadId for conversation continuity within the project (sessionId is not used for project messages)
    if (threadId) {
      data.threadId = threadId;
    }

    const response = await this.createStreamingRequest(`/projects/${projectId}/message/stream`, data);
    return this.parseSSEStream(response, streamOptions);
  }

  /**
   * Handle streaming errors
   */
  handleStreamingError(error) {
    if (error.name === 'AbortError') {
      return new Error('Request was cancelled');
    }

    if (error.message.includes('Failed to fetch')) {
      return new Error('Network error: Please check your connection');
    }

    if (error.message.includes('HTTP 401')) {
      return new Error('Authentication required');
    }

    if (error.message.includes('HTTP 403')) {
      return new Error('Access denied');
    }

    if (error.message.includes('HTTP 429')) {
      return new Error('Rate limit exceeded. Please wait before sending another message.');
    }

    return error;
  }
}

const streamingService = new StreamingService();
export default streamingService;
