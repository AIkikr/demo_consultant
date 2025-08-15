import { Mic } from "lucide-react";
import { type ConsultantMode } from "@shared/schema";
import { useVoiceRecording } from "@/hooks/use-voice-recording";

interface ModeSelectorProps {
  currentMode: ConsultantMode;
  onModeChange: (mode: ConsultantMode) => void;
  sessionId: string | null;
}

export function ModeSelector({ currentMode, onModeChange, sessionId }: ModeSelectorProps) {
  const { startRecording } = useVoiceRecording();

  const modes = [
    {
      id: "guide" as const,
      emoji: "🫶",
      name: "ガイドモード",
      description: "優しく丁寧な説明とサポート",
      colors: {
        active: "border-green-300 bg-green-50",
        hover: "hover:border-green-300 hover:bg-green-50",
        inactive: "border-slate-200 bg-slate-50"
      }
    },
    {
      id: "socrates" as const,
      emoji: "🧠", 
      name: "ソクラテスモード",
      description: "質問主導でユーザーの思考を促進",
      colors: {
        active: "border-blue-300 bg-blue-50",
        hover: "hover:border-blue-300 hover:bg-blue-50",
        inactive: "border-slate-200 bg-slate-50"
      }
    },
    {
      id: "hard" as const,
      emoji: "⚡",
      name: "ハードモード", 
      description: "辛口レビューで厳しく課題を指摘",
      colors: {
        active: "border-red-300 bg-red-50",
        hover: "hover:border-red-300 hover:bg-red-50",
        inactive: "border-slate-200 bg-slate-50"
      }
    }
  ];

  const handleVoiceMode = (mode: ConsultantMode) => {
    if (!sessionId) return;
    onModeChange(mode);
    startRecording(sessionId, mode);
  };

  return (
    <div className="space-y-3">
      {modes.map((mode) => {
        const isActive = currentMode === mode.id;
        const colorClass = isActive ? mode.colors.active : `${mode.colors.inactive} ${mode.colors.hover}`;
        
        return (
          <div
            key={mode.id}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${colorClass}`}
            onClick={() => onModeChange(mode.id)}
            data-testid={`mode-card-${mode.id}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{mode.emoji}</span>
                <span className="font-medium text-slate-700">{mode.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVoiceMode(mode.id);
                }}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title={`音声で${mode.name}を開始`}
                data-testid={`button-voice-${mode.id}`}
              >
                <Mic className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <p className="text-sm text-slate-600">{mode.description}</p>
          </div>
        );
      })}
    </div>
  );
}
