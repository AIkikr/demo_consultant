import { openAIService } from './openai-service';
import { storage } from '../storage';
import { type VoiceRequest, type ChatMessage } from '@shared/schema';

export class VoiceService {
  
  async processVoiceInput(voiceRequest: VoiceRequest): Promise<{
    transcription: string;
    language: string;
    audioUrl?: string;
  }> {
    try {
      // Decode base64 audio data
      const audioBuffer = Buffer.from(voiceRequest.audioData, 'base64');
      
      // Transcribe using OpenAI Whisper
      const { text, language } = await openAIService.transcribeAudio(audioBuffer);
      
      // Store voice interaction
      await storage.createVoiceInteraction({
        sessionId: voiceRequest.sessionId,
        audioUrl: null, // Could store audio file URL in production
        transcription: text,
        language: language,
      });
      
      return {
        transcription: text,
        language: language,
      };
    } catch (error) {
      console.error('Voice processing failed:', error);
      throw new Error('Failed to process voice input');
    }
  }

  async generateVoiceResponse(text: string, language: string = "ja", voice: string = "alloy"): Promise<Buffer> {
    try {
      return await openAIService.generateSpeech(text, voice);
    } catch (error) {
      console.error('Voice response generation failed:', error);
      throw new Error('Failed to generate voice response');
    }
  }

  async processVoiceChat(voiceRequest: VoiceRequest, mode: string): Promise<{
    transcription: string;
    response: {
      activeListening: string;
      stepA: string;
      stepB: string;
      stepC: string;
      feedback: string;
      nextActions: string[];
    };
    audioResponses: {
      activeListening: Buffer;
      stepA: Buffer;
      stepB: Buffer;
      stepC: Buffer;
      feedback: Buffer;
    };
  }> {
    // First, transcribe the voice input
    const { transcription, language } = await this.processVoiceInput(voiceRequest);
    
    // Get chat history for context
    const session = await storage.getChatSession(voiceRequest.sessionId);
    const chatHistory = session?.messages || [];
    
    // Generate consultant response
    const response = await openAIService.generateConsultantResponse(
      transcription, 
      mode as any, 
      chatHistory
    );
    
    // Generate voice responses for each section
    const audioResponses = {
      activeListening: await this.generateVoiceResponse(response.activeListening, language),
      stepA: await this.generateVoiceResponse(response.stepA, language),
      stepB: await this.generateVoiceResponse(response.stepB, language),
      stepC: await this.generateVoiceResponse(response.stepC, language),
      feedback: await this.generateVoiceResponse(response.feedback, language),
    };
    
    return {
      transcription,
      response,
      audioResponses,
    };
  }
}

export const voiceService = new VoiceService();
