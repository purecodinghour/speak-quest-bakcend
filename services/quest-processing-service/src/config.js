require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3002,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/speakquest',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  QUEST_CATALOG_SERVICE_URL: process.env.QUEST_CATALOG_SERVICE_URL || 'http://localhost:3001',
  REWARD_CATALOG_SERVICE_URL: process.env.QUEST_CATALOG_SERVICE_URL || 'http://localhost:3001',
};