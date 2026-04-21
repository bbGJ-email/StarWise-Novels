const express = require('express');
const router = express.Router();
const { 
  getAnnouncements, 
  getActiveAnnouncement, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement, 
  activateAnnouncement, 
  deactivateAnnouncement 
} = require('../controllers/announcementController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// 公开接口
router.get('/active', getActiveAnnouncement);

// 需要管理员权限的接口
router.get('/', authMiddleware, roleMiddleware('ADMIN'), getAnnouncements);
router.post('/', authMiddleware, roleMiddleware('ADMIN'), createAnnouncement);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), updateAnnouncement);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), deleteAnnouncement);
router.put('/:id/activate', authMiddleware, roleMiddleware('ADMIN'), activateAnnouncement);
router.put('/:id/deactivate', authMiddleware, roleMiddleware('ADMIN'), deactivateAnnouncement);

module.exports = router;