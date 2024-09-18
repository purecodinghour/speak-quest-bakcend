const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config');

// Auth Service 프록시 설정
const authProxy = createProxyMiddleware({
  target: 'http://localhost:3000', // Auth 서비스의 주소
  changeOrigin: true,
  pathRewrite: (path, req) => {
    if (path.startsWith('/auth')) {
      return path.replace('/auth', '/auth');
    } else if (path.startsWith('/users')) {
      return path.replace('/users', '/users');
    }
    return path;
  }
});

// 퀘스트 카탈로그 서비스 프록시 설정
const questCatalogProxy = createProxyMiddleware({
  target: 'http://localhost:3001', // 퀘스트 카탈로그 서비스의 주소
  changeOrigin: true,
  pathRewrite: (path, req) => {
    if (path.startsWith('/quests')) {
      return path.replace('/quests', '/quests');
    } else if (path.startsWith('/rewards')) {
      return path.replace('/rewards', '/rewards');
    }
    return path;
  }
});

// 퀘스트 처리 서비스 프록시 설정
const questProcessingProxy = createProxyMiddleware({
  target: 'http://localhost:3002', // 퀘스트 처리 서비스의 주소
  changeOrigin: true,
  pathRewrite: {
    '^/user-quests': '/user-quests'
  }
});

const commandServiceProxy = createProxyMiddleware({
  target: 'http://localhost:3005', // Command Service 주소
  pathRewrite: { '^/commands': '' }, // 경로를 올바르게 리라이트 해야 함
  changeOrigin: true,
});

// Query Service 프록시 설정
const queryServiceProxy = createProxyMiddleware({
  target: 'http://localhost:3003', // Query Service 주소
  changeOrigin: true,
  pathRewrite: {
    '^/queries': '' // '/queries' 경로를 Query Service의 루트로 리라이트
  }
});

// HTTP 서버 설정
const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  if (req.url.startsWith('/auth') || req.url.startsWith('/users')) {
    authProxy(req, res);
  } else if (req.url.startsWith('/quests') || req.url.startsWith('/rewards')) {
    questCatalogProxy(req, res);
  } else if (req.url.startsWith('/user-quests')) {
    questProcessingProxy(req, res);
  } else if (req.url.startsWith('/commands')) {
    commandServiceProxy(req, res); // /commands 경로에 대한 요청을 처리
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Welcome to SpeakQuest API Gateway');
  }
});

// 서버 시작 및 에러 처리
const PORT = process.env.PORT || 4001;

server.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});
