import { Request, Response } from 'express';
import { ChatRequest, ChatResponse, ConversationMode } from '../types';
import { AIService } from '../services/aiService';
import { SessionService } from '../services/sessionService';
import { ModeDetector } from '../utils/modeDetector';
import { v4 as uuidv4 } from 'uuid';

export class ChatController {
  private aiService: AIService;
  private sessionService: SessionService;

  constructor() {
    this.aiService = AIService.getInstance();
    this.sessionService = SessionService.getInstance();
  }

  /**
   * チャット API エンドポイント
   */
  async handleChat(req: Request, res: Response): Promise<void> {
    try {
      const requestData: ChatRequest = req.body;
      const { message, sessionId, forceMode, selectedAction } = requestData;

      console.log('Received chat request:', {
        message: message?.substring(0, 100) + '...',
        sessionId,
        forceMode,
        selectedAction
      });

      // バリデーション
      if (!message && !selectedAction) {
        res.status(400).json({
          success: false,
          error: 'Message or selectedAction is required',
          sessionId: sessionId || ''
        });
        return;
      }

      // セッション処理
      let session = sessionId ? this.sessionService.getSession(sessionId) : null;
      if (!session) {
        session = this.sessionService.createSession();
      }

      let responseSessionId = session.sessionId;
      let currentMode = session.currentMode;

      // アクション処理
      if (selectedAction) {
        const actionResponse = await this.handleActionSelection(
          selectedAction,
          session.sessionId,
          currentMode
        );
        
        const response: ChatResponse = {
          success: true,
          data: actionResponse,
          sessionId: responseSessionId
        };

        res.json(response);
        return;
      }

      // メッセージ処理
      if (message) {
        // モード検出
        if (forceMode) {
          currentMode = forceMode;
        } else {
          // ヘルプリクエストの場合はガイドモードに切り替え
          if (ModeDetector.isHelpRequest(message)) {
            currentMode = 'guide';
          } else {
            // モード検出を実行
            const modeDetection = ModeDetector.detectMode(message);
            if (modeDetection.confidence > 0.8) {
              currentMode = modeDetection.detectedMode;
            }
          }
        }

        // モードが変更された場合はセッションを更新
        if (currentMode !== session.currentMode) {
          this.sessionService.updateMode(session.sessionId, currentMode);
        }

        // ユーザーメッセージをセッションに追加
        this.sessionService.addMessage(session.sessionId, {
          role: 'user',
          content: message
        });

        // AI応答を生成
        const messageHistory = this.sessionService.getMessageHistory(session.sessionId)
          .map(msg => msg.content);

        const aiResponse = await this.aiService.generateResponse(
          message,
          currentMode,
          session.sessionId,
          messageHistory
        );

        // AI応答をセッションに追加
        this.sessionService.addMessage(session.sessionId, {
          role: 'assistant',
          content: JSON.stringify(aiResponse)
        });

        const response: ChatResponse = {
          success: true,
          data: aiResponse,
          sessionId: responseSessionId
        };

        res.json(response);
        return;
      }

      // ここに到達することは通常ない
      res.status(400).json({
        success: false,
        error: 'Invalid request',
        sessionId: responseSessionId
      });

    } catch (error) {
      console.error('Chat controller error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        sessionId: req.body.sessionId || ''
      });
    }
  }

  /**
   * アクション選択を処理
   */
  private async handleActionSelection(
    actionId: string,
    sessionId: string,
    currentMode: ConversationMode
  ) {
    console.log(`Handling action: ${actionId} for session: ${sessionId}`);

    switch (actionId) {
      case 'deep_dive':
        return this.handleDeepDive(sessionId, currentMode);
      
      case 'mode_change':
        return this.handleModeChange(sessionId, currentMode);
      
      case 'new_topic':
        return this.handleNewTopic(sessionId, currentMode);
      
      case 'practical_steps':
        return this.handlePracticalSteps(sessionId, currentMode);
      
      case 'more_questions':
        return this.handleMoreQuestions(sessionId, currentMode);
      
      case 'reality_check':
        return this.handleRealityCheck(sessionId, currentMode);
      
      case 'retry':
        return this.handleRetry(sessionId, currentMode);
      
      default:
        return this.generateGenericActionResponse(actionId, currentMode);
    }
  }

  private async handleDeepDive(sessionId: string, mode: ConversationMode) {
    return this.aiService.generateResponse(
      'この話題についてさらに詳しく教えてください',
      mode,
      sessionId
    );
  }

  private async handleModeChange(sessionId: string, currentMode: ConversationMode) {
    // 次のモードを決定
    const modes: ConversationMode[] = ['guide', 'socrates', 'hard'];
    const currentIndex = modes.indexOf(currentMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    
    // モードを更新
    this.sessionService.updateMode(sessionId, nextMode);
    
    return this.aiService.generateResponse(
      '違うアプローチで同じ話題を見直してください',
      nextMode,
      sessionId
    );
  }

  private async handleNewTopic(sessionId: string, mode: ConversationMode) {
    // セッションをクリア（新しいトピック用）
    this.sessionService.clearSession(sessionId);
    
    return this.aiService.generateResponse(
      '新しいトピックについて相談したいと思います',
      mode,
      sessionId
    );
  }

  private async handlePracticalSteps(sessionId: string, mode: ConversationMode) {
    return this.aiService.generateResponse(
      '具体的なステップと実行計画を提示してください',
      mode,
      sessionId
    );
  }

  private async handleMoreQuestions(sessionId: string, mode: ConversationMode) {
    return this.aiService.generateResponse(
      'さらに深く考えるための質問をしてください',
      mode,
      sessionId
    );
  }

  private async handleRealityCheck(sessionId: string, mode: ConversationMode) {
    return this.aiService.generateResponse(
      'より厳しい現実的な観点から分析してください',
      mode,
      sessionId
    );
  }

  private async handleRetry(sessionId: string, mode: ConversationMode) {
    const history = this.sessionService.getMessageHistory(sessionId);
    const lastUserMessage = [...history].reverse().find(msg => msg.role === 'user');
    
    if (lastUserMessage) {
      return this.aiService.generateResponse(
        lastUserMessage.content,
        mode,
        sessionId
      );
    } else {
      return this.generateGenericActionResponse('retry', mode);
    }
  }

  private async generateGenericActionResponse(actionId: string, mode: ConversationMode) {
    return this.aiService.generateResponse(
      `ユーザーが「${actionId}」アクションを選択しました`,
      mode,
      uuidv4()
    );
  }

  /**
   * ヘルスチェック
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const stats = this.sessionService.getSessionStats();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        stats
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        status: 'unhealthy',
        error: 'Service error'
      });
    }
  }
}