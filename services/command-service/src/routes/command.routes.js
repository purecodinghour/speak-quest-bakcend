const express = require('express');
const router = express.Router();
const UserQuest = require('../../../quest-processing-service/src/models/user-quest.model'); // 사용자 퀘스트 모델 불러오기
const User = require('../../../auth-service/src/models/user.model'); // 사용자 모델 불러오기
const Quest = require('../../../quest-catalog-service/src/models/quest.model'); // 퀘스트 모델 불러오기

// 사용자의 퀘스트 시작
router.post('/start', async (req, res) => {
  try {
    const { user_id, quest_id } = req.body;

    // 사용자와 퀘스트가 존재하는지 확인
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const quest = await Quest.findById(quest_id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    // 이미 시작된 퀘스트인지 확인
    const existingUserQuest = await UserQuest.findOne({ user_id, quest_id });
    if (existingUserQuest) {
      return res.status(400).json({ message: 'Quest already started by this user.' });
    }

    // 새로운 퀘스트 시작 기록 생성
    const userQuest = new UserQuest({
      user_id,
      quest_id,
      status: 'in_progress', // 상태를 '진행 중'으로 설정
      progress: 0, // 진행 상황 초기화
      started_at: new Date() // 시작 시간 기록
    });

    await userQuest.save();

    res.status(201).json({ message: 'Quest started successfully', userQuest });
  } catch (error) {
    res.status(500).json({ message: 'Error starting quest', error: error.message });
  }
});

module.exports = router;
