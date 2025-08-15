import { ConversationMode, AIResponse, ActiveListening, KnowledgeSteps, NextAction } from '../types';
import { MODE_PROMPTS, SYSTEM_PROMPT_BASE } from '../utils/constants';
import { WebSearchService } from './webSearchService';
import { v4 as uuidv4 } from 'uuid';

export class AIService {
  private static instance: AIService;
  private webSearchService: WebSearchService;

  constructor() {
    this.webSearchService = WebSearchService.getInstance();
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * AIレスポンスを生成
   */
  async generateResponse(
    message: string,
    mode: ConversationMode,
    sessionId: string,
    messageHistory: string[] = []
  ): Promise<AIResponse> {
    try {
      console.log(`Generating AI response in ${mode} mode for session ${sessionId}`);

      // Step 1: Active Listening - ユーザーの意図と感情を分析
      const activeListening = this.analyzeUserInput(message);

      // Step 2: Knowledge Steps - 3段階の知識統合
      const knowledgeSteps = await this.processKnowledgeSteps(message, mode);

      // Step 3: Next Actions - フィードバック選択肢を生成
      const nextActions = this.generateNextActions(mode);

      // Step 4: フィードバックリクエスト
      const feedbackRequest = this.generateFeedbackRequest(mode);

      const response: AIResponse = {
        id: uuidv4(),
        activeListening,
        knowledgeSteps,
        feedbackRequest,
        nextActions,
        mode,
        timestamp: new Date()
      };

      return response;

    } catch (error) {
      console.error('AI service error:', error);
      
      // エラー時のフォールバック応答
      return this.generateErrorResponse(mode);
    }
  }

  /**
   * Active Listening: ユーザー入力を分析
   */
  private analyzeUserInput(message: string): ActiveListening {
    // シンプルなルールベースの分析（実際の実装ではより高度な自然言語処理を使用）
    const intent = this.extractIntent(message);
    const emotion = this.detectEmotion(message);
    const constraints = this.identifyConstraints(message);

    return { intent, emotion, constraints };
  }

  private extractIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('相談') || lowerMessage.includes('アドバイス')) {
      return 'アドバイス・相談を求めている';
    } else if (lowerMessage.includes('アイデア') || lowerMessage.includes('企画')) {
      return 'アイデア創出・企画立案を希望している';
    } else if (lowerMessage.includes('問題') || lowerMessage.includes('課題')) {
      return '問題解決・課題解決を求めている';
    } else if (lowerMessage.includes('学習') || lowerMessage.includes('勉強')) {
      return '学習・知識獲得を目的としている';
    } else {
      return '情報提供・サポートを求めている';
    }
  }

  private detectEmotion(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('困') || lowerMessage.includes('悩') || lowerMessage.includes('わからない')) {
      return '困惑・不安を感じている';
    } else if (lowerMessage.includes('楽しい') || lowerMessage.includes('わくわく') || lowerMessage.includes('期待')) {
      return '前向き・期待感を持っている';
    } else if (lowerMessage.includes('急') || lowerMessage.includes('早く') || lowerMessage.includes('すぐ')) {
      return '焦り・緊急性を感じている';
    } else {
      return '冷静・客観的な姿勢を保っている';
    }
  }

  private identifyConstraints(message: string): string[] {
    const constraints: string[] = [];
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('時間') || lowerMessage.includes('期限')) {
      constraints.push('時間的制約がある');
    }
    if (lowerMessage.includes('予算') || lowerMessage.includes('コスト') || lowerMessage.includes('お金')) {
      constraints.push('予算的制約がある');
    }
    if (lowerMessage.includes('経験') || lowerMessage.includes('初心者')) {
      constraints.push('経験・スキル面での制約がある');
    }
    if (lowerMessage.includes('リソース') || lowerMessage.includes('人手')) {
      constraints.push('リソース面での制約がある');
    }

    return constraints;
  }

  /**
   * Knowledge Steps: 3段階の知識統合プロセス
   */
  private async processKnowledgeSteps(message: string, mode: ConversationMode): Promise<KnowledgeSteps> {
    // Step A: 既存知識での暫定考察
    const stepA = this.generateStepAResponse(message, mode);

    // Step B: Web検索による補正（必要時のみ）
    let stepB: string | undefined;
    if (this.webSearchService.shouldPerformSearch(message)) {
      const searchResponse = await this.webSearchService.search(message);
      stepB = this.webSearchService.summarizeResults(searchResponse);
    }

    // Step C: 統合された最終提案
    const stepC = this.generateStepCResponse(message, mode, stepA, stepB);

    return { stepA, stepB, stepC };
  }

  private generateStepAResponse(message: string, mode: ConversationMode): string {
    const modeConfig = MODE_PROMPTS[mode];
    
    // モードに応じた基本的なレスポンス生成
    switch (mode) {
      case 'guide':
        return `ご相談の件について、まず基本的な考え方をお伝えします。
        
${message}に関しては、一般的に以下の要素を考慮することが重要です：
1. 目標の明確化（何を達成したいか）
2. 現状分析（現在の状況や課題）
3. リソース確認（利用可能な時間・予算・人材）
4. 実行計画（具体的なステップと期限）

これらの要素を整理することで、より効果的なアプローチが見えてくると考えられます。`;

      case 'socrates':
        return `ご質問をいただいた件について、まず一緒に考えてみましょう。

${message}について、以下の点を考えてみていただけますか？

1. この課題に取り組む真の目的は何でしょうか？
2. これまでにどのような取り組みをされてきましたか？
3. 理想的な結果が得られたとして、それはどのような状態でしょうか？

これらの質問への答えを整理することで、より深い洞察が得られるはずです。`;

      case 'hard':
        return `${message}について、厳しい質問をさせていただきます。

・これは本当に解決すべき課題ですか？優先順位は正しいですか？
・お客様は本当にお金を払ってでもこの解決を求めているでしょうか？
・競合他社ではなく、あなたが取り組む必然性は何ですか？
・リソースを投入するだけの明確なROIは見込めますか？

厳しい質問ですが、これらに明確に答えられなければ、成功は困難かもしれません。`;

      default:
        return '申し訳ありません。適切な応答を生成できませんでした。';
    }
  }

  private generateStepCResponse(message: string, mode: ConversationMode, stepA: string, stepB?: string): string {
    let finalResponse = stepA;

    if (stepB) {
      finalResponse += `\n\n最新情報を踏まえた補正：\n${stepB}`;
    }

    // モードに応じた最終的なアドバイス
    switch (mode) {
      case 'guide':
        finalResponse += `\n\n【最終提案】
次のステップとして以下をお勧めします：
1. 目標と現状の明確化
2. 具体的な行動計画の策定
3. 小さな実験から始める
4. 定期的な振り返りと改善

安心してください。一歩ずつ確実に進めていけば、必ず良い結果が得られます。`;
        break;

      case 'socrates':
        finalResponse += `\n\n【導き】
これらの要素を踏まえて、次に考えるべき重要な質問は：
「この課題解決によって、最も恩恵を受けるのは誰で、その人にとってどのような価値を生み出すのか？」

この質問への答えが明確になれば、進むべき方向性が見えてくるはずです。`;
        break;

      case 'hard':
        finalResponse += `\n\n【現実直視】
甘い考えは捨てて、現実を見つめましょう：
・市場は本当にこれを求めているのか？
・あなたに実行力はあるのか？
・失敗したときのリスクは許容できるのか？

これらに「Yes」と断言できないなら、計画を見直すべきです。成功は甘いものではありません。`;
        break;
    }

    return finalResponse;
  }

  /**
   * Next Actions: フィードバック選択肢を生成
   */
  private generateNextActions(mode: ConversationMode): NextAction[] {
    const baseActions: NextAction[] = [
      {
        id: 'deep_dive',
        label: '深掘り',
        description: 'この方向性をさらに詳しく探る'
      },
      {
        id: 'mode_change',
        label: 'モード変更',
        description: '他のモードで再検討する'
      },
      {
        id: 'new_topic',
        label: '新しいトピック',
        description: '別の話題について相談する'
      }
    ];

    // モード固有のアクション
    switch (mode) {
      case 'guide':
        baseActions.unshift({
          id: 'practical_steps',
          label: '具体的ステップ',
          description: 'より具体的な実行計画を作成する'
        });
        break;

      case 'socrates':
        baseActions.unshift({
          id: 'more_questions',
          label: 'さらに質問',
          description: 'より深い質問で思考を促進する'
        });
        break;

      case 'hard':
        baseActions.unshift({
          id: 'reality_check',
          label: '現実チェック',
          description: 'さらに厳しい現実分析を行う'
        });
        break;
    }

    return baseActions;
  }

  /**
   * フィードバックリクエストを生成
   */
  private generateFeedbackRequest(mode: ConversationMode): string {
    switch (mode) {
      case 'guide':
        return 'この方向で深掘りしますか？それとも別のアプローチをお考えでしょうか？';
      case 'socrates':
        return 'これらの質問について考えていただけましたか？さらに深く探求しますか？';
      case 'hard':
        return '厳しい指摘ですが、どう受け止められますか？現実的な対策を考えますか？';
      default:
        return '次のアクションを選んでください。';
    }
  }

  /**
   * エラー時のフォールバック応答
   */
  private generateErrorResponse(mode: ConversationMode): AIResponse {
    return {
      id: uuidv4(),
      activeListening: {
        intent: '技術的な問題が発生しました',
        emotion: 'システムエラー',
        constraints: ['一時的なサービス障害']
      },
      knowledgeSteps: {
        stepA: '申し訳ありません。一時的な技術的問題が発生しました。',
        stepC: 'しばらく時間をおいて再度お試しいただくか、別の表現で質問し直してください。'
      },
      feedbackRequest: '再度お試しいただけますでしょうか？',
      nextActions: [
        {
          id: 'retry',
          label: '再試行',
          description: '同じ質問を再度送信する'
        },
        {
          id: 'new_question',
          label: '別の質問',
          description: '異なる表現で質問し直す'
        }
      ],
      mode,
      timestamp: new Date()
    };
  }
}