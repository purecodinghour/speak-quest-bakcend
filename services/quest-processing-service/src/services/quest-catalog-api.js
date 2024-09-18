const axios = require('axios');
const config = require('../config');

const questCatalogApi = axios.create({
  baseURL: config.QUEST_CATALOG_SERVICE_URL,
  timeout: 5000
});

module.exports = {
  async getQuest(questId) {
    try {
      const response = await questCatalogApi.get(`/quests/${questId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quest from catalog service:', error.response?.data || error.message);
      throw error;
    }
  }
};