const express = require('express');
const router = express.Router();
const readingHistoryController = require('../controllers/readingHistoryController');
const { authMiddleware } = require('../middleware/auth');

// 验证用户身份
router.use(authMiddleware);

// 添加阅读历史
router.post('/', readingHistoryController.addReadingHistory);

// 获取阅读历史
router.get('/', readingHistoryController.getReadingHistory);

// 清空阅读历史
router.delete('/', readingHistoryController.clearReadingHistory);

module.exports = router;
