const Queue = require('bull');
const config = require('../config');

const questStartQueue = new Queue('quest-start', config.REDIS_URL);

questStartQueue.process(async (job) => {
  const { user_id, quest_id } = job.data;
  // 퀘스트 시작 로직 구현
});

module.exports = questStartQueue;