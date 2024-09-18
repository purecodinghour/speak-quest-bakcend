const Redis = require('ioredis');
const config = require('../config');

const redis = new Redis(config.REDIS_URL);

module.exports = {
  async get(key) {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },
  set(key, value, ttl = 3600) {
    return redis.set(key, JSON.stringify(value), 'EX', ttl);
  }
};