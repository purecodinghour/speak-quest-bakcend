const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const authMiddleware = require('../middleware/auth.middleware');
const bcrypt = require('bcryptjs');

// 사용자 등록
router.post('/register', async (req, res) => {
  console.log('Received register request:', req.body);
  try {
    const { user_name, password } = req.body;
    const existingUser = await User.findOne({ user_name });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    console.log('시도한 비밀번호:', password);
    const user = new User({ user_name, password: password });
    console.log('처음 저장된 비밀번호:', user.password);
    await user.save();

    // JWT 토큰 생성
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    // 응답으로 사용자 정보와 토큰 반환 (비밀번호는 제외)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        user_name: user.user_name,
        status: user.status,
        gold: user.gold,        // 골드 추가
        diamond: user.diamond   // 다이아몬드 추가
      },
      token,
    });
  } catch (error) {
    console.error('Error in register route:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  console.log('Received login request:', req.body);
  try {
    const { user_name, password } = req.body; 
    console.log('user_name:', user_name); 
    const user = await User.findOne({ user_name });
    if (!user) {
      console.log('router_post_login까지는 들어옴', user_name); 
      console.log('User not found:', user_name); // 로그 추가
      return res.status(401).json({ message: 'Invalid user' });
    }

    console.log('받은 비밀번호: ', password); 
    console.log('저장된 비밀번호: ',user.password); 
    console.log('같은가: ',password == user.password); 
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (password == user.password || isPasswordValid) {
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
      user.loginCount = (user.loginCount || 0) + 1;
      res.json({ message: 'Login successful', token, loginCount: user.loginCount });
      await user.save();
    }
    else{
      console.log('Invalid password for user:', user_name); // 로그 추가
      return res.status(401).json({ message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.toString() });
  }
});

router.put('/:userId/rewards', async (req, res) => {
  try {
    const { rewardGold, rewardDiamond } = req.body; // 요청으로 들어오는 보상 값

    // 사용자 정보 조회
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 기존 골드 및 다이아몬드 값에 보상을 더함
    user.gold += rewardGold || 0; // 보상 골드가 없으면 0으로 처리
    user.diamond += rewardDiamond || 0; // 보상 다이아몬드가 없으면 0으로 처리

    // 변경된 값을 저장
    await user.save();

    // 갱신된 골드와 다이아몬드 정보 반환
    res.json({
      userId: user._id,
      gold: user.gold,
      diamond: user.diamond,
      message: 'User rewards updated successfully',
    });

  } catch (error) { 
    console.error('Error updating user rewards:', error);
    res.status(500).json({ message: 'Error updating user rewards', error: error.message });
  }
});


router.get('/', authMiddleware, async (req, res) => {
  try {
    // authMiddleware에서 디코딩된 userId를 이용하여 사용자를 조회
    const user = await User.findById(req.userId).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

module.exports = router;