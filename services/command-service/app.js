const express = require('express');
const mongoose = require('mongoose');
const commandRoutes = require('./src/routes/command.routes');
const config = require('./config');
const app = express();
const PORT = process.env.PORT || 3005;

// JSON 파싱 및 기본 설정
app.use(express.json());

// 명령 핸들러 라우트 설정
app.use('/commands', commandRoutes);

mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for Command Service'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// 서버 실행
app.listen(PORT, () => {
    console.log(`Command Service is running on port ${PORT}`);
});
