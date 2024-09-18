// quest-catalog-service/src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const questRoutes = require('./routes/quest.routes');
const rewardRoutes = require('./routes/reward.routes');

const app = express();

const corsOptions = {
  origin: ['http://localhost:3004', 'http://localhost:4000'], // React 프론트엔드 주소
  credentials: true,              // 자격 증명 허용
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use('/quests', questRoutes);
app.use('/rewards', rewardRoutes);

app.listen(config.PORT, () => {
  console.log(`Quest Catalog Service is running on port ${config.PORT}`);
});

/*const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const questRoutes = require('./routes/quest.routes');
const rewardRoutes = require('./routes/reward.routes');

const app = express();

app.use(cors({
  origin: 'http://localhost:3004', // React 프론트엔드 주소
  credentials: true,              // 자격 증명 허용
}));

app.use(express.json());

mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use('/quests', questRoutes);
app.use('/rewards', rewardRoutes);

app.listen(config.PORT, () => {
  console.log(`Quest Catalog Service is running on port ${config.PORT}`);
});*/