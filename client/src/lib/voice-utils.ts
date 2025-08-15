// Voice-related utility functions
export class VoiceUtils {
  
  static async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Clean up
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }
  
  static isWebSpeechSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }
  
  static isMediaRecorderSupported(): boolean {
    return 'MediaRecorder' in window;
  }
  
  static async convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remove data URL prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  static createAudioContext(): AudioContext {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    return new AudioContextClass();
  }
  
  static formatRecordingTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  static detectLanguage(text: string): 'ja' | 'en' {
    // Simple language detection based on character sets
    const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    return japaneseRegex.test(text) ? 'ja' : 'en';
  }
  
  static getOptimalVoiceSettings(language: string) {
    const settings = {
      ja: {
        voice: 'alloy',
        speed: 1.0,
        model: 'tts-1'
      },
      en: {
        voice: 'nova',
        speed: 1.0,
        model: 'tts-1'
      }
    };
    
    return settings[language as keyof typeof settings] || settings.ja;
  }
}
