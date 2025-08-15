// Shared types
export type ConversationMode = 'guide' | 'socrates' | 'hard';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class APIClient {
  private static instance: APIClient;
  
  static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        sessionId: request.sessionId || '',
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}