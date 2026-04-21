const prisma = require('../config/db');

const getChaptersByNovel = async (req, res) => {
  try {
    const { novelId } = req.params;
    const novel = await prisma.novel.findUnique({
      where: { id: parseInt(novelId) }
    });

    if (!novel) {
      return res.status(404).json({ error: '小说不存在' });
    }

    const where = { novelId: parseInt(novelId) };
    // 只有作者和管理员可以看到所有状态的章节
    if (novel.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      where.status = 'PUBLISHED';
    }

    const chapters = await prisma.chapter.findMany({
      where,
      orderBy: { chapterNumber: 'asc' },
      select: { id: true, title: true, chapterNumber: true, status: true, createdAt: true }
    });

    res.json(chapters);
  } catch (error) {
    console.error('获取章节列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getPendingChapters = async (req, res) => {
  try {
    const chapters = await prisma.chapter.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        novel: {
          select: { id: true, title: true, author: { select: { username: true } } }
        }
      }
    });

    res.json(chapters);
  } catch (error) {
    console.error('获取待审核章节错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const reviewChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: '无效的审核状态' });
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: parseInt(id) }
    });

    if (!chapter) {
      return res.status(404).json({ error: '章节不存在' });
    }

    const updatedChapter = await prisma.chapter.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({ chapter: updatedChapter, message: '审核成功' });
  } catch (error) {
    console.error('审核章节错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getChapterById = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await prisma.chapter.findUnique({
      where: { id: parseInt(id) },
      include: {
        novel: {
          select: {
            id: true,
            title: true,
            authorId: true,
            chapters: {
              where: { status: 'PUBLISHED' },
              select: { id: true, chapterNumber: true }
            }
          }
        }
      }
    });

    if (!chapter) {
      return res.status(404).json({ error: '章节不存在' });
    }

    // 只有作者、管理员或已发布的章节对普通用户可见
    if (chapter.status !== 'PUBLISHED' && chapter.novel.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权访问此章节' });
    }

    res.json(chapter);
  } catch (error) {
    console.error('获取章节详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 处理HTML内容，提取<body>内的内容或移除完整HTML结构
const processHtmlContent = (content) => {
  if (!content) return content;
  
  // 检查是否包含完整的HTML文档结构
  if (content.includes('<html') && content.includes('</html>')) {
    // 尝试提取<body>标签内的内容
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      return bodyMatch[1].trim();
    }
    // 如果没有<body>标签，移除外层HTML结构
    return content.replace(/<!DOCTYPE[^>]*>/i, '')
      .replace(/<html[^>]*>/i, '')
      .replace(/<\/html>/i, '')
      .replace(/<head[^>]*>([\s\S]*?)<\/head>/i, '')
      .trim();
  }
  return content;
};

const createChapter = async (req, res) => {
  try {
    const { novelId } = req.params;
    const { title, content } = req.body;

    const novel = await prisma.novel.findUnique({
      where: { id: parseInt(novelId) }
    });

    if (!novel) {
      return res.status(404).json({ error: '小说不存在' });
    }

    if (novel.authorId !== req.user.id) {
      return res.status(403).json({ error: '无权在此小说下创建章节' });
    }

    const maxChapter = await prisma.chapter.findFirst({
      where: { novelId: parseInt(novelId) },
      orderBy: { chapterNumber: 'desc' }
    });

    const chapterNumber = maxChapter ? maxChapter.chapterNumber + 1 : 1;
    const processedContent = processHtmlContent(content);

    const chapter = await prisma.chapter.create({
      data: {
        novelId: parseInt(novelId),
        title,
        content: processedContent,
        chapterNumber
      }
    });

    res.status(201).json(chapter);
  } catch (error) {
    console.error('创建章节错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status } = req.body;

    const chapter = await prisma.chapter.findUnique({
      where: { id: parseInt(id) },
      include: { novel: true }
    });

    if (!chapter) {
      return res.status(404).json({ error: '章节不存在' });
    }

    if (chapter.novel.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权修改此章节' });
    }

    const processedContent = processHtmlContent(content);

    const updatedChapter = await prisma.chapter.update({
      where: { id: parseInt(id) },
      data: { title, content: processedContent, status }
    });

    res.json(updatedChapter);
  } catch (error) {
    console.error('更新章节错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await prisma.chapter.findUnique({
      where: { id: parseInt(id) },
      include: { novel: true }
    });

    if (!chapter) {
      return res.status(404).json({ error: '章节不存在' });
    }

    if (chapter.novel.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权删除此章节' });
    }

    await prisma.chapter.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: '章节删除成功' });
  } catch (error) {
    console.error('删除章节错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  getChaptersByNovel,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  getPendingChapters,
  reviewChapter
};
