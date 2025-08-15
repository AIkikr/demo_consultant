import OpenAI from "openai";
import { type ChatMessage, type ConsultantMode } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export class OpenAIService {
  
  async generateConsultantResponse(
    message: string, 
    mode: ConsultantMode, 
    chatHistory: ChatMessage[] = []
  ): Promise<{
    activeListening: string;
    stepA: string;
    stepB: string;
    stepC: string;
    feedback: string;
    nextActions: string[];
  }> {
    const systemPrompts = {
      guide: `あなたは優しく丁寧なAIコンサルタント「InsightSmith」です。ユーザーのアイディア創出から実行計画まで伴走し、Teaching/Coaching/Consulting/Active-Listeningを状況に応じて使い分けます。

ガイドモードでは：
- 優しく丁寧な説明とサポート
- ユーザーが理解しやすい言葉で説明
- 段階的で実践的なアドバイス提供`,

      socrates: `あなたは質問主導のAIコンサルタント「InsightSmith」です。ソクラテス式対話法を用いて、ユーザー自身の思考を促進し、気づきを導きます。

ソクラテスモードでは：
- 答えを直接与えるのではなく、適切な質問で導く
- ユーザーの思考プロセスを刺激する
- 反省的思考を促進する質問形式`,

      hard: `あなたは厳格で直言するAIコンサルタント「InsightSmith」です。辛口レビューで厳しく課題を指摘し、現実的な問題点を浮き彫りにします。

ハードモードでは：
- 厳しく現実的な評価
- 潜在的リスクと課題の明確な指摘
- 具体的で実行可能な改善策の提示`
    };

    const conversationHistory = chatHistory
      .slice(-5) // Last 5 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const prompt = `
${systemPrompts[mode]}

以下の構造で応答してください（JSON形式）：

{
  "activeListening": "🎯 Active Listening: ユーザーの意図・感情・制約を要約確認",
  "stepA": "📚 Step-A: 既存知識での考察",
  "stepB": "🔍 Step-B: Web検索による最新情報補正（必要に応じて）",
  "stepC": "💡 Step-C: 統合された最終提案",
  "feedback": "🔄 フィードバック請求",
  "nextActions": ["詳細を聞く", "条件を変える", "実行計画を立てる"]
}

過去の会話履歴：
${conversationHistory}

現在のユーザーメッセージ：
${message}

モード：${mode}

日本語で回答し、JSON形式で出力してください。`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたは日本語で回答するAIコンサルタントです。必ずJSON形式で構造化された回答を提供してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: mode === 'hard' ? 0.7 : 0.8,
    });

    try {
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        activeListening: result.activeListening || "ご質問を理解いたしました。",
        stepA: result.stepA || "分析中です...",
        stepB: result.stepB || "最新情報を確認中です...",
        stepC: result.stepC || "提案をまとめています...",
        feedback: result.feedback || "何かご質問はありますか？",
        nextActions: result.nextActions || ["詳細を聞く", "条件を変える", "次のステップ"]
      };
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Failed to generate consultant response');
    }
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<{ text: string; language: string }> {
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: new File([audioBuffer], "audio.webm", { type: "audio/webm" }),
        model: "whisper-1",
        language: "ja", // Prefer Japanese but allow auto-detection
      });

      return {
        text: transcription.text,
        language: "ja" // Whisper doesn't return detected language, assume Japanese
      };
    } catch (error) {
      console.error('Transcription failed:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async generateSpeech(text: string, voice: string = "alloy"): Promise<Buffer> {
    try {
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice as any,
        input: text,
        speed: 1.0,
      });

      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error('Speech generation failed:', error);
      throw new Error('Failed to generate speech');
    }
  }
}

export const openAIService = new OpenAIService();
