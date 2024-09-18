// quest-processing-service/commands/user-quest.commands.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserQuest = require('../models/user-quest.model');
const User = require('../../../auth-service/src/models/user.model');
const Quest = require('../../../quest-catalog-service/src/models/quest.model');

// 사용자의 퀘스트 시작
router.post('/start', async (req, res) => {
  try {
    const { user_id, quest_id } = req.body;

    // 퀘스트 존재 여부 확인
    const quest = await Quest.findById(quest_id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    // 사용자 존재 여부 확인
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 퀘스트 시작 처리
    const userQuest = new UserQuest({ user_id, quest_id, status: 'in_progress' });
    await userQuest.save();

    res.status(201).json(userQuest);
  } catch (error) {
    res.status(400).json({ message: 'Error starting quest', error: error.message });
  }
});

// 사용자의 퀘스트 완료
router.put('/complete', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { user_id, quest_id } = req.body;

    // 퀘스트 완료 상태로 업데이트
    const userQuest = await UserQuest.findOneAndUpdate(
      { user_id, quest_id, status: 'in_progress' },
      { status: 'completed', completed_at: new Date() },
      { new: true, session }
    );

    if (!userQuest) {
      throw new Error('User quest not found or already completed');
    }

    // 보상 처리
    await handleReward(user_id, quest_id, session);

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Quest completed and reward claimed', userQuest });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: `Error completing quest: ${error.message}` });
  }
});

// 보상 처리 로직
async function handleReward(user_id, quest_id, session) {
  const quest = await Quest.findById(quest_id).session(session);
  const reward = await Reward.findById(quest.reward_id).session(session);

  const rewardUpdate = reward.reward_item === 'gold' 
    ? { $inc: { gold: reward.reward_qty } } 
    : { $inc: { diamond: reward.reward_qty } };

  await User.findByIdAndUpdate(user_id, rewardUpdate, { session });
}

module.exports = router;
