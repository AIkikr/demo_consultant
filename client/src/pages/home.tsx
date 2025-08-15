import { useState, useEffect } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { ModeSelector } from "@/components/mode-selector";
import { VoiceControls } from "@/components/voice-controls";
import { MicrophoneDiagnostic } from "@/components/microphone-diagnostic";
import { useToast } from "@/hooks/use-toast";
import { type ConsultantMode } from "@shared/schema";
import { Brain, Languages, Settings2, Mic } from "lucide-react";

export default function Home() {
  const [currentMode, setCurrentMode] = useState<ConsultantMode>("guide");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<"JP" | "EN">("JP");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [showMicDiagnostic, setShowMicDiagnostic] = useState(false);
  const [microphoneReady, setMicrophoneReady] = useState(false);
  const { toast } = useToast();

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: currentMode }),
        });
        
        if (!response.ok) throw new Error("Failed to create session");
        
        const data = await response.json();
        setSessionId(data.session.id);
      } catch (error) {
        console.error("Session initialization failed:", error);
        toast({
          title: "接続エラー",
          description: "セッションの作成に失敗しました。ページを再読み込みしてください。",
          variant: "destructive",
        });
      }
    };

    initSession();
  }, [currentMode, toast]);

  const handleModeChange = (mode: ConsultantMode) => {
    setCurrentMode(mode);
    // Reset session when mode changes
    setSessionId(null);
  };

  const handleLanguageToggle = () => {
    setCurrentLanguage(prev => prev === "JP" ? "EN" : "JP");
  };

  const getModeDescription = (mode: ConsultantMode) => {
    const descriptions = {
      guide: "ガイドモード - 優しくサポートします",
      socrates: "ソクラテスモード - 質問で思考を促進します", 
      hard: "ハードモード - 厳しく評価します"
    };
    return descriptions[mode];
  };

  return (
    <div className="font-inter bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">InsightSmith</h1>
                <p className="text-xs text-slate-500">AI Consultant Bot 🧠💡</p>
              </div>
            </div>
            
            {/* Voice Status & Language Controls */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-full">
                <div className={`w-2 h-2 rounded-full animate-pulse ${microphoneReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-slate-600">
                  {microphoneReady ? '音声対応中' : '音声設定中'}
                </span>
              </div>
              
              <button 
                onClick={() => setShowMicDiagnostic(!showMicDiagnostic)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                title="マイク診断"
                data-testid="button-mic-diagnostic"
              >
                <Mic className="w-4 h-4" />
                <span className="text-sm font-medium">診断</span>
              </button>
              
              <button 
                onClick={handleLanguageToggle}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                data-testid="button-language-toggle"
              >
                <Languages className="w-4 h-4" />
                <span className="text-sm font-medium">{currentLanguage}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Microphone Diagnostic Panel */}
        {showMicDiagnostic && (
          <div className="mb-6">
            <MicrophoneDiagnostic onMicrophoneReady={setMicrophoneReady} />
          </div>
        )}
        
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Mode Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Settings2 className="w-5 h-5 mr-2 text-blue-600" />
                対話モード
              </h2>
              
              <ModeSelector 
                currentMode={currentMode}
                onModeChange={handleModeChange}
                sessionId={sessionId}
              />
              
              {/* Voice Shortcuts */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                  <span className="w-4 h-4 mr-1">⌨️</span>
                  ショートカット
                </h3>
                <div className="text-xs text-blue-700 space-y-1">
                  <div><kbd className="bg-white px-1.5 py-0.5 rounded">Space</kbd> 録音開始/停止</div>
                  <div><kbd className="bg-white px-1.5 py-0.5 rounded">Ctrl+V</kbd> 音声モード切替</div>
                  <div><kbd className="bg-white px-1.5 py-0.5 rounded">Esc</kbd> 録音キャンセル</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 h-[calc(100vh-200px)] flex flex-col">
              
              {/* Chat Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">InsightSmith Assistant</h3>
                    <p className="text-sm text-slate-500">{getModeDescription(currentMode)}</p>
                  </div>
                </div>
                
                <VoiceControls 
                  isEnabled={isVoiceEnabled}
                  onToggle={setIsVoiceEnabled}
                  sessionId={sessionId}
                />
              </div>
              
              {/* Chat Messages & Input */}
              <ChatInterface 
                sessionId={sessionId}
                currentMode={currentMode}
                language={currentLanguage}
                isVoiceEnabled={isVoiceEnabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
