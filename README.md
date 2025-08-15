# InsightSmith - AI Consultant Bot 🧠💡

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.19.4-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

InsightSmithは、ユーザーのアイディア創出から実行計画まで伴走するAIコンサルタントボットです。Teaching/Coaching/Consulting/Active-Listeningを状況に応じて切り替える高EQ・高IQボットとして設計されています。

## 🌟 特徴

### 3つの対話モード
- **🫶 ガイドモード**: 優しく丁寧な説明とサポート
- **🧠 ソクラテスモード**: 質問主導でユーザーの思考を促進  
- **⚡ ハードモード**: 辛口レビューで厳しく課題を指摘

### 構造化された応答フロー
1. **🎯 Active Listening**: 意図・感情・制約の要約確認
2. **📚 Knowledge Step-Up**: 3段階の知識統合プロセス
   - Step-A: 既存知識での考察
   - Step-B: Web検索による最新情報補正
   - Step-C: 統合された最終提案
3. **🔄 フィードバック請求**: 次のアクション選択肢提示

## 🎯 デモ

**フロントエンド**: https://3000-ibycshhcj0jvdabv7ec9j-6532622b.e2b.dev  
**バックエンドAPI**: https://3001-ibycshhcj0jvdabv7ec9j-6532622b.e2b.dev

### 使い方の例
```
ガイドモードで 新しいECサイトのビジネスプランについて相談したいです
```
```
ソクラテス式で 自分の強みを活かしたキャリアプランを考えたいです
```
```
ハードモードで この事業アイデアの収益性を厳しく評価してください
```

## 🏗️ 技術スタック

### フロントエンド
- **Framework**: Next.js 15.4.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **HTTP Client**: Fetch API

### バックエンド
- **Runtime**: Node.js 20.19.4
- **Framework**: Express.js
- **Language**: TypeScript
- **Session Management**: In-memory storage
- **Process Manager**: PM2
- **Search Integration**: WebSearch API

## 📁 プロジェクト構成

```
insightsmith/
├── frontend/              # Next.js フロントエンド
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # Reactコンポーネント
│   │   └── lib/         # ユーティリティとAPI
│   └── package.json
├── backend/              # Node.js バックエンド
│   ├── src/
│   │   ├── controllers/ # HTTPコントローラー
│   │   ├── services/    # ビジネスロジック
│   │   ├── utils/       # ユーティリティ
│   │   └── types/       # TypeScript型定義
│   └── package.json
├── shared/              # 共通型定義（未使用）
├── docs/               # ドキュメント
│   ├── ARCHITECTURE.md # システム設計書
│   ├── API_REFERENCE.md # API仕様書
│   └── USER_GUIDE.md   # ユーザーガイド
├── ecosystem.config.js # PM2設定
└── README.md
```

## 🚀 クイックスタート

### 前提条件
- Node.js 20.19.4以上
- npm または yarn
- PM2（推奨）

### インストール・起動

#### 1. リポジトリクローン
```bash
git clone <repository-url>
cd insightsmith
```

#### 2. 依存関係インストール
```bash
# フロントエンド
cd frontend
npm install

# バックエンド  
cd ../backend
npm install
```

#### 3. 環境変数設定
```bash
# backend/.env
cp backend/.env.example backend/.env
# 必要に応じてAPIキーなどを設定
```

#### 4. PM2で起動（推奨）
```bash
# プロジェクトルートで実行
pm2 start ecosystem.config.js
```

#### 5. 個別起動（開発用）
```bash
# バックエンド（ターミナル1）
cd backend
npm run dev

# フロントエンド（ターミナル2）  
cd frontend
npm run dev
```

### アクセス
- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:3001
- **ヘルスチェック**: http://localhost:3001/health

## 📖 ドキュメント

- [アーキテクチャ設計書](docs/ARCHITECTURE.md) - システム設計と技術詳細
- [API リファレンス](docs/API_REFERENCE.md) - REST API仕様書
- [ユーザーガイド](docs/USER_GUIDE.md) - 使い方とTips

## 🧪 API テスト

### ヘルスチェック
```bash
curl http://localhost:3001/health
```

### チャットAPI
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "ガイドモードで テストメッセージです"}'
```

## 🔧 開発

### コード品質
```bash
# TypeScript型チェック
cd backend && npm run build
cd frontend && npm run build

# 開発サーバー起動
npm run dev
```

### PM2管理
```bash
# ステータス確認
pm2 status

# ログ表示
pm2 logs --nostream

# 再起動
pm2 restart all

# 停止
pm2 stop all

# 削除
pm2 delete all
```

## 🌐 デプロイメント

### 本番環境推奨構成
- **Container**: Docker
- **Orchestration**: Kubernetes  
- **Database**: MongoDB Atlas（将来実装）
- **Load Balancer**: Nginx
- **Monitoring**: Prometheus + Grafana

### 環境変数
```bash
# Production
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
OPENAI_API_KEY=your-api-key
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 🙋‍♂️ サポート

質問や問題がある場合は、以下の方法でお知らせください：
- GitHub Issues
- 開発チームへの直接連絡

---

**InsightSmith** - あなたの思考とアイデア実現を支援するAIパートナー 🚀