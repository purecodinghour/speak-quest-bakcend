const axios = require('axios');
const config = require('../config');

const rewardCatalogApi = axios.create({
  baseURL: config.REWARD_CATALOG_SERVICE_URL,
  timeout: 5000
});

module.exports = {
  async getReward(rewardId) {
    try {
      const response = await rewardCatalogApi.get(`/rewards/${rewardId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reward from catalog service:', error.response?.data || error.message);
      throw error;
    }
  }
};