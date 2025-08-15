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

export interface AIResponse {
  id: string;
  activeListening: ActiveListening;
  knowledgeSteps: KnowledgeSteps;
  feedbackRequest: string;
  nextActions: NextAction[];
  mode: ConversationMode;
  timestamp: Date;
}

export interface NextAction {
  id: string;
  label: string;
  description: string;
}

export interface ConversationSession {
  id: string;
  messages: Message[];
  currentMode: ConversationMode;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModeDetectionResult {
  detectedMode: ConversationMode;
  confidence: number;
  triggerPhrase?: string;
}

// API Request/Response types
export interface ChatRequest {
  message: string;
  sessionId?: string;
  forceMode?: ConversationMode;
  selectedAction?: string;
}

export interface ChatResponse {
  success: boolean;
  data?: AIResponse;
  error?: string;
  sessionId: string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

export interface WebSearchResponse {
  query: string;
  results: WebSearchResult[];
  timestamp: Date;
}

// Backend-specific types
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  choices: {
    message: OpenAIMessage;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface SessionData {
  sessionId: string;
  messages: OpenAIMessage[];
  currentMode: ConversationMode;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModePromptConfig {
  systemPrompt: string;
  responseFormat: string;
  guidelines: string[];
}