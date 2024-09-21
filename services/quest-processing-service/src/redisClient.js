const Redis = require('ioredis');
const config = require('./config');

const redis = new Redis(config.REDIS_URL);

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Connected to Redis'));

module.exports = redis;