// Client-side utilities for OpenAI integration
export class OpenAIClient {
  
  static async transcribeAudio(audioBlob: Blob): Promise<{ text: string; language: string }> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    const response = await fetch('/api/voice/transcribe', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Transcription failed');
    }
    
    return await response.json();
  }
  
  static async generateSpeech(text: string, language: string = 'ja', voice: string = 'alloy'): Promise<Blob> {
    const response = await fetch('/api/voice/speak', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, language, voice }),
    });
    
    if (!response.ok) {
      throw new Error('Speech generation failed');
    }
    
    return await response.blob();
  }
  
  static async sendVoiceChat(sessionId: string, audioData: string, mode: string) {
    const response = await fetch('/api/voice/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, audioData, mode }),
    });
    
    if (!response.ok) {
      throw new Error('Voice chat failed');
    }
    
    return await response.json();
  }
}
