import { Volume2, VolumeX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface VoiceControlsProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  sessionId: string | null;
}

export function VoiceControls({ isEnabled, onToggle, sessionId }: VoiceControlsProps) {
  const { toast } = useToast();

  const handleClearChat = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to clear chat");
      
      toast({
        title: "チャット履歴をクリアしました",
        description: "新しい会話を開始できます。",
      });
      
      // Reload page to start fresh session
      window.location.reload();
    } catch (error) {
      console.error("Clear chat failed:", error);
      toast({
        title: "エラー",
        description: "チャット履歴のクリアに失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggle(!isEnabled)}
        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        title="音声再生切替"
        data-testid="button-voice-toggle"
      >
        {isEnabled ? (
          <Volume2 className="w-5 h-5 text-slate-600" />
        ) : (
          <VolumeX className="w-5 h-5 text-slate-600" />
        )}
      </Button>
      
      <div className="w-px h-6 bg-slate-300"></div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClearChat}
        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        title="チャット履歴をクリア"
        data-testid="button-clear-chat"
      >
        <Trash2 className="w-5 h-5 text-slate-600" />
      </Button>
    </div>
  );
}
