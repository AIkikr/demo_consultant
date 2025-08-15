import { SessionData, ConversationMode, OpenAIMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class SessionService {
  private static instance: SessionService;
  private sessions: Map<string, SessionData> = new Map();

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  /**
   * 新しいセッションを作成
   */
  createSession(initialMode: ConversationMode = 'guide'): SessionData {
    const sessionId = uuidv4();
    const now = new Date();
    
    const sessionData: SessionData = {
      sessionId,
      messages: [],
      currentMode: initialMode,
      createdAt: now,
      updatedAt: now
    };

    this.sessions.set(sessionId, sessionData);
    console.log(`Created new session: ${sessionId}`);
    
    return sessionData;
  }

  /**
   * セッションを取得
   */
  getSession(sessionId: string): SessionData | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * セッションが存在するかチェック
   */
  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * セッションにメッセージを追加
   */
  addMessage(sessionId: string, message: OpenAIMessage): SessionData | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error(`Session not found: ${sessionId}`);
      return null;
    }

    session.messages.push(message);
    session.updatedAt = new Date();
    
    this.sessions.set(sessionId, session);
    
    console.log(`Added message to session ${sessionId}: ${message.role}`);
    return session;
  }

  /**
   * セッションのモードを更新
   */
  updateMode(sessionId: string, mode: ConversationMode): SessionData | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error(`Session not found: ${sessionId}`);
      return null;
    }

    session.currentMode = mode;
    session.updatedAt = new Date();
    
    this.sessions.set(sessionId, session);
    
    console.log(`Updated mode for session ${sessionId}: ${mode}`);
    return session;
  }

  /**
   * セッションの会話履歴を取得
   */
  getMessageHistory(sessionId: string): OpenAIMessage[] {
    const session = this.sessions.get(sessionId);
    return session ? session.messages : [];
  }

  /**
   * セッションをクリア
   */
  clearSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    // メッセージをクリアするが、セッション自体は保持
    session.messages = [];
    session.updatedAt = new Date();
    
    this.sessions.set(sessionId, session);
    
    console.log(`Cleared messages for session ${sessionId}`);
    return true;
  }

  /**
   * セッションを削除
   */
  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      console.log(`Deleted session: ${sessionId}`);
    }
    return deleted;
  }

  /**
   * 古いセッションをクリーンアップ（1時間以上古いものを削除）
   */
  cleanupOldSessions(): number {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.updatedAt < oneHourAgo) {
        this.sessions.delete(sessionId);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} old sessions`);
    }

    return deletedCount;
  }

  /**
   * 全セッション統計を取得
   */
  getSessionStats() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    let activeSessions = 0;
    let totalMessages = 0;
    
    for (const session of this.sessions.values()) {
      if (session.updatedAt >= oneHourAgo) {
        activeSessions++;
      }
      totalMessages += session.messages.length;
    }

    return {
      totalSessions: this.sessions.size,
      activeSessions,
      totalMessages,
      timestamp: now
    };
  }

  /**
   * セッションデータをエクスポート（デバッグ用）
   */
  exportSessionData(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      sessionId: session.sessionId,
      messageCount: session.messages.length,
      currentMode: session.currentMode,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      lastMessage: session.messages.length > 0 
        ? session.messages[session.messages.length - 1]
        : null
    };
  }
}