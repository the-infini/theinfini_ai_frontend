import { useState, useCallback, useRef } from 'react';
import streamingService from '../services/streamingService';

export function useStreamingChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [streamingError, setStreamingError] = useState(null);
  const abortControllerRef = useRef(null);

  const resetStreaming = useCallback(() => {
    setStreamingResponse('');
    setStreamingError(null);
    setIsStreaming(false);
  }, []);

  const cancelStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    resetStreaming();
  }, [resetStreaming]);

  const streamChatMessage = useCallback(async (message, options = {}) => {
    if (isStreaming) {
      console.warn('Already streaming a message');
      return null;
    }

    resetStreaming();
    setIsStreaming(true);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const streamCallbacks = {
        onStart: (data) => {
          console.log('Stream started:', data);
        },
        onChunk: (content, fullResponse) => {
          setStreamingResponse(fullResponse);
        },
        onComplete: (fullResponse, data) => {
          console.log('Stream completed:', data);
          setStreamingResponse(fullResponse);
          return fullResponse;
        },
        onError: (error) => {
          const handledError = streamingService.handleStreamingError(error);
          setStreamingError(handledError.message);
          console.error('Streaming error:', handledError);
        }
      };

      const result = await streamingService.streamChatMessage(message, {
        ...options,
        ...streamCallbacks,
        signal: abortControllerRef.current.signal
      });

      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        const handledError = streamingService.handleStreamingError(error);
        setStreamingError(handledError.message);
        console.error('Streaming error:', handledError);
      }
      return null;
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [isStreaming, resetStreaming]);

  const streamThreadMessage = useCallback(async (message, options = {}) => {
    if (isStreaming) {
      console.warn('Already streaming a message');
      return null;
    }

    resetStreaming();
    setIsStreaming(true);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const streamCallbacks = {
        onStart: (data) => {
          console.log('Stream started:', data);
        },
        onChunk: (content, fullResponse) => {
          setStreamingResponse(fullResponse);
        },
        onComplete: (fullResponse, data) => {
          console.log('Stream completed:', data);
          setStreamingResponse(fullResponse);
          return fullResponse;
        },
        onError: (error) => {
          const handledError = streamingService.handleStreamingError(error);
          setStreamingError(handledError.message);
          console.error('Streaming error:', handledError);
        }
      };

      const result = await streamingService.streamThreadMessage(message, {
        ...options,
        ...streamCallbacks,
        signal: abortControllerRef.current.signal
      });

      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        const handledError = streamingService.handleStreamingError(error);
        setStreamingError(handledError.message);
        console.error('Streaming error:', handledError);
      }
      return null;
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [isStreaming, resetStreaming]);

  const streamProjectMessage = useCallback(async (projectId, message, options = {}) => {
    if (isStreaming) {
      console.warn('Already streaming a message');
      return null;
    }

    resetStreaming();
    setIsStreaming(true);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const streamCallbacks = {
        onStart: (data) => {
          console.log('Stream started:', data);
        },
        onChunk: (content, fullResponse) => {
          setStreamingResponse(fullResponse);
        },
        onComplete: (fullResponse, data) => {
          console.log('Stream completed:', data);
          setStreamingResponse(fullResponse);
          return fullResponse;
        },
        onError: (error) => {
          const handledError = streamingService.handleStreamingError(error);
          setStreamingError(handledError.message);
          console.error('Streaming error:', handledError);
        }
      };

      const result = await streamingService.streamProjectMessage(projectId, message, {
        ...options,
        ...streamCallbacks,
        signal: abortControllerRef.current.signal
      });

      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        const handledError = streamingService.handleStreamingError(error);
        setStreamingError(handledError.message);
        console.error('Streaming error:', handledError);
      }
      return null;
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [isStreaming, resetStreaming]);

  return {
    isStreaming,
    streamingResponse,
    streamingError,
    streamChatMessage,
    streamThreadMessage,
    streamProjectMessage,
    cancelStreaming,
    resetStreaming
  };
}
