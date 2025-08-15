module.exports = {
  apps: [
    {
      name: 'insightsmith-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:3001'
      }
    },
    {
      name: 'insightsmith-backend',
      cwd: './backend',
      script: 'npx',
      args: 'ts-node src/index.ts',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        FRONTEND_URL: 'http://localhost:3000'
      }
    }
  ]
};