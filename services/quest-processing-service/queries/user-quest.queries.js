// quest-processing-service/queries/user-quest.queries.js
const express = require('express');
const router = express.Router();
const UserQuest = require('../models/user-quest.model');

// 사용자의 퀘스트 목록을 조회하며 관련된 사용자와 퀘스트 정보도 가져오기
router.get('/', async (req, res) => {
  try {
    const userQuests = await UserQuest.find()
      .populate('user_id')   // 'User' 모델의 정보를 함께 가져옴
      .populate('quest_id'); // 'Quest' 모델의 정보를 함께 가져옴

    res.json(userQuests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user quests', error: error.message });
  }
});

module.exports = router;
