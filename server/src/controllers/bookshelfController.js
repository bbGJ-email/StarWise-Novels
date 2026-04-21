const prisma = require('../config/db');

const getMyBookshelf = async (req, res) => {
  try {
    const bookshelf = await prisma.bookshelfItem.findMany({
      where: { userId: req.user.id },
      include: {
        novel: {
          include: { author: { select: { id: true, username: true } } }
        }
      },
      orderBy: { addedAt: 'desc' }
    });

    res.json(bookshelf);
  } catch (error) {
    console.error('获取书架错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const addToBookshelf = async (req, res) => {
  try {
    const { novelId } = req.body;

    const novel = await prisma.novel.findUnique({
      where: { id: parseInt(novelId) }
    });

    if (!novel) {
      return res.status(404).json({ error: '小说不存在' });
    }

    const existingItem = await prisma.bookshelfItem.findFirst({
      where: { userId: req.user.id, novelId: parseInt(novelId) }
    });

    if (existingItem) {
      return res.status(400).json({ error: '已在书架中' });
    }

    const bookshelfItem = await prisma.bookshelfItem.create({
      data: {
        userId: req.user.id,
        novelId: parseInt(novelId)
      },
      include: {
        novel: {
          include: { author: { select: { id: true, username: true } } }
        }
      }
    });

    await prisma.novel.update({
      where: { id: parseInt(novelId) },
      data: { favorites: { increment: 1 } }
    });

    res.status(201).json(bookshelfItem);
  } catch (error) {
    console.error('添加到书架错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const removeFromBookshelf = async (req, res) => {
  try {
    const { id } = req.params;

    const bookshelfItem = await prisma.bookshelfItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!bookshelfItem) {
      return res.status(404).json({ error: '书架项不存在' });
    }

    if (bookshelfItem.userId !== req.user.id) {
      return res.status(403).json({ error: '无权删除此书架项' });
    }

    await prisma.novel.update({
      where: { id: bookshelfItem.novelId },
      data: { favorites: { decrement: 1 } }
    });

    await prisma.bookshelfItem.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: '已从书架移除' });
  } catch (error) {
    console.error('从书架移除错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const updateReadingProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { lastReadChapterId } = req.body;

    const bookshelfItem = await prisma.bookshelfItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!bookshelfItem) {
      return res.status(404).json({ error: '书架项不存在' });
    }

    if (bookshelfItem.userId !== req.user.id) {
      return res.status(403).json({ error: '无权修改此书架项' });
    }

    const updatedItem = await prisma.bookshelfItem.update({
      where: { id: parseInt(id) },
      data: { lastReadChapterId },
      include: {
        novel: {
          include: { author: { select: { id: true, username: true } } }
        }
      }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('更新阅读进度错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  getMyBookshelf,
  addToBookshelf,
  removeFromBookshelf,
  updateReadingProgress
};
