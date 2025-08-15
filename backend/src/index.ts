import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ChatController } from './controllers/chatController';
import { SessionService } from './services/sessionService';

// 環境変数を読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア設定
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ログミドルウェア
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// コントローラーのインスタンス作成
const chatController = new ChatController();

// ルート設定
app.get('/health', chatController.healthCheck.bind(chatController));
app.post('/api/chat', chatController.handleChat.bind(chatController));

// 基本的なルート
app.get('/', (req, res) => {
  res.json({
    message: 'InsightSmith API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// エラーハンドラー
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 定期的なセッションクリーンアップ（5分ごと）
const sessionService = SessionService.getInstance();
setInterval(() => {
  sessionService.cleanupOldSessions();
}, 5 * 60 * 1000);

// サーバー開始
const server = app.listen(PORT, () => {
  console.log(`\n🚀 InsightSmith API Server is running!`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🔧 Health Check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

export default app;