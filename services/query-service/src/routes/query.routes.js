const express = require('express');
const router = express.Router();

// 예시: 퀘스트 목록 조회 핸들러
router.get('/quests', async (req, res) => {
    // 비즈니스 로직 추가
    res.json({ message: 'Fetched quest list successfully!' });
});

module.exports = router;
