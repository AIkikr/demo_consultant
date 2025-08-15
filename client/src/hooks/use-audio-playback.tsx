import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export function useAudioPlayback() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const playAudio = useCallback(async (id: string, audioSource: string) => {
    try {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      let audioUrl: string;
      
      if (audioSource.startsWith('data:') || audioSource.startsWith('blob:')) {
        audioUrl = audioSource;
      } else {
        // Assume it's base64
        const audioBlob = new Blob([
          Uint8Array.from(atob(audioSource), c => c.charCodeAt(0))
        ], { type: 'audio/mpeg' });
        audioUrl = URL.createObjectURL(audioBlob);
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onloadstart = () => {
        setIsPlaying(true);
        setCurrentlyPlaying(id);
        setIsPaused(false);
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentlyPlaying(null);
        setIsPaused(false);
        if (audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(audioUrl);
        }
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        setCurrentlyPlaying(null);
        setIsPaused(false);
        toast({
          title: "音声再生エラー",
          description: "音声の再生に失敗しました。",
          variant: "destructive",
        });
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('Audio playback failed:', error);
      setIsPlaying(false);
      setCurrentlyPlaying(null);
      toast({
        title: "音声再生エラー",
        description: "音声の再生に失敗しました。",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentlyPlaying(null);
    setIsPaused(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPaused) {
      audioRef.current.play();
      setIsPaused(false);
    } else {
      audioRef.current.pause();
      setIsPaused(true);
    }
  }, [isPaused]);

  return {
    isPlaying,
    currentlyPlaying,
    isPaused,
    playAudio,
    stopAudio,
    togglePlayPause,
  };
}
