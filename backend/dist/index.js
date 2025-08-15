"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const chatController_1 = require("./controllers/chatController");
const sessionService_1 = require("./services/sessionService");
// 環境変数を読み込み
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// ミドルウェア設定
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// ログミドルウェア
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// コントローラーのインスタンス作成
const chatController = new chatController_1.ChatController();
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
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});
// 定期的なセッションクリーンアップ（5分ごと）
const sessionService = sessionService_1.SessionService.getInstance();
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
exports.default = app;
