const express = require('express');
const router = express.Router();
const Quest = require('../models/quest.model');
const Reward = require('../models/reward.model');

// 퀘스트 생성
router.post('/', async (req, res) => {
    try {
      const { reward_id, ...questData } = req.body;
      // 리워드 존재 여부 확인
      if (reward_id) {
        const reward = await Reward.findById(reward_id);
        if (!reward) {
          return res.status(400).json({ message: 'Invalid reward_id' });
        }
      }
      const quest = new Quest({ ...questData, reward_id });
      await quest.save();
      res.status(201).json(quest);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

// 모든 퀘스트 조회
router.get('/', async (req, res) => {
  try {
    const quests = await Quest.find();
    res.status(200).json(quests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:questId', async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.questId);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    res.json(quest);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quest', error: error.toString() });
  }
});

module.exports = router;