import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mic, User, Clock, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type ChatMessage } from "@shared/schema";

interface TranscriptHistoryProps {
  sessionId: string | null;
}

export function TranscriptHistory({ sessionId }: TranscriptHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "voice" | "text">("all");

  // Get session data
  const { data: sessionData } = useQuery({
    queryKey: ['/api/sessions', sessionId],
    enabled: !!sessionId,
    refetchInterval: false,
  });

  const messages = (sessionData as any)?.session?.messages || [];
  
  // Filter messages based on search and type
  const filteredMessages = messages.filter((msg: ChatMessage) => {
    if (msg.role !== "user") return false; // Only show user messages
    
    const matchesSearch = searchQuery === "" || 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.transcription && msg.transcription.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === "all" || 
      (filterType === "voice" && msg.isVoice) ||
      (filterType === "text" && !msg.isVoice);
    
    return matchesSearch && matchesType;
  });

  const voiceCount = messages.filter((msg: ChatMessage) => msg.role === "user" && msg.isVoice).length;
  const textCount = messages.filter((msg: ChatMessage) => msg.role === "user" && !msg.isVoice).length;

  if (!sessionId || messages.length === 0) {
    return (
      <Card className="insight-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>会話履歴</span>
          </CardTitle>
          <CardDescription>音声認識と入力の履歴を表示します</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Mic className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>まだ会話がありません</p>
            <p className="text-sm">音声入力やテキスト入力を開始すると履歴が表示されます</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="insight-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>会話履歴</span>
          <div className="flex space-x-2 ml-auto">
            <Badge variant="outline" className="text-green-600">
              <Mic className="w-3 h-3 mr-1" />
              音声: {voiceCount}
            </Badge>
            <Badge variant="outline" className="text-blue-600">
              <User className="w-3 h-3 mr-1" />
              テキスト: {textCount}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>音声認識と入力の履歴（{filteredMessages.length}件表示）</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Search and Filter */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="履歴を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-transcript"
            />
          </div>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <Button
              variant={filterType === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType("all")}
              className="rounded-none border-0"
              data-testid="button-filter-all"
            >
              全て
            </Button>
            <Button
              variant={filterType === "voice" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType("voice")}
              className="rounded-none border-0"
              data-testid="button-filter-voice"
            >
              <Mic className="w-3 h-3 mr-1" />
              音声
            </Button>
            <Button
              variant={filterType === "text" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType("text")}
              className="rounded-none border-0"
              data-testid="button-filter-text"
            >
              <User className="w-3 h-3 mr-1" />
              テキスト
            </Button>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Filter className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>検索条件に一致する履歴がありません</p>
            </div>
          ) : (
            filteredMessages.map((msg: ChatMessage) => (
              <div 
                key={msg.id} 
                className={`p-3 rounded-lg border transition-colors hover:bg-slate-50 ${
                  msg.isVoice 
                    ? 'border-green-200 bg-green-50/50' 
                    : 'border-blue-200 bg-blue-50/50'
                }`}
                data-testid={`transcript-item-${msg.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {msg.isVoice ? (
                      <Mic className="w-4 h-4 text-green-600" />
                    ) : (
                      <User className="w-4 h-4 text-blue-600" />
                    )}
                    <Badge 
                      variant="outline" 
                      className={msg.isVoice ? 'text-green-600' : 'text-blue-600'}
                    >
                      {msg.isVoice ? '音声入力' : 'テキスト入力'}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(msg.timestamp).toLocaleString('ja-JP', { 
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                
                <div className="text-sm text-slate-800 mb-2">
                  {msg.content}
                </div>
                
                {msg.transcription && msg.isVoice && (
                  <div className="mt-2 p-2 bg-white/60 rounded border border-green-100">
                    <div className="text-xs text-green-600 font-medium mb-1">
                      音声認識結果:
                    </div>
                    <div className="text-xs text-slate-600 italic">
                      「{msg.transcription}」
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Summary Stats */}
        {filteredMessages.length > 0 && (
          <div className="pt-3 border-t border-slate-200">
            <div className="flex justify-between text-xs text-slate-500">
              <span>表示中: {filteredMessages.length}件</span>
              <span>総メッセージ: {messages.filter((msg: ChatMessage) => msg.role === "user").length}件</span>
            </div>
          </div>
        )}
        
      </CardContent>
    </Card>
  );
}