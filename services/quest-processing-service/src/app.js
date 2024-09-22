const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const userQuestRoutes = require('./routes/user-quest.routes');
mongoose.set('debug', true);
const app = express();

const corsOptions = {
  origin: ['http://localhost:3004','http://localhost:3000','http://localhost:3001', 'http://localhost:3002', 'http://localhost:4000'], // React 앱의 주소
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));
mongoose.set('debug', true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// 경로가 '/user-quests'로 설정되었는지 확인
app.use('/user-quests', userQuestRoutes);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.listen(config.PORT, () => {
  console.log(`Quest Processing Service is running on port ${config.PORT}`);
});
