import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, User, Mic, Send, Play, Square, Pause, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AudioVisualizer } from "@/components/audio-visualizer";
import { useVoiceRecording } from "@/hooks/use-voice-recording";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { useToast } from "@/hooks/use-toast";
import { type ConsultantMode, type ChatMessage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface ChatInterfaceProps {
  sessionId: string | null;
  currentMode: ConsultantMode;
  language: "JP" | "EN";
  isVoiceEnabled: boolean;
}

export function ChatInterface({ sessionId, currentMode, language, isVoiceEnabled }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    audioLevel
  } = useVoiceRecording();

  const {
    isPlaying,
    currentlyPlaying,
    playAudio,
    stopAudio,
    togglePlayPause
  } = useAudioPlayback();

  // Get session data
  const { data: sessionData } = useQuery({
    queryKey: ['/api/sessions', sessionId],
    enabled: !!sessionId,
    refetchInterval: false,
  });

  const messages = (sessionData as any)?.session?.messages || [];

  // Send chat message mutation
  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; isVoice?: boolean }) => {
      const response = await apiRequest('POST', '/api/chat', {
        sessionId,
        message: data.message,
        mode: currentMode,
        isVoice: data.isVoice
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', sessionId] });
      setMessage("");
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast({
        title: "送信エラー",
        description: "メッセージの送信に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  });

  // Voice chat mutation
  const voiceChatMutation = useMutation({
    mutationFn: async (audioData: string) => {
      const response = await apiRequest('POST', '/api/voice/chat', {
        sessionId,
        audioData,
        mode: currentMode
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Show transcription confirmation to user
      if (data.transcription) {
        toast({
          title: "音声認識完了",
          description: `「${data.transcription}」`,
          duration: 3000,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', sessionId] });
      
      // Auto-play AI response if voice is enabled
      if (isVoiceEnabled && data.audioResponses) {
        playAudio('activeListening', data.audioResponses.activeListening);
      }
    },
    onError: (error) => {
      console.error('Voice chat error:', error);
      toast({
        title: "音声処理エラー",
        description: "音声の処理に失敗しました。テキストで入力してください。",
        variant: "destructive",
      });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to start/stop recording (when not in textarea)
      if (e.code === 'Space' && e.target !== textareaRef.current && !isTyping) {
        e.preventDefault();
        if (isRecording) {
          handleStopRecording();
        } else {
          handleStartRecording();
        }
      }
      
      // Escape to cancel recording
      if (e.key === 'Escape' && isRecording) {
        stopRecording();
      }
      
      // Ctrl+Enter to send message
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && message.trim()) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, isTyping, message]);

  const handleStartRecording = () => {
    if (!sessionId) {
      toast({
        title: "セッションエラー",
        description: "音声録音を開始できません。ページを再読み込みしてください。",
        variant: "destructive",
      });
      return;
    }
    startRecording(sessionId, currentMode);
  };

  const handleStopRecording = async () => {
    try {
      const audioData = await stopRecording();
      if (audioData) {
        voiceChatMutation.mutate(audioData);
      }
    } catch (error) {
      console.error('Recording stop error:', error);
      toast({
        title: "録音エラー",
        description: "録音の停止中にエラーが発生しました。",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !sessionId) return;
    
    setIsTyping(true);
    chatMutation.mutate({ message: message.trim() });
  };

  const handlePlayMessage = async (messageId: string, section?: string) => {
    if (!isVoiceEnabled) return;
    
    const targetMessage = messages.find((msg: ChatMessage) => msg.id === messageId);
    if (!targetMessage) return;

    try {
      let textToPlay = "";
      if (section && targetMessage.sections) {
        const targetSection = targetMessage.sections.find((s: any) => s.type === section);
        textToPlay = targetSection?.content || targetMessage.content;
      } else {
        textToPlay = targetMessage.content;
      }

      const response = await apiRequest('POST', '/api/voice/speak', {
        text: textToPlay,
        language: language === "JP" ? "ja" : "en",
        voice: "alloy"
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      playAudio(messageId, audioUrl);
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: "音声生成エラー",
        description: "音声の生成に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const renderMessage = (msg: ChatMessage) => {
    if (msg.role === "user") {
      return (
        <div key={msg.id} className="flex items-start space-x-3 justify-end fade-in">
          <div className="flex-1 text-right">
            <div className="inline-block bg-blue-600 text-white rounded-2xl px-4 py-3 max-w-md">
              <div className="flex items-center space-x-2 mb-2">
                {msg.isVoice && (
                  <div className="flex items-center space-x-1">
                    <Mic className="w-3 h-3" />
                    <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">音声</span>
                  </div>
                )}
              </div>
              <p>{msg.content}</p>
              {msg.transcription && msg.isVoice && (
                <div className="mt-2 p-2 bg-blue-500/30 rounded-md">
                  <div className="text-xs opacity-80 mb-1">認識結果:</div>
                  <div className="text-sm italic">「{msg.transcription}」</div>
                </div>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              {new Date(msg.timestamp).toLocaleTimeString('ja-JP', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            msg.isVoice ? 'bg-green-600' : 'bg-blue-600'
          }`}>
            {msg.isVoice ? (
              <Mic className="w-4 h-4 text-white" />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={msg.id} className="flex items-start space-x-3 fade-in">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          {msg.sections ? (
            <div className="space-y-3">
              {msg.sections.map((section, index) => {
                const sectionStyles = {
                  active_listening: "bg-blue-50 border-blue-200 text-blue-800",
                  step_a: "bg-green-50 border-green-200 text-green-800",
                  step_b: "bg-amber-50 border-amber-200 text-amber-800", 
                  step_c: "bg-purple-50 border-purple-200 text-purple-800",
                  feedback: "bg-slate-50 border-slate-200 text-slate-700"
                };

                const sectionIcons = {
                  active_listening: "🎯 Active Listening",
                  step_a: "📚 Step-A: 既存知識での考察",
                  step_b: "🔍 Step-B: 最新情報による補正",
                  step_c: "💡 Step-C: 統合された最終提案",
                  feedback: "🔄 フィードバック請求"
                };

                return (
                  <div 
                    key={index}
                    className={`border rounded-xl p-3 ${sectionStyles[section.type] || sectionStyles.feedback}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {sectionIcons[section.type] || section.type}
                      </span>
                      {isVoiceEnabled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePlayMessage(msg.id, section.type)}
                          className="p-1 hover:bg-white/50 rounded-md transition-colors"
                          data-testid={`button-play-${section.type}`}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">{section.content}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">AI Assistant</span>
                {isVoiceEnabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePlayMessage(msg.id)}
                    className="p-1 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                    data-testid={`button-play-message-${msg.id}`}
                  >
                    <Play className="w-3 h-3 text-blue-700" />
                  </Button>
                )}
              </div>
              <p className="text-slate-700">{msg.content}</p>
            </div>
          )}
          
          <div className="text-xs text-slate-400 mt-2">
            {new Date(msg.timestamp).toLocaleTimeString('ja-JP', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">InsightSmithへようこそ</h3>
            <p className="text-slate-500">メッセージを入力するか、音声ボタンで録音してください。</p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        
        {(isTyping || chatMutation.isPending || voiceChatMutation.isPending) && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-100 rounded-2xl p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-sm text-slate-600 ml-2">思考中...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-slate-200 space-y-4">
        
        {/* Recording Status */}
        {isRecording && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700">録音中...</span>
            </div>
            
            <AudioVisualizer audioLevel={audioLevel} />
            
            <div className="text-sm text-red-600">
              {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:
              {(recordingTime % 60).toString().padStart(2, '0')}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStopRecording}
              className="ml-auto p-1.5 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
              data-testid="button-stop-recording"
            >
              <Square className="w-4 h-4 text-red-700" />
            </Button>
          </div>
        )}

        {/* Voice Processing Status */}
        {voiceChatMutation.isPending && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-blue-700">音声を処理中...</span>
            </div>
            <div className="text-xs text-blue-600">OpenAI Whisper で変換中</div>
          </div>
        )}

        {/* Audio Playback Controls */}
        {isPlaying && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-800">🔊 AI音声再生中</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={stopAudio}
                className="p-1 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
                data-testid="button-stop-playback"
              >
                <X className="w-3 h-3 text-amber-700" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayPause}
                className="p-1.5 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                data-testid="button-toggle-playback"
              >
                <Pause className="w-4 h-4 text-amber-700" />
              </Button>
              
              <div className="flex-1 bg-amber-200 rounded-full h-2 relative">
                <div className="bg-amber-600 h-2 rounded-full transition-all duration-300" style={{ width: '35%' }}></div>
              </div>
              
              <span className="text-xs text-amber-700">再生中</span>
            </div>
          </div>
        )}

        {/* Text Input */}
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="メッセージを入力するか、音声ボタンで録音してください..."
                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
                rows={2}
                disabled={isRecording || chatMutation.isPending}
                data-testid="textarea-message-input"
              />
              
              <div className="absolute bottom-3 right-3 flex items-center space-x-1">
                <span className="text-xs text-slate-400">{language}</span>
              </div>
            </div>
          </div>
          
          {/* Voice Recording Button */}
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={!sessionId || voiceChatMutation.isPending}
            className={`p-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            title="音声で録音 (Space)"
            data-testid="button-voice-record"
          >
            <Mic className="w-6 h-6 text-white" />
          </Button>
          
          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !sessionId || chatMutation.isPending || isRecording}
            className="p-4 bg-green-600 hover:bg-green-700 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
            title="メッセージを送信 (Ctrl+Enter)"
            data-testid="button-send-message"
          >
            <Send className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>
    </>
  );
}
