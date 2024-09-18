const axios = require('axios');
const config = require('../config');

const userApi = axios.create({
  baseURL: config.AUTH_SERVICE_URL,
  timeout: 5000
});

module.exports = {
  async getUser(userId) {
    try {
      const response = await userApi.get(`/auth/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user from catalog service:', error.response?.data || error.message);
      throw error;
    }
  }
};