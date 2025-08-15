// 共通型定義

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