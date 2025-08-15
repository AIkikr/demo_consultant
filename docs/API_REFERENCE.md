# InsightSmith API リファレンス

## ベースURL
- 開発環境: `http://localhost:3001`
- 本番環境: `https://your-domain.com`

## エンドポイント一覧

### 1. ヘルスチェック

#### GET `/health`

システムの健全性をチェックします。

**レスポンス:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-15T05:24:02.816Z",
  "stats": {
    "totalSessions": 0,
    "activeSessions": 0,
    "totalMessages": 0,
    "timestamp": "2025-08-15T05:24:02.816Z"
  }
}
```

### 2. チャット API

#### POST `/api/chat`

AIとのチャット対話を行います。

**リクエストボディ:**
```json
{
  "message": "string",           // 必須（actionの場合は空文字可）
  "sessionId": "string",         // オプション（新規セッションの場合）
  "forceMode": "guide|socrates|hard",  // オプション（強制モード指定）
  "selectedAction": "string"     // オプション（アクション選択時）
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "activeListening": {
      "intent": "ユーザーの意図",
      "emotion": "感情状態",
      "constraints": ["制約1", "制約2"]
    },
    "knowledgeSteps": {
      "stepA": "既存知識での考察",
      "stepB": "Web検索結果（オプション）",
      "stepC": "統合された最終提案"
    },
    "feedbackRequest": "フィードバック請求メッセージ",
    "nextActions": [
      {
        "id": "action_id",
        "label": "アクション名",
        "description": "アクションの説明"
      }
    ],
    "mode": "guide|socrates|hard",
    "timestamp": "2025-08-15T05:24:07.268Z"
  },
  "sessionId": "session-uuid"
}
```

**エラーレスポンス:**
```json
{
  "success": false,
  "error": "エラーメッセージ",
  "sessionId": "session-uuid"
}
```

## 対話モード

### 1. ガイドモード (guide)
**トリガーフレーズ:**
- "ガイドモードで"
- "優しく相談に乗って"
- "やさしく"
- "丁寧に"

**特徴:**
- 優しく丁寧なサポート
- 具体例→原則→次のステップの順で説明
- 安心感を与える表現

### 2. ソクラテスモード (socrates)
**トリガーフレーズ:**
- "ソクラテス式で"
- "質問で導いて"
- "問いかけて"
- "考えさせて"

**特徴:**
- 質問主導の思考促進
- 最大3問のオープンクエスチョン
- 直接的な答えは避ける

### 3. ハードモード (hard)
**トリガーフレーズ:**
- "ハードモードで"
- "辛口レビュー希望"
- "厳しく"
- "容赦なく"

**特徴:**
- 収益性・競合優位・顧客課題適合を厳格評価
- 挑発的だが建設的なフィードバック
- 現実的な観点での分析

## Next Actions

### 共通アクション
- `deep_dive`: この方向性をさらに詳しく探る
- `mode_change`: 他のモードで再検討する
- `new_topic`: 別の話題について相談する

### モード固有アクション

#### ガイドモード
- `practical_steps`: より具体的な実行計画を作成する

#### ソクラテスモード  
- `more_questions`: より深い質問で思考を促進する

#### ハードモード
- `reality_check`: さらに厳しい現実分析を行う

### システムアクション
- `retry`: 再試行する

## エラーハンドリング

### HTTPステータスコード
- `200`: 成功
- `400`: バッドリクエスト（必須パラメータ不足など）
- `404`: エンドポイントが見つからない
- `500`: サーバー内部エラー

### エラー例

#### バッドリクエスト (400)
```json
{
  "success": false,
  "error": "Message or selectedAction is required",
  "sessionId": ""
}
```

#### サーバーエラー (500)
```json
{
  "success": false,
  "error": "Internal server error",
  "sessionId": "session-uuid"
}
```

## 使用例

### 1. 新規チャット開始
```bash
curl -X POST "http://localhost:3001/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "ガイドモードで 新しいビジネスアイデアについて相談したいです"
  }'
```

### 2. 継続チャット
```bash
curl -X POST "http://localhost:3001/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "具体的にはECサイトを考えています",
    "sessionId": "existing-session-id"
  }'
```

### 3. アクション選択
```bash
curl -X POST "http://localhost:3001/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "",
    "sessionId": "existing-session-id",
    "selectedAction": "deep_dive"
  }'
```

### 4. 強制モード変更
```bash
curl -X POST "http://localhost:3001/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "同じ内容をハードモードで分析して",
    "sessionId": "existing-session-id",
    "forceMode": "hard"
  }'
```

## セッション管理

- セッションは自動生成される
- メモリベースの一時保存（1時間TTL）
- 5分ごとに自動クリーンアップ実行
- 同時セッション数に制限なし

## レート制限

現在のバージョンでは特にレート制限は設けていませんが、本番環境では以下を推奨：
- IP当たり: 100 req/min
- セッション当たり: 20 req/min

## CORS設定

- Origin: フロントエンドドメインからのリクエストのみ許可
- Methods: GET, POST
- Headers: Content-Type, Authorization
- Credentials: 許可