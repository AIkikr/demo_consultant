import { ConversationMode, ModeDetectionResult } from '../types';
import { MODE_DETECTION_PHRASES } from './constants';

export class ModeDetector {
  /**
   * ユーザーメッセージからモードを検出
   */
  static detectMode(message: string): ModeDetectionResult {
    const lowerMessage = message.toLowerCase();
    let maxConfidence = 0;
    let detectedMode: ConversationMode = 'guide';
    let triggerPhrase: string | undefined;

    // 各モードのフレーズをチェック
    for (const [mode, phrases] of Object.entries(MODE_DETECTION_PHRASES)) {
      for (const phrase of phrases) {
        if (lowerMessage.includes(phrase.toLowerCase())) {
          const confidence = this.calculateConfidence(phrase, lowerMessage);
          if (confidence > maxConfidence) {
            maxConfidence = confidence;
            detectedMode = mode as ConversationMode;
            triggerPhrase = phrase;
          }
        }
      }
    }

    // フレーズが見つからない場合はデフォルト（guide）
    if (maxConfidence === 0) {
      maxConfidence = 1.0; // デフォルトは100%の信頼度
    }

    return {
      detectedMode,
      confidence: maxConfidence,
      triggerPhrase
    };
  }

  /**
   * フレーズマッチの信頼度を計算
   */
  private static calculateConfidence(phrase: string, message: string): number {
    // 基本信頼度
    let confidence = 0.8;

    // メッセージの冒頭にあるほど信頼度が高い
    const phraseIndex = message.indexOf(phrase.toLowerCase());
    if (phraseIndex === 0) {
      confidence += 0.2; // 冒頭にある場合は+20%
    } else if (phraseIndex <= 10) {
      confidence += 0.1; // 前半にある場合は+10%
    }

    // フレーズの長さが長いほど信頼度が高い
    if (phrase.length > 5) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0); // 最大100%
  }

  /**
   * モード変更リクエストかどうかを判定
   */
  static isModeSwitchRequest(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const switchPhrases = [
      'モード変更',
      'モードを変更',
      'モードを切り替え',
      'モード切替',
      '切り替えて',
      '変更して'
    ];

    return switchPhrases.some(phrase => 
      lowerMessage.includes(phrase.toLowerCase())
    );
  }

  /**
   * ヘルプリクエストかどうかを判定
   */
  static isHelpRequest(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const helpPhrases = [
      '助けて',
      'help',
      'ヘルプ',
      'サポート',
      '困っている',
      'わからない'
    ];

    return helpPhrases.some(phrase => 
      lowerMessage.includes(phrase.toLowerCase())
    );
  }
}