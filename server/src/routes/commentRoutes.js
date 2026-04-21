const express = require('express');
const router = express.Router();
const {
  createComment,
  getComments,
  replyComment,
  deleteComment,
  reportComment,
  getPendingComments,
  reviewComment,
  getCommentReports,
  handleCommentReport
} = require('../controllers/commentController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// 普通用户可访问的路由
router.post('/', authMiddleware, createComment);
router.get('/', getComments);
router.post('/reply', authMiddleware, replyComment);
router.delete('/:id', authMiddleware, deleteComment);
router.post('/report', authMiddleware, reportComment);

// 管理员可访问的路由
router.get('/admin/pending', authMiddleware, roleMiddleware('ADMIN'), getPendingComments);
router.put('/admin/review/:id', authMiddleware, roleMiddleware('ADMIN'), reviewComment);
router.get('/admin/reports', authMiddleware, roleMiddleware('ADMIN'), getCommentReports);
router.put('/admin/reports/:id', authMiddleware, roleMiddleware('ADMIN'), handleCommentReport);

module.exports = router;