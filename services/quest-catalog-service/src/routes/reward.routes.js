const express = require('express');
const router = express.Router();
const Reward = require('../models/reward.model');

// 리워드 생성
router.post('/', async (req, res) => {
  try {
    const reward = new Reward(req.body);
    await reward.save();
    res.status(201).json(reward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 모든 리워드 조회
router.get('/', async (req, res) => {
  try {
    const rewards = await Reward.find();
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:rewardId', async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.rewardId);
    if (!reward) {
      return res.status(404).json({ message: 'reward not found' });
    }
    res.json(reward);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reward', error: error.toString() });
  }
});


module.exports = router;