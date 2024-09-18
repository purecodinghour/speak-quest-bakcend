const express = require('express');
const mongoose = require('mongoose');
const queryRoutes = require('./src/routes/query.routes');

const app = express();
const PORT = process.env.PORT || 3003;

// JSON 파싱 및 기본 설정
app.use(express.json());

// 쿼리 핸들러 라우트 설정
app.use('/queries', queryRoutes);

// MongoDB 연결
mongoose.connect('mongodb://localhost:27017/query-service', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB for Query Service');
}).catch((err) => {
    console.error('Could not connect to MongoDB', err);
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`Query Service is running on port ${PORT}`);
});
