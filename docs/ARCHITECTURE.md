# InsightSmith - アーキテクチャ設計書

## システム概要

InsightSmithは、ユーザーのアイデア創出から実行計画まで伴走するAIコンサルタントボットです。3つの対話モード（ガイド・ソクラテス・ハード）を切り替えながら、高度なコンサルティング体験を提供します。

## アーキテクチャ構成

### 高レベルアーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  External APIs  │
│   (Next.js)     │◄──►│  (Node.js)      │◄──►│  (WebSearch)    │
│                 │    │                 │    │                 │
│ - Chat UI       │    │ - Mode Logic    │    │ - Search API    │
│ - Mode Display  │    │ - Response Flow │    │ - Knowledge DB  │
│ - History Mgmt  │    │ - Session Mgmt  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技術スタック

#### フロントエンド
- **Framework**: Next.js 15.4.6 (App Router)
- **UI Library**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **HTTP Client**: Fetch API

#### バックエンド
- **Runtime**: Node.js 20.19.4
- **Framework**: Express.js
- **Language**: TypeScript
- **Session**: In-memory storage
- **Process Manager**: PM2

## コンポーネント設計

### フロントエンド

#### 1. ChatInterface
- メインのチャットインターフェース
- ユーザー入力とAI応答の表示
- リアルタイムコミュニケーション

#### 2. ModeIndicator  
- 現在のモード表示
- モード切り替え状態の可視化

#### 3. AIResponseDisplay
- AI応答の構造化表示
- Active Listening、Knowledge Steps、Next Actions
- インタラクティブなアクション選択

### バックエンド

#### 1. ChatController
- HTTP APIエンドポイントの処理
- リクエスト・レスポンス管理
- エラーハンドリング

#### 2. AIService
- AI応答生成のコアロジック
- 3段階知識統合プロセス
- モード固有の応答生成

#### 3. SessionService
- セッション管理
- 会話履歴保持
- メモリクリーンアップ

#### 4. WebSearchService
- 外部検索機能統合
- 検索結果の要約
- 検索必要性の判定

## データフロー

### 1. ユーザー入力処理
```
User Input → Mode Detection → Session Update → AI Processing → Response Generation
```

### 2. AI応答生成プロセス
```
Active Listening → Step-A (Existing Knowledge) → Step-B (Web Search) → Step-C (Integration) → Feedback
```

### 3. アクション処理
```
User Action Selection → Action Handler → New Response Generation → UI Update
```

## モード設計

### 1. ガイドモード (Guide Mode)
- **特徴**: 優しく丁寧なサポート
- **応答スタイル**: 具体例→原則→次のステップ
- **UI**: 青系カラー、Heart アイコン

### 2. ソクラテスモード (Socrates Mode)  
- **特徴**: 質問主導の思考促進
- **応答スタイル**: オープンクエスチョン中心
- **UI**: 紫系カラー、Brain アイコン

### 3. ハードモード (Hard Mode)
- **特徴**: 厳しい現実分析
- **応答スタイル**: 収益性・競合・課題の厳格評価
- **UI**: 赤系カラー、Zap アイコン

## セキュリティ設計

### CORS設定
- オリジン制限: フロントエンドドメインのみ許可
- 認証情報: credentials許可設定

### 入力検証
- JSONスキーマ検証
- SQLインジェクション対策
- XSS対策

### セッション管理
- メモリベース（1時間TTL）
- 自動クリーンアップ
- セッション統計監視

## 性能設計

### レスポンス最適化
- AI応答キャッシング（将来実装）
- 検索結果の効率的処理
- セッション管理の軽量化

### メモリ管理
- 定期的な古いセッションクリーンアップ
- プロセス監視とヘルスチェック

## 監視・運用

### ヘルスチェック
- `/health` エンドポイント
- セッション統計情報
- システム状態監視

### ログ管理
- PM2による集中ログ管理
- 構造化ログ出力
- エラー追跡

## 将来拡張性

### 1. データ永続化
- データベース統合（MongoDB/PostgreSQL）
- ユーザー認証システム
- 会話履歴の長期保存

### 2. AI機能強化
- OpenAI API統合
- カスタマイズされたプロンプト
- 学習機能追加

### 3. 多言語対応
- i18n対応
- 多言語モード検出
- 地域特化コンサルティング

### 4. リアルタイム機能
- WebSocket統合
- リアルタイム通知
- コラボレーション機能

## デプロイメント

### 開発環境
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Process Manager: PM2

### 本番環境推奨構成
- Container: Docker
- Orchestration: Kubernetes
- Load Balancer: Nginx
- Database: MongoDB Atlas
- Monitoring: Prometheus + Grafana