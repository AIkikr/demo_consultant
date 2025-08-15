import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { openAIService } from "./services/openai-service";
import { voiceService } from "./services/voice-service";
import { 
  chatRequestSchema, 
  voiceRequestSchema, 
  voicePlaybackRequestSchema,
  type ChatMessage 
} from "@shared/schema";
import { randomUUID } from "crypto";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      services: {
        openai: !!process.env.OPENAI_API_KEY,
        storage: "memory"
      }
    });
  });

  // Create new chat session
  app.post("/api/sessions", async (req, res) => {
    try {
      const { mode = "guide" } = req.body;
      const session = await storage.createChatSession(mode);
      res.json({ session });
    } catch (error) {
      console.error("Session creation failed:", error);
      res.status(500).json({ 
        error: "Failed to create session", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get chat session
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getChatSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json({ session });
    } catch (error) {
      console.error("Session retrieval failed:", error);
      res.status(500).json({ 
        error: "Failed to retrieve session",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = chatRequestSchema.parse(req.body);
      const { sessionId, message, mode, isVoice = false } = validatedData;

      // Get or create session
      let session;
      if (sessionId) {
        session = await storage.getChatSession(sessionId);
        if (!session) {
          return res.status(404).json({ error: "Session not found" });
        }
      } else {
        session = await storage.createChatSession(mode);
      }

      // Add user message to history
      const userMessage: ChatMessage = {
        id: randomUUID(),
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
        isVoice,
        transcription: isVoice ? message : undefined, // Save transcription if voice input
      };

      const updatedMessages = [...(session.messages || []), userMessage];

      // Generate AI response
      const aiResponse = await openAIService.generateConsultantResponse(
        message, 
        mode, 
        updatedMessages
      );

      // Create structured AI message
      const aiMessage: ChatMessage = {
        id: randomUUID(),
        role: "assistant",
        content: aiResponse.activeListening,
        timestamp: new Date().toISOString(),
        sections: [
          { type: "active_listening", content: aiResponse.activeListening },
          { type: "step_a", content: aiResponse.stepA },
          { type: "step_b", content: aiResponse.stepB },
          { type: "step_c", content: aiResponse.stepC },
          { type: "feedback", content: aiResponse.feedback },
        ]
      };

      const finalMessages = [...updatedMessages, aiMessage];

      // Update session
      await storage.updateChatSession(session.id, finalMessages);

      res.json({
        sessionId: session.id,
        response: aiResponse,
        message: aiMessage,
        nextActions: aiResponse.nextActions
      });

    } catch (error) {
      console.error("Chat processing failed:", error);
      res.status(500).json({ 
        error: "Failed to process chat message",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Voice transcription endpoint
  app.post("/api/voice/transcribe", async (req, res) => {
    try {
      const validatedData = voiceRequestSchema.parse(req.body);
      
      const result = await voiceService.processVoiceInput(validatedData);
      
      res.json({
        transcription: result.transcription,
        language: result.language,
        audioUrl: result.audioUrl
      });

    } catch (error) {
      console.error("Voice transcription failed:", error);
      res.status(500).json({ 
        error: "Failed to transcribe voice input",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Voice chat endpoint (transcribe + generate response + TTS)
  app.post("/api/voice/chat", async (req, res) => {
    try {
      const { sessionId, audioData, mode = "guide" } = req.body;
      
      if (!sessionId || !audioData) {
        return res.status(400).json({ error: "Missing sessionId or audioData" });
      }

      const voiceRequest = voiceRequestSchema.parse({ sessionId, audioData });
      
      const result = await voiceService.processVoiceChat(voiceRequest, mode);
      
      // Get or create session to save transcript
      let session = await storage.getChatSession(sessionId);
      if (!session) {
        session = await storage.createChatSession(mode);
      }

      // Add user message with transcription to history
      const userMessage: ChatMessage = {
        id: randomUUID(),
        role: "user",
        content: result.transcription,
        timestamp: new Date().toISOString(),
        isVoice: true,
        transcription: result.transcription, // Save original transcription
      };

      // Create AI response message
      const aiMessage: ChatMessage = {
        id: randomUUID(),
        role: "assistant",
        content: result.response.activeListening,
        timestamp: new Date().toISOString(),
        sections: [
          { type: "active_listening", content: result.response.activeListening },
          { type: "step_a", content: result.response.stepA },
          { type: "step_b", content: result.response.stepB },
          { type: "step_c", content: result.response.stepC },
          { type: "feedback", content: result.response.feedback },
        ]
      };

      // Update session with new messages
      const updatedMessages = [...(session.messages || []), userMessage, aiMessage];
      await storage.updateChatSession(sessionId, updatedMessages);
      
      // Convert audio buffers to base64 for transmission
      const audioResponses = {
        activeListening: result.audioResponses.activeListening.toString('base64'),
        stepA: result.audioResponses.stepA.toString('base64'),
        stepB: result.audioResponses.stepB.toString('base64'),
        stepC: result.audioResponses.stepC.toString('base64'),
        feedback: result.audioResponses.feedback.toString('base64'),
      };

      res.json({
        transcription: result.transcription,
        response: result.response,
        audioResponses,
        nextActions: result.response.nextActions,
        sessionId: sessionId,
        userMessage,
        aiMessage
      });

    } catch (error) {
      console.error("Voice chat processing failed:", error);
      res.status(500).json({ 
        error: "Failed to process voice chat",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Text-to-speech endpoint
  app.post("/api/voice/speak", async (req, res) => {
    try {
      const validatedData = voicePlaybackRequestSchema.parse(req.body);
      const { text, language, voice } = validatedData;
      
      const audioBuffer = await voiceService.generateVoiceResponse(text, language, voice);
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      });
      
      res.send(audioBuffer);

    } catch (error) {
      console.error("Text-to-speech failed:", error);
      res.status(500).json({ 
        error: "Failed to generate speech",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Delete chat session
  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      await storage.deleteChatSession(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Session deletion failed:", error);
      res.status(500).json({ 
        error: "Failed to delete session",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
