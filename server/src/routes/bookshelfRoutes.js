const express = require('express');
const router = express.Router();
const {
  getMyBookshelf,
  addToBookshelf,
  removeFromBookshelf,
  updateReadingProgress
} = require('../controllers/bookshelfController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getMyBookshelf);
router.post('/', authMiddleware, addToBookshelf);
router.delete('/:id', authMiddleware, removeFromBookshelf);
router.put('/:id/progress', authMiddleware, updateReadingProgress);

module.exports = router;
