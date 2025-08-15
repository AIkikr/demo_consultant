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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      // Setup audio analysis
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) { // Auto-stop after 60 seconds
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
      toast({
        title: "録音エラー",
        description: "マイクへのアクセスが許可されていません。ブラウザの設定を確認してください。",
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
