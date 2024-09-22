require('dotenv').config();

module.exports = {
  PORT: 3002 || process.env.PORT,
  MONGODB_URI: 'mongodb://localhost:27017/speakquest'|| process.env.MONGODB_URI,
  REDIS_URL: 'redis://localhost:6379'||'redis://redis:6379'|| process.env.REDIS_URL,
  JWT_SECRET: 'your_jwt_secret'||process.env.JWT_SECRET,
  QUEST_CATALOG_SERVICE_URL: 'http://localhost:3001'||process.env.QUEST_CATALOG_SERVICE_URL,
  REWARD_CATALOG_SERVICE_URL: 'http://localhost:3001'||process.env.QUEST_CATALOG_SERVICE_URL,
  AUTH_SERVICE_URL:'http://localhost:3000' ||process.env.AUTH_SERVICE_URL,
};