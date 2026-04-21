const prisma = require('../config/db');

// 添加阅读历史
const addReadingHistory = async (req, res) => {
  try {
    const { novelId, chapterId } = req.body;
    const userId = req.user.id;

    // 检查是否已存在相同的阅读记录
    const existingRecord = await prisma.readingHistory.findFirst({
      where: {
        userId,
        novelId,
        chapterId
      }
    });

    if (existingRecord) {
      // 更新现有记录的时间
      await prisma.readingHistory.update({
        where: {
          id: existingRecord.id
        },
        data: {
          readAt: new Date()
        }
      });
    } else {
      // 创建新的阅读记录
      await prisma.readingHistory.create({
        data: {
          userId,
          novelId,
          chapterId
        }
      });

      // 只有新的阅读记录才增加小说的阅读量
      await prisma.novel.update({
        where: { id: novelId },
        data: { views: { increment: 1 } }
      });
    }

    // 同时更新书架中的最后阅读章节
    const bookshelfItem = await prisma.bookshelfItem.findFirst({
      where: {
        userId,
        novelId
      }
    });

    if (bookshelfItem) {
      await prisma.bookshelfItem.update({
        where: {
          id: bookshelfItem.id
        },
        data: {
          lastReadChapterId: chapterId
        }
      });
    }

    res.json({ message: '阅读历史添加成功' });
  } catch (error) {
    console.error('添加阅读历史错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取用户的阅读历史
const getReadingHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await prisma.readingHistory.findMany({
      where: {
        userId
      },
      include: {
        novel: {
          select: {
            id: true,
            title: true,
            cover: true,
            author: {
              select: {
                username: true
              }
            }
          }
        },
        chapter: {
          select: {
            id: true,
            title: true,
            chapterNumber: true
          }
        }
      },
      orderBy: {
        readAt: 'desc'
      }
    });

    res.json(history);
  } catch (error) {
    console.error('获取阅读历史错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 清空阅读历史
const clearReadingHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.readingHistory.deleteMany({
      where: {
        userId
      }
    });

    res.json({ message: '阅读历史已清空' });
  } catch (error) {
    console.error('清空阅读历史错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  addReadingHistory,
  getReadingHistory,
  clearReadingHistory
};
