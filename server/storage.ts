import { type User, type InsertUser, type ChatSession, type VoiceInteraction, type ChatMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Chat session management
  createChatSession(mode: string, userId?: string): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  updateChatSession(id: string, messages: ChatMessage[]): Promise<ChatSession | undefined>;
  deleteChatSession(id: string): Promise<void>;
  
  // Voice interaction management
  createVoiceInteraction(interaction: Omit<VoiceInteraction, 'id' | 'createdAt'>): Promise<VoiceInteraction>;
  getVoiceInteractions(sessionId: string): Promise<VoiceInteraction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private chatSessions: Map<string, ChatSession>;
  private voiceInteractions: Map<string, VoiceInteraction>;

  constructor() {
    this.users = new Map();
    this.chatSessions = new Map();
    this.voiceInteractions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createChatSession(mode: string, userId?: string): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = {
      id,
      userId: userId || null,
      mode,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async updateChatSession(id: string, messages: ChatMessage[]): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = {
      ...session,
      messages,
      updatedAt: new Date(),
    };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteChatSession(id: string): Promise<void> {
    this.chatSessions.delete(id);
    // Also delete related voice interactions
    Array.from(this.voiceInteractions.entries())
      .filter(([_, interaction]) => interaction.sessionId === id)
      .forEach(([key]) => this.voiceInteractions.delete(key));
  }

  async createVoiceInteraction(interaction: Omit<VoiceInteraction, 'id' | 'createdAt'>): Promise<VoiceInteraction> {
    const id = randomUUID();
    const voiceInteraction: VoiceInteraction = {
      ...interaction,
      id,
      createdAt: new Date(),
    };
    this.voiceInteractions.set(id, voiceInteraction);
    return voiceInteraction;
  }

  async getVoiceInteractions(sessionId: string): Promise<VoiceInteraction[]> {
    return Array.from(this.voiceInteractions.values())
      .filter(interaction => interaction.sessionId === sessionId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }
}

export const storage = new MemStorage();
