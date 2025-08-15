import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { type ConsultantMode } from "@shared/schema";

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const { toast } = useToast();

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255); // Normalize to 0-1
    
    animationRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  const startRecording = useCallback(async (sessionId: string, mode: ConsultantMode) => {
    try {
      // Check microphone permissions first
      const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      console.log('Microphone permission status:', permissions.state);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100, // Higher sample rate for better quality
          channelCount: 1,    // Mono recording
          volume: 1.0
        } 
      });
      
      // Setup audio analysis
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Try different audio formats for better Windows compatibility
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/wav';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Use default
          }
        }
      }
      
      console.log('Using MIME type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, 
        mimeType ? { mimeType } : undefined
      );
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Start recording with smaller chunks for better processing
      mediaRecorder.start(250); // Record in 250ms chunks
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer with shorter auto-stop for smaller payloads
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) { // Auto-stop after 30 seconds to keep payload smaller
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
      // Start audio level monitoring
      updateAudioLevel();
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      
      let errorMessage = "マイクへのアクセスが許可されていません。";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "マイクのアクセス許可が必要です。ブラウザのアドレスバーの左にあるマイクアイコンをクリックして許可してください。";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "マイクが見つかりません。マイクが接続されているか確認してください。";
        } else if (error.name === 'NotReadableError') {
          errorMessage = "マイクが他のアプリケーションで使用中です。他のアプリを閉じてからお試しください。";
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = "マイクの設定に問題があります。異なるマイクをお試しください。";
        }
      }
      
      toast({
        title: "録音エラー",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast, updateAudioLevel]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null);
        return;
      }
      
      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = (reader.result as string).split(',')[1];
            resolve(base64Data);
          };
          reader.readAsDataURL(audioBlob);
          
          // Cleanup
          setIsRecording(false);
          setAudioLevel(0);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }
          
          // Stop all tracks
          const stream = mediaRecorderRef.current?.stream;
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          
        } catch (error) {
          console.error('Failed to process recording:', error);
          toast({
            title: "録音処理エラー",
            description: "録音の処理中にエラーが発生しました。",
            variant: "destructive",
          });
          resolve(null);
        }
      };
      
      mediaRecorderRef.current.stop();
    });
  }, [isRecording, toast]);

  return {
    isRecording,
    recordingTime,
    audioLevel,
    startRecording,
    stopRecording,
  };
}
