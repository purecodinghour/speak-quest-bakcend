const express = require('express');
const router = express.Router();
const User = require('../models/user.model'); // 사용자 모델

// 사용자 목록 조회
router.get('/', async (req, res) => {
  try {
    const users = await User.find(); // 모든 사용자를 조회합니다.
    res.status(200).json(users); // 조회된 사용자 목록을 반환합니다.
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

module.exports = router;