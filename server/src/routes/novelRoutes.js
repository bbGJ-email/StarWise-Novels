const express = require('express');
const router = express.Router();
const { 
  getAllNovels, 
  getNovelById, 
  createNovel, 
  updateNovel, 
  getMyNovels, 
  getHotNovels, 
  uploadCover,
  deleteNovel 
} = require('../controllers/novelController');
const upload = require('../config/multer');
const { authMiddleware, optionalAuthMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/', getAllNovels);
router.get('/hot', getHotNovels);
router.get('/my', authMiddleware, getMyNovels);
router.get('/:id', optionalAuthMiddleware, getNovelById);
router.post('/', authMiddleware, roleMiddleware(['AUTHOR', 'ADMIN']), createNovel);
router.put('/:id', authMiddleware, updateNovel);

// 封面上传路由
router.post('/:novelId/cover', authMiddleware, upload.single('cover'), uploadCover);

// 删除小说路由
router.delete('/:id', authMiddleware, deleteNovel);

module.exports = router;
