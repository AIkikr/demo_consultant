import { create } from 'zustand';
// Shared types (duplicated to avoid import issues)
export type ConversationMode = 'guide' | 'socrates' | 'hard';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode?: ConversationMode;
}

export interface ActiveListening {
  intent: string;
  emotion: string;
  constraints: string[];
}

export interface KnowledgeSteps {
  stepA: string;
  stepB?: string;
  stepC: string;
}

export interface NextAction {
  id: string;
  label: string;
  description: string;
}

export interface AIResponse {
  id: string;
  activeListening: ActiveListening;
  knowledgeSteps: KnowledgeSteps;
  feedbackRequest: string;
  nextActions: NextAction[];
  mode: ConversationMode;
  timestamp: Date;
}

export interface ConversationSession {
  id: string;
  messages: Message[];
  currentMode: ConversationMode;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  currentSession: ConversationSession | null;
  sessions: ConversationSession[];
  isLoading: boolean;
  error: string | null;
}

interface ChatActions {
  createNewSession: () => void;
  addMessage: (message: Message) => void;
  addAIResponse: (response: AIResponse) => void;
  setCurrentMode: (mode: ConversationMode) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadSession: (sessionId: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  // State
  currentSession: null,
  sessions: [],
  isLoading: false,
  error: null,

  // Actions
  createNewSession: () => {
    const newSession: ConversationSession = {
      id: `session-${Date.now()}`,
      messages: [],
      currentMode: 'guide',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set(state => ({
      currentSession: newSession,
      sessions: [newSession, ...state.sessions],
    }));
  },

  addMessage: (message: Message) => {
    set(state => {
      if (!state.currentSession) return state;
      
      const updatedSession = {
        ...state.currentSession,
        messages: [...state.currentSession.messages, message],
        updatedAt: new Date(),
      };
      
      return {
        currentSession: updatedSession,
        sessions: state.sessions.map(s => 
          s.id === updatedSession.id ? updatedSession : s
        ),
      };
    });
  },

  addAIResponse: (response: AIResponse) => {
    const aiMessage: Message = {
      id: response.id,
      role: 'assistant',
      content: JSON.stringify(response),
      timestamp: response.timestamp,
      mode: response.mode,
    };
    
    get().addMessage(aiMessage);
    get().setCurrentMode(response.mode);
  },

  setCurrentMode: (mode: ConversationMode) => {
    set(state => {
      if (!state.currentSession) return state;
      
      const updatedSession = {
        ...state.currentSession,
        currentMode: mode,
        updatedAt: new Date(),
      };
      
      return {
        currentSession: updatedSession,
        sessions: state.sessions.map(s => 
          s.id === updatedSession.id ? updatedSession : s
        ),
      };
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  loadSession: (sessionId: string) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (session) {
      set({ currentSession: session });
    }
  },

  clearChat: () => {
    set(state => {
      if (!state.currentSession) return state;
      
      const clearedSession = {
        ...state.currentSession,
        messages: [],
        updatedAt: new Date(),
      };
      
      return {
        currentSession: clearedSession,
        sessions: state.sessions.map(s => 
          s.id === clearedSession.id ? clearedSession : s
        ),
      };
    });
  },
}));