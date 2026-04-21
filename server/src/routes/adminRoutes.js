const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// 管理员权限验证
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

// 用户管理
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// 小说管理
router.get('/novels', adminController.getNovels);

module.exports = router;
