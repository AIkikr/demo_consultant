# InsightSmith - デプロイメントガイド

## 🎯 本番環境へのデプロイ手順

### 前提条件
- Node.js 20.19.4以上
- PM2またはDockerのサポート
- HTTPS対応のWebサーバー（Nginx推奨）
- ドメインとSSL証明書

### 1. 環境設定

#### バックエンド環境変数
```bash
# backend/.env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com
OPENAI_API_KEY=your_actual_openai_api_key
```

#### フロントエンド環境変数
```bash
# frontend/.env.production
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### 2. ビルドとデプロイ

#### フロントエンド
```bash
cd frontend
npm ci --only=production
npm run build
npm start
```

#### バックエンド
```bash
cd backend  
npm ci --only=production
npm run build
npm start
```

### 3. Docker構成（推奨）

#### Dockerfile (Frontend)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Dockerfile (Backend)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### 4. Nginx設定例

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # フロントエンド
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. モニタリング設定

#### PM2 Ecosystem（本番用）
```javascript
module.exports = {
  apps: [
    {
      name: 'insightsmith-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 2,
      exec_mode: 'cluster'
    },
    {
      name: 'insightsmith-backend', 
      cwd: './backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 2,
      exec_mode: 'cluster'
    }
  ]
}
```

### 6. セキュリティ考慮事項

- HTTPS必須
- CORS設定の厳格化
- Rate limiting実装
- セッション暗号化
- APIキーの適切な管理

### 7. パフォーマンス最適化

- CDNの利用
- 画像・アセットの最適化
- Database接続プール
- レスポンスキャッシング
- Gzip圧縮有効化

## 🔧 トラブルシューティング

### よくある問題と解決方法

1. **CORS エラー**
   - FRONTEND_URLが正しく設定されているか確認
   
2. **API接続エラー**  
   - NEXT_PUBLIC_API_URLが正しいか確認
   
3. **セッション切断**
   - メモリ制限やプロセス再起動を確認
   
4. **パフォーマンス低下**
   - PM2ログでメモリリークを確認
   - データベース接続数を監視