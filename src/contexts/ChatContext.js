import React, { createContext, useContext, useReducer, useEffect } from 'react';
import chatService from '../services/chatService';
import projectService from '../services/projectService';
import modelService from '../services/modelService';
import sessionManager from '../utils/sessionManager';
import streamingService from '../services/streamingService';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  // Current active thread/project
  currentThread: null,
  currentProject: null,

  // Data
  threads: [],
  projects: [],
  messages: [],
  availableModels: [],

  // Project-specific data
  projectThreads: {}, // { projectId: [threads] }
  expandedProjects: new Set(), // Set of expanded project IDs

  // UI state
  isLoading: false,
  isSending: false,
  error: null,

  // Streaming state
  isStreaming: false,
  streamingResponse: '',
  streamingError: null,
  currentStreamingMessage: null,

  // Regeneration state
  regeneratingMessages: new Set(), // Set of message IDs being regenerated
  regenerationError: null,

  // Session management
  currentSessionId: sessionManager.getCurrentSessionId(), // For guest chat continuity

  // Model selection
  selectedModel: 'gpt-3.5-turbo', // Default model

  // Pagination
  threadsOffset: 0,
  projectsOffset: 0,
  messagesOffset: 0,
  hasMoreThreads: true,
  hasMoreProjects: true,
  hasMoreMessages: true,

  // Search
  searchQuery: '',
  searchResults: [],
};

// Action types
const CHAT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_SENDING: 'SET_SENDING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',

  // Streaming
  SET_STREAMING: 'SET_STREAMING',
  SET_STREAMING_RESPONSE: 'SET_STREAMING_RESPONSE',
  SET_STREAMING_ERROR: 'SET_STREAMING_ERROR',
  CLEAR_STREAMING_ERROR: 'CLEAR_STREAMING_ERROR',
  SET_CURRENT_STREAMING_MESSAGE: 'SET_CURRENT_STREAMING_MESSAGE',
  RESET_STREAMING: 'RESET_STREAMING',

  // Regeneration
  SET_REGENERATING_MESSAGE: 'SET_REGENERATING_MESSAGE',
  REMOVE_REGENERATING_MESSAGE: 'REMOVE_REGENERATING_MESSAGE',
  SET_REGENERATION_ERROR: 'SET_REGENERATION_ERROR',
  CLEAR_REGENERATION_ERROR: 'CLEAR_REGENERATION_ERROR',

  // Threads
  SET_THREADS: 'SET_THREADS',
  ADD_THREADS: 'ADD_THREADS',
  ADD_NEW_THREAD: 'ADD_NEW_THREAD',
  SET_CURRENT_THREAD: 'SET_CURRENT_THREAD',
  UPDATE_THREAD: 'UPDATE_THREAD',
  DELETE_THREAD: 'DELETE_THREAD',

  // Projects
  SET_PROJECTS: 'SET_PROJECTS',
  ADD_PROJECTS: 'ADD_PROJECTS',
  SET_CURRENT_PROJECT: 'SET_CURRENT_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',

  // Project threads and expansion
  SET_PROJECT_THREADS: 'SET_PROJECT_THREADS',
  ADD_PROJECT_THREAD: 'ADD_PROJECT_THREAD',
  TOGGLE_PROJECT_EXPANSION: 'TOGGLE_PROJECT_EXPANSION',
  SET_PROJECT_EXPANDED: 'SET_PROJECT_EXPANDED',

  // Messages
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGES: 'ADD_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  UPDATE_MESSAGE_ID: 'UPDATE_MESSAGE_ID',
  UPDATE_MESSAGE_ID_AND_CONTENT: 'UPDATE_MESSAGE_ID_AND_CONTENT',
  REMOVE_MESSAGE: 'REMOVE_MESSAGE',

  // Models
  SET_AVAILABLE_MODELS: 'SET_AVAILABLE_MODELS',
  SET_SELECTED_MODEL: 'SET_SELECTED_MODEL',

  // Session management
  SET_CURRENT_SESSION_ID: 'SET_CURRENT_SESSION_ID',

  // Search
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',

  // Pagination
  SET_THREADS_OFFSET: 'SET_THREADS_OFFSET',
  SET_PROJECTS_OFFSET: 'SET_PROJECTS_OFFSET',
  SET_MESSAGES_OFFSET: 'SET_MESSAGES_OFFSET',
  SET_HAS_MORE_THREADS: 'SET_HAS_MORE_THREADS',
  SET_HAS_MORE_PROJECTS: 'SET_HAS_MORE_PROJECTS',
  SET_HAS_MORE_MESSAGES: 'SET_HAS_MORE_MESSAGES',
};

// Reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case CHAT_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case CHAT_ACTIONS.SET_SENDING:
      return { ...state, isSending: action.payload };

    case CHAT_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false, isSending: false };

    case CHAT_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case CHAT_ACTIONS.SET_STREAMING:
      return { ...state, isStreaming: action.payload };

    case CHAT_ACTIONS.SET_STREAMING_RESPONSE:
      return { ...state, streamingResponse: action.payload };

    case CHAT_ACTIONS.SET_STREAMING_ERROR:
      return { ...state, streamingError: action.payload, isStreaming: false };

    case CHAT_ACTIONS.CLEAR_STREAMING_ERROR:
      return { ...state, streamingError: null };

    case CHAT_ACTIONS.SET_CURRENT_STREAMING_MESSAGE:
      return { ...state, currentStreamingMessage: action.payload };

    case CHAT_ACTIONS.RESET_STREAMING:
      return {
        ...state,
        isStreaming: false,
        streamingResponse: '',
        streamingError: null,
        currentStreamingMessage: null
      };

    case CHAT_ACTIONS.SET_REGENERATING_MESSAGE:
      const updatedRegeneratingMessages = new Set(state.regeneratingMessages);
      updatedRegeneratingMessages.add(action.payload);
      return {
        ...state,
        regeneratingMessages: updatedRegeneratingMessages
      };

    case CHAT_ACTIONS.REMOVE_REGENERATING_MESSAGE:
      const filteredRegeneratingMessages = new Set(state.regeneratingMessages);
      filteredRegeneratingMessages.delete(action.payload);
      return {
        ...state,
        regeneratingMessages: filteredRegeneratingMessages
      };

    case CHAT_ACTIONS.SET_REGENERATION_ERROR:
      return {
        ...state,
        regenerationError: action.payload
      };

    case CHAT_ACTIONS.CLEAR_REGENERATION_ERROR:
      return {
        ...state,
        regenerationError: null
      };

    case CHAT_ACTIONS.SET_THREADS:
      return {
        ...state,
        threads: action.payload,
        threadsOffset: 0,
        hasMoreThreads: action.payload.length >= 6
      };

    case CHAT_ACTIONS.ADD_THREADS:
      return {
        ...state,
        threads: [...state.threads, ...action.payload],
        threadsOffset: state.threadsOffset + action.payload.length,
        hasMoreThreads: action.payload.length >= 6
      };

    case CHAT_ACTIONS.ADD_NEW_THREAD:
      // Add new thread to the beginning of the list (most recent first)
      // Remove any existing thread with the same ID to avoid duplicates
      const filteredThreads = state.threads.filter(thread => thread.id !== action.payload.id);
      return {
        ...state,
        threads: [action.payload, ...filteredThreads]
      };

    case CHAT_ACTIONS.SET_CURRENT_THREAD:
      return { ...state, currentThread: action.payload, currentProject: null };

    case CHAT_ACTIONS.UPDATE_THREAD:
      const threadUpdate = action.payload;

      // Update in main threads array
      const updatedMainThreads = state.threads.map(thread =>
        thread.id === threadUpdate.id ? { ...thread, ...threadUpdate } : thread
      );

      // Update in project threads as well
      const updatedProjectThreadsForUpdate = { ...state.projectThreads };
      Object.keys(updatedProjectThreadsForUpdate).forEach(projectId => {
        updatedProjectThreadsForUpdate[projectId] = updatedProjectThreadsForUpdate[projectId].map(thread =>
          thread.id === threadUpdate.id ? { ...thread, ...threadUpdate } : thread
        );
      });

      return {
        ...state,
        threads: updatedMainThreads,
        projectThreads: updatedProjectThreadsForUpdate,
        currentThread: state.currentThread?.id === threadUpdate.id
          ? { ...state.currentThread, ...threadUpdate }
          : state.currentThread
      };

    case CHAT_ACTIONS.DELETE_THREAD:
      const threadIdToDelete = action.payload;

      // Remove from main threads array
      const updatedThreads = state.threads.filter(thread => thread.id !== threadIdToDelete);

      // Remove from project threads as well
      const updatedProjectThreads = { ...state.projectThreads };
      Object.keys(updatedProjectThreads).forEach(projectId => {
        updatedProjectThreads[projectId] = updatedProjectThreads[projectId].filter(
          thread => thread.id !== threadIdToDelete
        );
      });

      return {
        ...state,
        threads: updatedThreads,
        projectThreads: updatedProjectThreads,
        currentThread: state.currentThread?.id === threadIdToDelete ? null : state.currentThread
      };

    case CHAT_ACTIONS.SET_PROJECTS:
      return {
        ...state,
        projects: action.payload,
        projectsOffset: 0,
        hasMoreProjects: action.payload.length >= 6
      };

    case CHAT_ACTIONS.ADD_PROJECTS:
      return {
        ...state,
        projects: [...state.projects, ...action.payload],
        projectsOffset: state.projectsOffset + action.payload.length,
        hasMoreProjects: action.payload.length >= 6
      };

    case CHAT_ACTIONS.SET_CURRENT_PROJECT:
      return { ...state, currentProject: action.payload, currentThread: null };

    case CHAT_ACTIONS.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? { ...project, ...action.payload } : project
        ),
        currentProject: state.currentProject?.id === action.payload.id
          ? { ...state.currentProject, ...action.payload }
          : state.currentProject
      };

    case CHAT_ACTIONS.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        currentProject: state.currentProject?.id === action.payload ? null : state.currentProject
      };

    case CHAT_ACTIONS.SET_PROJECT_THREADS:
      return {
        ...state,
        projectThreads: {
          ...state.projectThreads,
          [action.payload.projectId]: action.payload.threads
        }
      };

    case CHAT_ACTIONS.ADD_PROJECT_THREAD:
      const { projectId, thread } = action.payload;
      const currentProjectThreads = state.projectThreads[projectId] || [];
      // Remove any existing thread with the same ID to avoid duplicates
      const filteredProjectThreads = currentProjectThreads.filter(t => t.id !== thread.id);
      return {
        ...state,
        projectThreads: {
          ...state.projectThreads,
          [projectId]: [thread, ...filteredProjectThreads]
        }
      };

    case CHAT_ACTIONS.TOGGLE_PROJECT_EXPANSION:
      const newExpandedProjects = new Set(state.expandedProjects);
      if (newExpandedProjects.has(action.payload)) {
        newExpandedProjects.delete(action.payload);
      } else {
        newExpandedProjects.add(action.payload);
      }
      return {
        ...state,
        expandedProjects: newExpandedProjects
      };

    case CHAT_ACTIONS.SET_PROJECT_EXPANDED:
      const updatedExpandedProjects = new Set(state.expandedProjects);
      if (action.payload.expanded) {
        updatedExpandedProjects.add(action.payload.projectId);
      } else {
        updatedExpandedProjects.delete(action.payload.projectId);
      }
      return {
        ...state,
        expandedProjects: updatedExpandedProjects
      };

    case CHAT_ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messages: action.payload,
        messagesOffset: 0,
        hasMoreMessages: action.payload.length >= 50
      };

    case CHAT_ACTIONS.ADD_MESSAGES:
      return {
        ...state,
        messages: [...action.payload, ...state.messages],
        messagesOffset: state.messagesOffset + action.payload.length,
        hasMoreMessages: action.payload.length >= 50
      };

    case CHAT_ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };

    case CHAT_ACTIONS.UPDATE_MESSAGE:
      return {
        ...state,
        messages: state.messages.map(message =>
          message.id === action.payload.id ? { ...message, ...action.payload } : message
        )
      };

    case CHAT_ACTIONS.UPDATE_MESSAGE_ID:
      return {
        ...state,
        messages: state.messages.map(message =>
          message.id === action.payload.oldId ? { ...message, id: action.payload.newId } : message
        )
      };

    case CHAT_ACTIONS.UPDATE_MESSAGE_ID_AND_CONTENT:
      return {
        ...state,
        messages: state.messages.map(message =>
          message.id === action.payload.oldId ? {
            ...message,
            id: action.payload.newId,
            response: action.payload.response,
            message: action.payload.message,
            isStreaming: action.payload.isStreaming
          } : message
        )
      };

    case CHAT_ACTIONS.REMOVE_MESSAGE:
      return {
        ...state,
        messages: state.messages.filter(message => message.id !== action.payload)
      };

    case CHAT_ACTIONS.SET_AVAILABLE_MODELS:
      return { ...state, availableModels: action.payload };

    case CHAT_ACTIONS.SET_SELECTED_MODEL:
      return { ...state, selectedModel: action.payload };

    case CHAT_ACTIONS.SET_CURRENT_SESSION_ID:
      // Update session using session manager
      if (action.payload) {
        sessionManager.setSessionId(action.payload);
      } else {
        sessionManager.clearSessionId();
      }
      return { ...state, currentSessionId: action.payload };

    case CHAT_ACTIONS.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };

    case CHAT_ACTIONS.SET_SEARCH_RESULTS:
      return { ...state, searchResults: action.payload };

    default:
      return state;
  }
};

// Create context
const ChatContext = createContext();

// Provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadThreads();
      loadProjects();
      loadAvailableModels();
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load threads
  const loadThreads = async (offset = 0, append = false) => {
    // Prevent duplicate loading
    if (!append && state.isLoading) return;

    try {
      if (!append) dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });

      const response = await chatService.getThreads(6, offset);
      if (response.success) {
        if (append) {
          dispatch({ type: CHAT_ACTIONS.ADD_THREADS, payload: response.data.threads });
        } else {
          dispatch({ type: CHAT_ACTIONS.SET_THREADS, payload: response.data.threads });
        }
      }
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      if (!append) dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Load projects
  const loadProjects = async (offset = 0, append = false) => {
    // Prevent duplicate loading
    if (!append && state.isLoading) return;

    try {
      if (!append) dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });

      const response = await projectService.getProjects(6, offset);
      if (response.success) {
        if (append) {
          dispatch({ type: CHAT_ACTIONS.ADD_PROJECTS, payload: response.data.projects });
        } else {
          dispatch({ type: CHAT_ACTIONS.SET_PROJECTS, payload: response.data.projects });
        }
      }
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      if (!append) dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Transform API message format to UI format
  const transformApiMessages = (apiMessages) => {
    const transformedMessages = [];

    apiMessages.forEach((apiMessage) => {
      // Create user message
      const userMessage = {
        id: `${apiMessage.id}-user`,
        message: apiMessage.message,
        isUserMessage: true,
        createdAt: apiMessage.createdAt,
        llmModel: apiMessage.llmModel
      };

      // Create AI response message
      const aiMessage = {
        id: `${apiMessage.id}-ai`,
        message: apiMessage.response || '',
        response: apiMessage.response || '',
        isUserMessage: false,
        isStreaming: false,
        createdAt: apiMessage.createdAt,
        llmModel: apiMessage.llmModel
      };

      transformedMessages.push(userMessage, aiMessage);
    });

    return transformedMessages;
  };

  // Load messages for a thread
  const loadMessages = async (threadId, offset = 0, append = false) => {
    try {
      if (!append) dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });

      const response = await chatService.getThreadMessages(threadId, 50, offset);
      if (response.success) {
        // Transform API messages to UI format
        const transformedMessages = transformApiMessages(response.data.messages);

        if (append) {
          dispatch({ type: CHAT_ACTIONS.ADD_MESSAGES, payload: transformedMessages });
        } else {
          dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: transformedMessages });
        }
      }
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      if (!append) dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Load available models
  const loadAvailableModels = async () => {
    try {
      const response = await modelService.getAvailableModels();
      if (response.success) {
        dispatch({ type: CHAT_ACTIONS.SET_AVAILABLE_MODELS, payload: response.data.models });
      }
    } catch (error) {
      console.warn('Failed to load available models:', error.message);
      // Set default models if API fails
      dispatch({ type: CHAT_ACTIONS.SET_AVAILABLE_MODELS, payload: ['gpt-3.5-turbo', 'gpt-4'] });
    }
  };

  // Set selected model
  const setSelectedModel = (modelId) => {
    dispatch({ type: CHAT_ACTIONS.SET_SELECTED_MODEL, payload: modelId });
  };

  // Send message
  const sendMessage = async (message, threadId = null, projectId = null, llmModel = null) => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_SENDING, payload: true });

      const messageData = {
        message,
        llmModel: llmModel || state.selectedModel // Use selected model if not specified
      };

      // Only include threadId and projectId if they have valid values
      if (threadId) {
        messageData.threadId = threadId;
      }
      if (projectId) {
        messageData.projectId = projectId;
      }

      let response;
      if (projectId) {
        response = await projectService.sendProjectMessage(projectId, messageData);
      } else {
        response = await chatService.sendMessage(messageData);
      }

      if (response.success) {
        // Add the new message to the messages list
        const newMessage = {
          id: response.data.messageId,
          message,
          response: response.data.response,
          isUserMessage: true,
          createdAt: new Date().toISOString()
        };

        dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: newMessage });

        // Update current thread if needed
        if (response.data.threadId && (!state.currentThread || state.currentThread.id !== response.data.threadId)) {
          const threadResponse = await chatService.getThreadDetails(response.data.threadId);
          if (threadResponse.success) {
            dispatch({ type: CHAT_ACTIONS.SET_CURRENT_THREAD, payload: threadResponse.data });
          }
        }

        return response;
      }
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_SENDING, payload: false });
    }
  };

  // Send streaming message
  const sendStreamingMessage = async (message, threadId = null, projectId = null, llmModel = null) => {
    try {
      // Reset streaming state
      dispatch({ type: CHAT_ACTIONS.RESET_STREAMING });
      dispatch({ type: CHAT_ACTIONS.SET_STREAMING, payload: true });

      // Create user message immediately
      const userMessage = {
        id: `temp-user-${Date.now()}`,
        message,
        isUserMessage: true,
        createdAt: new Date().toISOString()
      };

      // Create placeholder for AI response
      const aiMessage = {
        id: `temp-ai-${Date.now()}`,
        message: '',
        response: '',
        isUserMessage: false,
        isStreaming: true,
        createdAt: new Date().toISOString()
      };

      // Add both messages to the list
      dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: userMessage });
      dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: aiMessage });
      dispatch({ type: CHAT_ACTIONS.SET_CURRENT_STREAMING_MESSAGE, payload: aiMessage });

      // Prepare options based on context for conversation continuity
      const options = {
        llmModel: llmModel || state.selectedModel,
        onChunk: (content, fullResponse) => {
          dispatch({ type: CHAT_ACTIONS.SET_STREAMING_RESPONSE, payload: fullResponse });
          // Update the AI message with streaming content
          dispatch({
            type: CHAT_ACTIONS.UPDATE_MESSAGE,
            payload: {
              id: aiMessage.id,
              response: fullResponse,
              message: fullResponse
            }
          });
        },
        onError: (error) => {
          dispatch({ type: CHAT_ACTIONS.SET_STREAMING_ERROR, payload: error.message });
        },
        onMetadata: (metadata) => {
          // Handle metadata from start events for early ID extraction
          console.log('Start event metadata:', metadata);

          const { sessionId, threadId } = metadata;

          // Update session ID for chat conversations (early extraction)
          if (sessionId && !threadId && !projectId && !state.currentSessionId) {
            dispatch({ type: CHAT_ACTIONS.SET_CURRENT_SESSION_ID, payload: sessionId });
          }
        }
      };

      let result;

      if (projectId) {
        // Project message - use threadId for conversation continuity within project
        options.threadId = threadId;
        result = await projectService.streamProjectMessage(projectId, message, options);
      } else if (threadId || state.currentThread?.id) {
        // Thread message - use threadId for conversation continuity
        // Use provided threadId or current thread ID from state
        options.threadId = threadId || state.currentThread.id;
        result = await chatService.streamMessage(message, options);
      } else {
        // Guest/regular chat - use sessionId for conversation continuity
        // Ensure we have a session ID for guest chat
        const sessionId = state.currentSessionId || sessionManager.getOrCreateSessionId();
        console.log('Using session ID for guest chat:', sessionId);

        // Update state if we created a new session ID
        if (sessionId !== state.currentSessionId) {
          dispatch({ type: CHAT_ACTIONS.SET_CURRENT_SESSION_ID, payload: sessionId });
        }

        options.sessionId = sessionId;
        result = await chatService.streamLegacyMessage(message, options);
      }

      if (result && result.response) {
        // Extract message ID from completion metadata if available
        const backendMessageId = result.metadata?.messageId;

        if (backendMessageId) {
          // Update both user and AI messages with proper backend-based IDs
          const newUserMessageId = `${backendMessageId}-user`;
          const newAiMessageId = `${backendMessageId}-ai`;

          // Update user message ID
          dispatch({
            type: CHAT_ACTIONS.UPDATE_MESSAGE_ID,
            payload: {
              oldId: userMessage.id,
              newId: newUserMessageId
            }
          });

          // Update AI message with final response and new ID
          dispatch({
            type: CHAT_ACTIONS.UPDATE_MESSAGE_ID_AND_CONTENT,
            payload: {
              oldId: aiMessage.id,
              newId: newAiMessageId,
              response: result.response,
              message: result.response,
              isStreaming: false
            }
          });
        } else {
          // Fallback: just update content without changing ID
          dispatch({
            type: CHAT_ACTIONS.UPDATE_MESSAGE,
            payload: {
              id: aiMessage.id,
              response: result.response,
              message: result.response,
              isStreaming: false
            }
          });
        }

        // Handle conversation continuity based on metadata from response
        if (result.metadata) {
          const { sessionId, threadId, chatId } = result.metadata;

          // Handle chatId from guest chat that becomes a thread
          if (chatId && !projectId) {
            // Update session ID for chat conversations if sessionId is also present
            if (sessionId && !threadId) {
              dispatch({ type: CHAT_ACTIONS.SET_CURRENT_SESSION_ID, payload: sessionId });
            }

            // For guest chat that becomes a thread, fetch thread details using chatId
            // This handles the case where streaming completes and we get a chatId
            try {
              // Try to get thread details using the chatId
              // The API should return thread details if a thread was created from this chat
              const threadResponse = await chatService.getThreadDetails(chatId);
              if (threadResponse.success) {
                const newThread = threadResponse.data;

                // Set as current thread
                dispatch({ type: CHAT_ACTIONS.SET_CURRENT_THREAD, payload: newThread });

                // Add to general threads list if it's a new thread
                const existingThread = state.threads.find(thread => thread.id === newThread.id);
                if (!existingThread) {
                  dispatch({ type: CHAT_ACTIONS.ADD_NEW_THREAD, payload: newThread });
                  console.log('Added new thread from chatId to sidebar:', newThread.name || newThread.id);
                } else {
                  // Update existing thread with latest details (including name)
                  dispatch({ type: CHAT_ACTIONS.UPDATE_THREAD, payload: newThread });
                  console.log('Updated thread details from chatId:', newThread.name || newThread.id);
                }
              }
            } catch (error) {
              console.log('No thread found for chatId (this is normal for guest chat):', error.message);
            }
          } else if (sessionId && !threadId && !projectId) {
            // Fallback: Handle sessionId for backward compatibility
            dispatch({ type: CHAT_ACTIONS.SET_CURRENT_SESSION_ID, payload: sessionId });
          }

          // Update thread context for thread conversations
          if (threadId && (!state.currentThread || state.currentThread.id !== threadId)) {
            try {
              const threadResponse = await chatService.getThreadDetails(threadId);
              if (threadResponse.success) {
                const newThread = threadResponse.data;

                // Set as current thread
                dispatch({ type: CHAT_ACTIONS.SET_CURRENT_THREAD, payload: newThread });

                // If this is a project conversation, add to project threads
                if (projectId) {
                  const existingProjectThread = state.projectThreads[projectId]?.find(thread => thread.id === threadId);
                  if (!existingProjectThread) {
                    dispatch({
                      type: CHAT_ACTIONS.ADD_PROJECT_THREAD,
                      payload: { projectId, thread: newThread }
                    });
                    console.log('Added new thread to project:', newThread.name || newThread.id);
                  } else {
                    // Update existing project thread with latest details
                    dispatch({
                      type: CHAT_ACTIONS.ADD_PROJECT_THREAD,
                      payload: { projectId, thread: newThread }
                    });
                    console.log('Updated project thread details:', newThread.name || newThread.id);
                  }
                } else {
                  // Add to general threads list if it's a new thread (not already in the list)
                  const existingThread = state.threads.find(thread => thread.id === threadId);
                  if (!existingThread) {
                    dispatch({ type: CHAT_ACTIONS.ADD_NEW_THREAD, payload: newThread });
                    console.log('Added new thread to sidebar:', newThread.name || newThread.id);
                  } else {
                    // Update existing thread with latest details (including name)
                    dispatch({ type: CHAT_ACTIONS.UPDATE_THREAD, payload: newThread });
                    console.log('Updated thread details:', newThread.name || newThread.id);
                  }
                }
              }
            } catch (error) {
              console.warn('Failed to fetch thread details:', error);
            }
          }

          // Log metadata for debugging
          console.log('Response metadata:', result.metadata);
        }
      }

      return { success: true, data: result };
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_STREAMING_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_STREAMING, payload: false });
    }
  };

  // Send streaming message with file attachment
  const sendStreamingMessageWithFile = async (message, file, threadId = null, projectId = null, llmModel = null) => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_STREAMING, payload: true });
      dispatch({ type: CHAT_ACTIONS.CLEAR_STREAMING_ERROR });

      // Create temporary user message with file indicator
      const tempUserMessageId = `temp-user-${Date.now()}`;
      const userMessage = {
        id: tempUserMessageId,
        message,
        isUserMessage: true,
        hasAttachment: true,
        attachmentName: file.name,
        attachmentSize: file.size,
        createdAt: new Date().toISOString()
      };

      // Create temporary AI message for streaming
      const tempAiMessageId = `temp-ai-${Date.now()}`;
      const aiMessage = {
        id: tempAiMessageId,
        message: '',
        response: '',
        isUserMessage: false,
        isStreaming: true,
        createdAt: new Date().toISOString()
      };

      // Add messages to UI
      dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: userMessage });
      dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: aiMessage });

      // Set up streaming callbacks
      const streamCallbacks = {
        onStart: (data) => {
          console.log('File upload stream started:', data);
          dispatch({ type: CHAT_ACTIONS.SET_CURRENT_STREAMING_MESSAGE, payload: aiMessage });
        },
        onChunk: (content, fullResponse) => {
          dispatch({
            type: CHAT_ACTIONS.UPDATE_MESSAGE,
            payload: {
              id: aiMessage.id,
              response: fullResponse,
              message: fullResponse,
              isStreaming: true
            }
          });
          dispatch({ type: CHAT_ACTIONS.SET_STREAMING_RESPONSE, payload: fullResponse });
        },
        onComplete: (fullResponse, data) => {
          console.log('File upload stream completed:', data);
          dispatch({
            type: CHAT_ACTIONS.UPDATE_MESSAGE,
            payload: {
              id: aiMessage.id,
              response: fullResponse,
              message: fullResponse,
              isStreaming: false
            }
          });
          dispatch({ type: CHAT_ACTIONS.SET_CURRENT_STREAMING_MESSAGE, payload: null });
        },
        onError: (error) => {
          console.error('File upload streaming error:', error);
          dispatch({ type: CHAT_ACTIONS.SET_STREAMING_ERROR, payload: error.message });
        },
        onMetadata: (metadata) => {
          console.log('File upload metadata received:', metadata);
        }
      };

      // Determine which streaming method to use based on context
      let result;
      const modelToUse = llmModel || state.selectedModel;

      if (projectId) {
        // Project chat with file
        result = await streamingService.streamProjectMessageWithFile(projectId, message, file, {
          threadId,
          llmModel: modelToUse,
          ...streamCallbacks
        });
      } else if (threadId) {
        // Thread chat with file
        result = await streamingService.streamThreadMessageWithFile(message, file, {
          threadId,
          llmModel: modelToUse,
          ...streamCallbacks
        });
      } else {
        // Regular chat with file
        result = await streamingService.streamChatMessageWithFile(message, file, {
          sessionId: state.currentSessionId,
          llmModel: modelToUse,
          ...streamCallbacks
        });
      }

      // Handle completion and metadata updates
      if (result && result.metadata) {
        const { messageId: newUserMessageId, sessionId, threadId: newThreadId } = result.metadata;

        // Update message IDs if provided by backend
        if (newUserMessageId) {
          const newAiMessageId = `${newUserMessageId}-ai`;

          // Update user message ID
          dispatch({
            type: CHAT_ACTIONS.UPDATE_MESSAGE_ID,
            payload: {
              oldId: userMessage.id,
              newId: newUserMessageId
            }
          });

          // Update AI message with final response and new ID
          dispatch({
            type: CHAT_ACTIONS.UPDATE_MESSAGE_ID_AND_CONTENT,
            payload: {
              oldId: aiMessage.id,
              newId: newAiMessageId,
              response: result.response,
              message: result.response,
              isStreaming: false
            }
          });
        } else {
          // Fallback: just update content without changing ID
          dispatch({
            type: CHAT_ACTIONS.UPDATE_MESSAGE,
            payload: {
              id: aiMessage.id,
              response: result.response,
              message: result.response,
              isStreaming: false
            }
          });
        }

        // Handle conversation continuity based on metadata from response
        if (result.metadata) {
          const { sessionId, threadId, chatId } = result.metadata;

          // Handle chatId from guest chat that becomes a thread
          if (chatId && !projectId) {
            // Update session ID for chat conversations if sessionId is also present
            if (sessionId && !threadId) {
              dispatch({ type: CHAT_ACTIONS.SET_CURRENT_SESSION_ID, payload: sessionId });
            }

            // For guest chat that becomes a thread, fetch thread details using chatId
            try {
              const threadResponse = await chatService.getThreadDetails(chatId);
              if (threadResponse.success) {
                const newThread = threadResponse.data;

                // Set as current thread
                dispatch({ type: CHAT_ACTIONS.SET_CURRENT_THREAD, payload: newThread });

                // Add to general threads list if it's a new thread
                const existingThread = state.threads.find(thread => thread.id === newThread.id);
                if (!existingThread) {
                  dispatch({ type: CHAT_ACTIONS.ADD_NEW_THREAD, payload: newThread });
                  console.log('Added new thread from chatId to sidebar (file upload):', newThread.name || newThread.id);
                } else {
                  // Update existing thread with latest details (including name)
                  dispatch({ type: CHAT_ACTIONS.UPDATE_THREAD, payload: newThread });
                  console.log('Updated thread details from chatId (file upload):', newThread.name || newThread.id);
                }
              }
            } catch (error) {
              console.log('No thread found for chatId (file upload - this is normal for guest chat):', error.message);
            }
          } else if (sessionId && !threadId && !projectId) {
            // Fallback: Handle sessionId for backward compatibility
            dispatch({ type: CHAT_ACTIONS.SET_CURRENT_SESSION_ID, payload: sessionId });
          }

          // Update thread context for thread conversations
          if (threadId && (!state.currentThread || state.currentThread.id !== threadId)) {
            try {
              const threadResponse = await chatService.getThreadDetails(threadId);
              if (threadResponse.success) {
                const newThread = threadResponse.data;

                // Set as current thread
                dispatch({ type: CHAT_ACTIONS.SET_CURRENT_THREAD, payload: newThread });

                // If this is a project conversation, add to project threads
                if (projectId) {
                  const existingProjectThread = state.projectThreads[projectId]?.find(thread => thread.id === threadId);
                  if (!existingProjectThread) {
                    dispatch({
                      type: CHAT_ACTIONS.ADD_PROJECT_THREAD,
                      payload: { projectId, thread: newThread }
                    });
                    console.log('Added new thread to project (file upload):', newThread.name || newThread.id);
                  } else {
                    // Update existing project thread with latest details
                    dispatch({
                      type: CHAT_ACTIONS.ADD_PROJECT_THREAD,
                      payload: { projectId, thread: newThread }
                    });
                    console.log('Updated project thread details (file upload):', newThread.name || newThread.id);
                  }
                } else {
                  // Add to general threads list if it's a new thread (not already in the list)
                  const existingThread = state.threads.find(thread => thread.id === threadId);
                  if (!existingThread) {
                    dispatch({ type: CHAT_ACTIONS.ADD_NEW_THREAD, payload: newThread });
                    console.log('Added new thread to sidebar (file upload):', newThread.name || newThread.id);
                  } else {
                    // Update existing thread with latest details (including name)
                    dispatch({ type: CHAT_ACTIONS.UPDATE_THREAD, payload: newThread });
                    console.log('Updated thread details (file upload):', newThread.name || newThread.id);
                  }
                }
              }
            } catch (error) {
              console.warn('Failed to fetch thread details (file upload):', error);
            }
          }

          // Log metadata for debugging
          console.log('File upload response metadata:', result.metadata);
        }
      }

      return { success: true, data: result };
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_STREAMING_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_STREAMING, payload: false });
    }
  };

  // Create new project
  const createProject = async (projectData) => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });

      const response = await projectService.createProject(projectData);
      if (response.success) {
        dispatch({ type: CHAT_ACTIONS.ADD_PROJECTS, payload: [response.data] });
        return response;
      }
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Search projects
  const searchProjects = async (query) => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: CHAT_ACTIONS.SET_SEARCH_QUERY, payload: query });

      const response = await projectService.searchProjects(query);
      if (response.success) {
        dispatch({ type: CHAT_ACTIONS.SET_SEARCH_RESULTS, payload: response.data.projects });
      }
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Select thread
  const selectThread = async (thread) => {
    // Clear current messages first to avoid showing old messages
    dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: [] });
    dispatch({ type: CHAT_ACTIONS.SET_CURRENT_THREAD, payload: thread });
    dispatch({ type: CHAT_ACTIONS.SET_CURRENT_PROJECT, payload: null });
    await loadMessages(thread.id);
  };

  // Toggle project expansion
  const toggleProjectExpansion = async (projectId) => {
    const wasExpanded = state.expandedProjects.has(projectId);

    dispatch({ type: CHAT_ACTIONS.TOGGLE_PROJECT_EXPANSION, payload: projectId });

    // Load project threads if expanding and not already loaded
    if (!wasExpanded && !state.projectThreads[projectId]) {
      await loadProjectThreads(projectId);
    }
  };

  // Load project threads
  const loadProjectThreads = async (projectId) => {
    try {
      const response = await projectService.getProjectThreads(projectId);
      if (response.success) {
        // The API response has threads nested inside response.data.threads.threads
        // Extract the actual threads array from the nested structure
        const threadsData = response.data.threads;
        const actualThreads = threadsData && threadsData.threads ? threadsData.threads : [];

        dispatch({
          type: CHAT_ACTIONS.SET_PROJECT_THREADS,
          payload: {
            projectId,
            threads: actualThreads
          }
        });
      }
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Select project (just set as current, don't load messages)
  const selectProject = (project) => {
    dispatch({ type: CHAT_ACTIONS.SET_CURRENT_PROJECT, payload: project });
  };

  // Start new chat
  const startNewChat = () => {
    dispatch({ type: CHAT_ACTIONS.SET_CURRENT_THREAD, payload: null });
    dispatch({ type: CHAT_ACTIONS.SET_CURRENT_PROJECT, payload: null });
    dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: [] });

    // Reset session for new chat using session manager
    const newSessionId = sessionManager.resetSession();
    dispatch({ type: CHAT_ACTIONS.SET_CURRENT_SESSION_ID, payload: newSessionId });
  };

  // Start new chat within a project
  const startNewProjectChat = (project) => {
    dispatch({ type: CHAT_ACTIONS.SET_CURRENT_THREAD, payload: null });
    dispatch({ type: CHAT_ACTIONS.SET_CURRENT_PROJECT, payload: project });
    dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: [] });

    // Reset session for new chat using session manager
    const newSessionId = sessionManager.resetSession();
    dispatch({ type: CHAT_ACTIONS.SET_CURRENT_SESSION_ID, payload: newSessionId });
  };

  // Set session ID for conversation continuity
  const setSessionId = (sessionId) => {
    dispatch({ type: CHAT_ACTIONS.SET_CURRENT_SESSION_ID, payload: sessionId });
  };

  // Delete thread
  const deleteThread = async (threadId) => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });

      const response = await chatService.deleteThread(threadId);
      if (response.success) {
        dispatch({ type: CHAT_ACTIONS.DELETE_THREAD, payload: threadId });
        return response;
      }
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Update thread name
  const updateThreadName = async (threadId, name) => {
    try {
      const response = await chatService.updateThreadName(threadId, name);
      if (response.success) {
        dispatch({ type: CHAT_ACTIONS.UPDATE_THREAD, payload: { id: threadId, name } });
        return response;
      }
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Helper function to extract backend message ID from frontend message
  const extractBackendMessageId = (message) => {
    // Handle different message ID formats
    const messageId = message.id;

    // Case 1: Already a proper UUID (from API messages with -ai/-user suffix)
    if (messageId.includes('-ai') || messageId.includes('-user')) {
      const baseId = messageId.replace(/-(?:ai|user)$/, '');
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(baseId)) {
        return baseId;
      }
    }

    // Case 2: Direct UUID (shouldn't happen in UI but handle it)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(messageId)) {
      return messageId;
    }

    // Case 3: Regenerated messages (regenerated-*)
    // These should use their parentMessageId
    if (messageId.startsWith('regenerated-') && message.parentMessageId) {
      return message.parentMessageId;
    }

    // Case 4: Temporary streaming messages (temp-ai-*, temp-user-*) or other formats
    // These don't have backend IDs yet, so they can't be regenerated
    return null;
  };

  // Regenerate message
  const regenerateMessage = async (messageId, llmModel = null) => {
    try {
      // Clear any previous regeneration errors
      dispatch({ type: CHAT_ACTIONS.CLEAR_REGENERATION_ERROR });

      // Mark message as being regenerated
      dispatch({ type: CHAT_ACTIONS.SET_REGENERATING_MESSAGE, payload: messageId });

      // Find the original message to get its details
      const originalMessage = state.messages.find(msg =>
        msg.id === messageId || msg.id === `${messageId}-ai` || msg.id === `${messageId}-user`
      );

      if (!originalMessage) {
        throw new Error('Original message not found');
      }

      // Determine the actual message ID to send to backend
      let actualMessageId;

      if (originalMessage.isRegenerated && originalMessage.parentMessageId) {
        // If this is a regenerated message, use the parent message ID
        actualMessageId = originalMessage.parentMessageId;
      } else {
        // Extract the actual message ID based on message type
        actualMessageId = extractBackendMessageId(originalMessage);
      }

      // Validate that we have a proper UUID format for the backend
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!actualMessageId || !uuidRegex.test(actualMessageId)) {
        throw new Error('Cannot regenerate this message. Only AI responses from completed conversations can be regenerated.');
      }

      // Create placeholder for regenerated response
      const regeneratedMessage = {
        id: `regenerated-${Date.now()}`,
        message: '',
        response: '',
        isUserMessage: false,
        isStreaming: true,
        isRegenerated: true,
        parentMessageId: actualMessageId,
        createdAt: new Date().toISOString()
      };

      // Add regenerated message to the list
      dispatch({
        type: CHAT_ACTIONS.ADD_MESSAGE,
        payload: regeneratedMessage
      });

      // Set up streaming callbacks
      const streamCallbacks = {
        onStart: (data) => {
          console.log('Regeneration stream started:', data);
        },
        onChunk: (content, fullResponse) => {
          // Update the regenerated message with streaming content
          dispatch({
            type: CHAT_ACTIONS.UPDATE_MESSAGE,
            payload: {
              id: regeneratedMessage.id,
              response: fullResponse,
              message: fullResponse,
              isStreaming: true
            }
          });
        },
        onComplete: (fullResponse, data) => {
          console.log('Regeneration stream completed:', data);
          // Update the regenerated message with final response
          dispatch({
            type: CHAT_ACTIONS.UPDATE_MESSAGE,
            payload: {
              id: regeneratedMessage.id,
              response: fullResponse,
              message: fullResponse,
              isStreaming: false
            }
          });
        },
        onError: (error) => {
          console.error('Regeneration streaming error:', error);
          dispatch({ type: CHAT_ACTIONS.SET_REGENERATION_ERROR, payload: error.message });

          // Remove the failed regenerated message
          dispatch({
            type: CHAT_ACTIONS.REMOVE_MESSAGE,
            payload: regeneratedMessage.id
          });
        }
      };

      // Call the regeneration service
      const result = await chatService.regenerateMessage(actualMessageId, {
        llmModel,
        ...streamCallbacks
      });

      return { success: true, data: result };
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_REGENERATION_ERROR, payload: error.message });
      throw error;
    } finally {
      // Remove message from regenerating set
      dispatch({ type: CHAT_ACTIONS.REMOVE_REGENERATING_MESSAGE, payload: messageId });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });
  };

  // Clear regeneration error
  const clearRegenerationError = () => {
    dispatch({ type: CHAT_ACTIONS.CLEAR_REGENERATION_ERROR });
  };

  const value = {
    ...state,
    loadThreads,
    loadProjects,
    loadMessages,
    loadAvailableModels,
    setSelectedModel,
    sendMessage,
    sendStreamingMessage,
    sendStreamingMessageWithFile,
    regenerateMessage,
    setSessionId,
    createProject,
    searchProjects,
    selectThread,
    selectProject,
    toggleProjectExpansion,
    loadProjectThreads,
    startNewChat,
    startNewProjectChat,
    deleteThread,
    updateThreadName,
    clearError,
    clearRegenerationError,
    dispatch,
    CHAT_ACTIONS,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
