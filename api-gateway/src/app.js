// api-gateway/src/app.js
const url = require('url');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config');

// 환경 변수에서 서비스 URL 가져오기
//const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000';
//const QUEST_CATALOG_SERVICE_URL = process.env.QUEST_CATALOG_SERVICE_URL || 'http://localhost:3001';
//const QUEST_PROCESSING_SERVICE_URL = process.env.QUEST_PROCESSING_SERVICE_URL || 'http://localhost:3002';
//const COMMAND_SERVICE_URL = process.env.COMMAND_SERVICE_URL || 'http://localhost:3005';
//const QUERY_SERVICE_URL = process.env.QUERY_SERVICE_URL || 'http://localhost:3003';

const AUTH_SERVICE_URL =  'http://localhost:3000' || process.env.AUTH_SERVICE_URL;
const QUEST_CATALOG_SERVICE_URL = 'http://localhost:3001'|| process.env.QUEST_CATALOG_SERVICE_URL;
const QUEST_PROCESSING_SERVICE_URL = 'http://localhost:3002' ||process.env.QUEST_PROCESSING_SERVICE_URL;
const COMMAND_SERVICE_URL ='http://localhost:3005'||process.env.COMMAND_SERVICE_URL;
const QUERY_SERVICE_URL ='http://localhost:3003'|| process.env.QUERY_SERVICE_URL ;

// Auth Service 프록시 설정
const authProxy = createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/auth',
    '^/users': '/users'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying request to Auth Service:', req.method, req.url);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Received response from Auth Service:', proxyRes.statusCode);
  }
});

// 퀘스트 카탈로그 서비스 프록시 설정
const questCatalogProxy = createProxyMiddleware({
  target: QUEST_CATALOG_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/quests': '/quests',
    '^/rewards': '/rewards'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying request to Quest Catalog Service:', req.method, req.url);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Received response from Quest Catalog Service:', proxyRes.statusCode);
  }
});

// 퀘스트 처리 서비스 프록시 설정
const questProcessingProxy = createProxyMiddleware({
  target: QUEST_PROCESSING_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/user-quests': '/user-quests',
    '^/active-quests': '/active-quests',
    '^/completed-quests': '/completed-quests',
    '^/rewarded-quests': '/rewarded-quests',
    '^/all-quests': '/all-quests'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying request to Quest Processing Service:', req.method, req.url);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Received response from Quest Processing Service:', proxyRes.statusCode);
  }
});

const commandServiceProxy = createProxyMiddleware({
  target: COMMAND_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/commands': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying request to Command Service:', req.method, req.url);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Received response from Command Service:', proxyRes.statusCode);
  }
});

const queryServiceProxy = createProxyMiddleware({
  target: QUERY_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/queries': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying request to Query Service:', req.method, req.url);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Received response from Query Service:', proxyRes.statusCode);
  }
});

// HTTP 서버 설정
const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  try {
    if (pathname.startsWith('/auth') || pathname.startsWith('/users')) {
      authProxy(req, res);
    } else if (pathname.startsWith('/quests') || pathname.startsWith('/rewards')) {
      questCatalogProxy(req, res);
    } else if (pathname.startsWith('/user-quests') || 
               pathname.startsWith('/active-quests') || 
               pathname.startsWith('/completed-quests') || 
               pathname.startsWith('/rewarded-quests') ||
               pathname.startsWith('/all-quests')) {
      questProcessingProxy(req, res);
    } else if (pathname.startsWith('/commands')) {
      commandServiceProxy(req, res);
    } else if (pathname.startsWith('/queries')) {
      queryServiceProxy(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

// 서버 시작 및 에러 처리
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});