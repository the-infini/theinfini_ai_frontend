import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import sessionManager from '../utils/sessionManager';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getStoredToken();
      const user = authService.getStoredUser();

      if (token && user) {
        try {
          // Verify token is still valid
          const verifyResponse = await authService.verifyToken(token);
          if (verifyResponse.success && verifyResponse.data.valid) {
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: { user, token },
            });
          } else {
            // Token is invalid, clear stored data
            authService.clearAuthData();
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          }
        } catch (error) {
          // Token verification failed, clear stored data
          authService.clearAuthData();
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (loginData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const response = await authService.login(loginData);
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      });
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      });
      throw error;
    }
  };

  // Verify registration function
  const verifyRegistration = async (verificationData) => {
    try {
      const response = await authService.verifyRegistration(verificationData);
      if (response.success && response.data.token) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });
      }
      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      });
      throw error;
    }
  };

  // Request OTP function
  const requestOTP = async (identifier) => {
    try {
      const response = await authService.requestOTP(identifier);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Verify OTP function
  const verifyOTP = async (otpData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const response = await authService.verifyOTP(otpData);
      if (response.success && response.data.token) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });
      }
      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear session data on logout
      sessionManager.clearSessionId();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update user function
  const updateUser = (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    verifyRegistration,
    requestOTP,
    verifyOTP,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
