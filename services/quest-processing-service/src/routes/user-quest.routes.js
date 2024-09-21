const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const redis = require('redis');
const UserQuest = require('../models/user-quest.model');
const questCatalogApi = require('../services/quest-catalog-api');
const rewardCatalogApi = require('../services/reward-api');
const userApi = require('../services/user-api');
const axios = require('axios');
const config = require('../config');
const questStartQueue = require('../queues/quest-start.queue');

// Redis 클라이언트 설정
const redisClient = require('../utils/redis');

// 캐시에서 퀘스트 가져오기
async function getQuestFromCache(questId) {
  try {
    const cachedQuest = await redisClient.get(`quest:${questId}`);
    if (cachedQuest) {
      return JSON.parse(cachedQuest);
    }
    return null;
  } catch (error) {
    console.error('Error fetching quest from cache:', error);
    return null;
  }
}

async function getQuest(questId) {
  try {
    const cachedQuest = await getQuestFromCache(questId);
    if (cachedQuest) {
      return cachedQuest;
    }

    const quest = await questCatalogApi.getQuest(questId);
    if (quest) {
      await redisClient.set(`quest:${questId}`, JSON.stringify(quest), 'EX', 60);
    }
    return quest;
  } catch (error) {
    console.error('Error fetching quest:', error);
    throw error;
  }
}

// 캐시에서 리워드 가져오기
async function getRewardFromCache(rewardId) {
  try {
    const cachedReward = await redisClient.get(`reward:${rewardId}`);
    if (cachedReward) {
      return JSON.parse(cachedReward);
    }
    return null;
  } catch (error) {
    console.error('캐시에서 리워드 가져오기 오류:', error);
    return null;
  }
}

async function getReward(rewardId) {
  try {
    const cachedReward = await getRewardFromCache(rewardId);
    if (cachedReward) {
      return cachedReward;
    }

    const reward = await rewardCatalogApi.getReward(rewardId);
    if (reward) {
      await redisClient.set(`reward:${rewardId}`, JSON.stringify(reward), 'EX', 60);
    }
    return reward;
  } catch (error) {
    console.error('리워드 가져오기 오류:', error);
    throw error;
  }
}

// 캐시에서 유저 가져오기
async function getUserFromCache(userId) {
  try {
    const cachedUser = await redisClient.get(`quest:${userId}`);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }
    return null;
  } catch (error) {
    console.error('Error fetching user from cache:', error);
    return null;
  }
}

async function getUser(userId) {
  try {
    const cachedUser = await getUserFromCache(userId);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await userApi.getUser(userId);
    if (user) {
      await redisClient.set(`quest:${userId}`, JSON.stringify(user), 'EX', 60);
    }
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}


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
router.post('/start', async (req, res) => {
  try {
    const { user_id, quest_id } = req.body;

    // 해당 퀘스트 정보 가져오기
    const quest = await getQuest(quest_id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    // 동일한 퀘스트의 진행 중인 인스턴스 확인
    const activeQuest = await UserQuest.findOne({ 
      user_id, 
      quest_id,
      status: 'in_progress'
    });
    await redisClient.set(`user_quest:${user_id}:${quest_id}`, '0');

    if (activeQuest) {
      return res.status(400).json({ 
        message: 'User already has an active instance of this quest. Complete it before starting a new one.' 
      });
    }

    // 퀘스트 중복 수행 횟수 확인
    const completedQuestsCount = await UserQuest.countDocuments({
      user_id,
      quest_id,
      status: 'completed'
    });

    if (completedQuestsCount >= quest.duplication) {
      return res.status(400).json({ 
        message: 'Maximum quest completions reached for this quest.' 
      });
    }

    // 새 UserQuest 생성
    const userQuest = new UserQuest({ 
      user_id, 
      quest_id, 
      status: 'in_progress' 
    });
    await userQuest.save();

    await questStartQueue.add({ user_id, quest_id });
    res.status(202).json({ 
      message: 'Quest start process initiated', 
      userQuest 
    });
  } catch (error) {
    console.error('Error in /start route:', error);
    res.status(500).json({ 
      message: 'Error starting quest', 
      error: error.toString() 
    });
  }
});

// 사용자의 퀘스트 진행 상황 업데이트
router.put('/update-progress', async (req, res) => {
  try {
    const { user_id, quest_id, progress } = req.body;

    const userQuest = await UserQuest.findOneAndUpdate(
      { user_id, quest_id },
      { progress },
      { new: true }
    );

    if (!userQuest) {
      return res.status(404).json({ message: 'User quest not found' });
    }

    const quest = await getQuest(quest_id);
    if (progress >= quest.streak) {
      userQuest.status = 'completed';
      userQuest.completed_at = new Date();
    }

    if (userQuest.status === 'completed') {
          // auto_claim일 경우 보상 자동 수령
    if (quest.auto_claim) {
      const reward = await getReward(quest.reward_id);
      const rewardData = {
        rewardGold: reward.reward_item === 'gold' ? reward.reward_qty : 0,
        rewardDiamond: reward.reward_item === 'diamond' ? reward.reward_qty : 0,
      };

      const userServiceUrl = `${config.AUTH_SERVICE_URL}/auth/${user_id}/rewards`;
      const response = await axios.put(userServiceUrl, rewardData);

      if (response.status === 200) {
        // 보상이 성공적으로 지급되었을 경우, 상태를 reward_claimed로 업데이트
        userQuest.status = 'reward_claimed';
      }
    }
    }

    // 데이터베이스 업데이트
    await UserQuest.updateOne(
      { _id: userQuest._id },
      { $set: userQuest }
    );

    res.json(userQuest);
  } catch (error) {
    res.status(400).json({ message: 'Error updating quest progress', error: error.message });
  }
});

// 보상 수령 API
router.put('/claimreward', async (req, res) => {
  try {
    const { user_id, quest_id } = req.body;

    // 진행 중인 퀘스트가 있는지 확인
    const userQuest = await UserQuest.findOne({ user_id, quest_id });

    if (!userQuest || userQuest.status !== 'completed') {
      return res.status(400).json({ message: 'No completed quest found or reward already claimed.' });
    }

    // 보상이 이미 지급된 경우 확인
    if (userQuest.status === 'reward_claimed') {
      return res.status(400).json({ message: 'Reward already claimed.' });
    }
    const quest = await getQuest(quest_id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    const reward = await getReward(quest.reward_id);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    const rewardData = {
      rewardGold: reward.reward_item === 'gold' ? reward.reward_qty : 0,
      rewardDiamond: reward.reward_item === 'diamond' ? reward.reward_qty : 0,
    };

    const userServiceUrl = `${config.AUTH_SERVICE_URL}/auth/${user_id}/rewards`;
    const response = await axios.put(userServiceUrl, rewardData);

    if (response.status === 200) {
      // 보상이 성공적으로 지급되었을 경우, 상태를 reward_claimed로 업데이트
      userQuest.status = 'reward_claimed';
    }

    await UserQuest.updateOne(
      { _id: userQuest._id },
      { $set: userQuest }
    );

    res.json({ message: 'Reward claimed successfully', userQuest });

  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(500).json({ message: 'Error claiming reward', error: error.message });
  }
});

router.get('/quests/:questId', async (req, res) => {
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
// 보상 지급 로직을 별도로 분리하여 관리
async function grantRewardToUser(user_id, reward, session) {
  const rewardUpdate = reward.reward_item === 'gold' 
    ? { $inc: { gold: reward.reward_qty } } 
    : { $inc: { diamond: reward.reward_qty } };

  await User.findByIdAndUpdate(user_id, rewardUpdate, { session });
}

async function updateUserReward(user_id, reward) {
  try {
    if (!reward) {
      throw new Error('Reward not found');
    }
    const updateField = reward.reward_item === 'gold' ? 'gold' : 'diamond';
    const updateAmount = reward.reward_qty;
    console.log('updateField:', updateField);
    console.log('updateAmount:', reward.reward_qty);
    
    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { $inc: { [updateField]: updateAmount } },
      { new: true, lean: true }
    );
    if (!updatedUser) {
      throw new Error('User not found');
    }  
    return {
      rewardItem: reward.reward_item,
      rewardQuantity: reward.reward_qty,
      newBalance: updatedUser[updateField]
    };      
    /*
            // 데이터베이스 업데이트
        await UserQuest.updateOne(
          { _id: userQuest._id },
          { $set: userQuest }
        );
    */
  } catch (error) {
    console.error('Error in updateUserReward:', error);
    throw error;
  }
}

module.exports = router;
