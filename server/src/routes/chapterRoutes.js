const express = require('express');
const router = express.Router();
const {
  getChaptersByNovel,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  getPendingChapters,
  reviewChapter
} = require('../controllers/chapterController');
const { authMiddleware, optionalAuthMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/novel/:novelId', optionalAuthMiddleware, getChaptersByNovel);
router.get('/:id', getChapterById);
router.post('/novel/:novelId', authMiddleware, createChapter);
router.put('/:id', authMiddleware, updateChapter);
router.delete('/:id', authMiddleware, deleteChapter);

// 审核相关路由
router.get('/admin/pending', authMiddleware, roleMiddleware('ADMIN'), getPendingChapters);
router.put('/admin/review/:id', authMiddleware, roleMiddleware('ADMIN'), reviewChapter);

module.exports = router;
