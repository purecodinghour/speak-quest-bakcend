// auth-service/src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes'); // 사용자 라우트 추가

const app = express();

// CORS 설정
const corsOptions = {
  origin: ['http://localhost:3004', 'http://localhost:4000'], // React 앱과 API Gateway의 주소
  credentials: true,
};

// CORS 미들웨어 및 OPTIONS 요청 처리
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SpeakQuest auth service' });
});

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});
