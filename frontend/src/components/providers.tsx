/**
 * File: providers.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: React context providers for global state management and theming
 */

'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// Application state interface
interface AppState {
  theme: 'dark' | 'light';
  isLoading: boolean;
  error: string | null;
  user: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
  uploadedFiles: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    uploadedAt: Date;
  }>;
  agentPipeline: {
    isRunning: boolean;
    currentAgent: string | null;
    progress: number;
  };
}

// Initial application state
const initialState: AppState = {
  theme: 'dark',
  isLoading: false,
  error: null,
  user: null,
  uploadedFiles: [],
  agentPipeline: {
    isRunning: false,
    currentAgent: null,
    progress: 0,
  },
};

// Action types for state management
type AppAction =
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: AppState['user'] }
  | { type: 'ADD_UPLOADED_FILE'; payload: AppState['uploadedFiles'][0] }
  | { type: 'REMOVE_UPLOADED_FILE'; payload: string }
  | { type: 'START_AGENT_PIPELINE'; payload: string }
  | { type: 'UPDATE_PIPELINE_PROGRESS'; payload: number }
  | { type: 'COMPLETE_AGENT_PIPELINE' }
  | { type: 'RESET_STATE' };

// State reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'ADD_UPLOADED_FILE':
      return {
        ...state,
        uploadedFiles: [...state.uploadedFiles, action.payload],
      };
    
    case 'REMOVE_UPLOADED_FILE':
      return {
        ...state,
        uploadedFiles: state.uploadedFiles.filter(file => file.id !== action.payload),
      };
    
    case 'START_AGENT_PIPELINE':
      return {
        ...state,
        agentPipeline: {
          isRunning: true,
          currentAgent: action.payload,
          progress: 0,
        },
      };
    
    case 'UPDATE_PIPELINE_PROGRESS':
      return {
        ...state,
        agentPipeline: {
          ...state.agentPipeline,
          progress: action.payload,
        },
      };
    
    case 'COMPLETE_AGENT_PIPELINE':
      return {
        ...state,
        agentPipeline: {
          isRunning: false,
          currentAgent: null,
          progress: 100,
        },
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Context interface
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Convenience actions
  setTheme: (theme: 'dark' | 'light') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addUploadedFile: (file: AppState['uploadedFiles'][0]) => void;
  removeUploadedFile: (fileId: string) => void;
  startAgentPipeline: (agentId: string) => void;
  updatePipelineProgress: (progress: number) => void;
  completeAgentPipeline: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook to use the app context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// App provider component props
interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider component that provides global state management
 * 
 * This provider wraps the entire application and provides:
 * - Theme management (dark/light mode)
 * - Loading state management
 * - Error handling
 * - User authentication state
 * - File upload tracking
 * - Agent pipeline status
 * 
 * @param children - Child components to wrap
 */
export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Convenience action creators
  const setTheme = useCallback((theme: 'dark' | 'light') => {
    dispatch({ type: 'SET_THEME', payload: theme });
    // Persist theme preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, []);

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const addUploadedFile = (file: AppState['uploadedFiles'][0]) => {
    dispatch({ type: 'ADD_UPLOADED_FILE', payload: file });
  };

  const removeUploadedFile = (fileId: string) => {
    dispatch({ type: 'REMOVE_UPLOADED_FILE', payload: fileId });
  };

  const startAgentPipeline = (agentId: string) => {
    dispatch({ type: 'START_AGENT_PIPELINE', payload: agentId });
  };

  const updatePipelineProgress = (progress: number) => {
    dispatch({ type: 'UPDATE_PIPELINE_PROGRESS', payload: progress });
  };

  const completeAgentPipeline = () => {
    dispatch({ type: 'COMPLETE_AGENT_PIPELINE' });
  };

  // Initialize theme from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
      if (savedTheme && savedTheme !== state.theme) {
        setTheme(savedTheme);
      }
    }
  }, [setTheme, state.theme]);

  // Apply theme to document
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    }
  }, [state.theme]);

  const contextValue: AppContextType = {
    state,
    dispatch,
    setTheme,
    setLoading,
    setError,
    addUploadedFile,
    removeUploadedFile,
    startAgentPipeline,
    updatePipelineProgress,
    completeAgentPipeline,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Toast notification context for user feedback
 */
interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration (default 5 seconds)
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * Combined providers component that wraps all context providers
 * 
 * This component combines all the necessary providers for the application:
 * - AppProvider for global state management
 * - ToastProvider for notification system
 * 
 * @param children - Child components to wrap
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AppProvider>
  );
}
