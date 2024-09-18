require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3000',
  QUEST_CATALOG_SERVICE_URL: process.env.QUEST_CATALOG_SERVICE_URL || 'http://localhost:3001',
  QUEST_PROCESSING_SERVICE_URL: process.env.QUEST_PROCESSING_SERVICE_URL || 'http://localhost:3002'
};