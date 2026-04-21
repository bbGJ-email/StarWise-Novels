const express = require('express');
const router = express.Router();
const authorApplicationController = require('../controllers/authorApplicationController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// 提交作家申请
router.post('/submit', authMiddleware, authorApplicationController.submitApplication);

// 获取用户的申请状态
router.get('/status', authMiddleware, authorApplicationController.getApplicationStatus);

// 获取所有作家申请（管理员）
router.get('/all', authMiddleware, roleMiddleware(['ADMIN']), authorApplicationController.getAllApplications);

// 审核作家申请（管理员）
router.post('/approve', authMiddleware, roleMiddleware(['ADMIN']), authorApplicationController.approveApplication);

module.exports = router;
