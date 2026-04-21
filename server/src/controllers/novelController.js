const prisma = require('../config/db');
const upload = require('../config/multer');

const getAllNovels = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let where = { status: 'PUBLISHED' };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { username: { contains: search } } }
      ];
    }

    const [novels, total] = await Promise.all([
      prisma.novel.findMany({
        where,
        include: { author: { select: { id: true, username: true } } },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.novel.count({ where })
    ]);

    const novelsWithParsedTags = novels.map(novel => ({
      ...novel,
      tags: novel.tags ? JSON.parse(novel.tags) : []
    }));

    res.json({ novels: novelsWithParsedTags, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('获取小说列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getNovelById = async (req, res) => {
  try {
    const { id } = req.params;
    const novel = await prisma.novel.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: { select: { id: true, username: true } }
      }
    });

    if (!novel) {
      return res.status(404).json({ error: '小说不存在' });
    }

    const chapterWhere = { novelId: parseInt(id) };
    // 只有作者和管理员可以看到所有状态的章节
    if (novel.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      chapterWhere.status = 'PUBLISHED';
    }

    const chapters = await prisma.chapter.findMany({
      where: chapterWhere,
      orderBy: { chapterNumber: 'asc' },
      select: { id: true, title: true, chapterNumber: true, status: true, createdAt: true }
    });

    const novelWithParsedTags = {
      ...novel,
      tags: novel.tags ? JSON.parse(novel.tags) : [],
      chapters
    };

    res.json(novelWithParsedTags);
  } catch (error) {
    console.error('获取小说详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const createNovel = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    const novel = await prisma.novel.create({
      data: {
        title,
        description,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        authorId: req.user.id
      },
      include: { author: { select: { id: true, username: true } } }
    });

    const novelWithParsedTags = {
      ...novel,
      tags: novel.tags ? JSON.parse(novel.tags) : []
    };

    res.status(201).json(novelWithParsedTags);
  } catch (error) {
    console.error('创建小说错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const updateNovel = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, tags, status, cover } = req.body;

    const novel = await prisma.novel.findUnique({
      where: { id: parseInt(id) }
    });

    if (!novel) {
      return res.status(404).json({ error: '小说不存在' });
    }

    if (novel.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权修改此小说' });
    }

    const updatedNovel = await prisma.novel.update({
      where: { id: parseInt(id) },
      data: { 
        title, 
        description, 
        category, 
        tags: tags !== undefined ? JSON.stringify(tags) : undefined, 
        status, 
        cover 
      },
      include: { author: { select: { id: true, username: true } } }
    });

    const novelWithParsedTags = {
      ...updatedNovel,
      tags: updatedNovel.tags ? JSON.parse(updatedNovel.tags) : []
    };

    res.json(novelWithParsedTags);
  } catch (error) {
    console.error('更新小说错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getMyNovels = async (req, res) => {
  try {
    const novels = await prisma.novel.findMany({
      where: { authorId: req.user.id },
      include: { _count: { select: { chapters: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const novelsWithParsedTags = novels.map(novel => ({
      ...novel,
      tags: novel.tags ? JSON.parse(novel.tags) : []
    }));

    res.json(novelsWithParsedTags);
  } catch (error) {
    console.error('获取我的小说错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getHotNovels = async (req, res) => {
  try {
    const novels = await prisma.novel.findMany({
      where: { status: 'PUBLISHED' },
      include: { author: { select: { id: true, username: true } } },
      orderBy: { views: 'desc' },
      take: 10
    });

    const novelsWithParsedTags = novels.map(novel => ({
      ...novel,
      tags: novel.tags ? JSON.parse(novel.tags) : []
    }));

    res.json(novelsWithParsedTags);
  } catch (error) {
    console.error('获取热门小说错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 上传小说封面
const uploadCover = async (req, res) => {
  try {
    const { novelId } = req.params;
    
    // 检查小说是否存在且属于当前用户
    const novel = await prisma.novel.findFirst({
      where: {
        id: parseInt(novelId),
        authorId: req.user.id
      }
    });

    if (!novel) {
      return res.status(404).json({ error: '小说不存在或无权操作' });
    }

    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' });
    }

    // 构建封面URL
    const coverUrl = `/uploads/${req.file.filename}`;

    // 更新小说封面
    const updatedNovel = await prisma.novel.update({
      where: { id: parseInt(novelId) },
      data: { cover: coverUrl },
      select: { id: true, title: true, cover: true }
    });

    res.json({ message: '封面上传成功', novel: updatedNovel });
  } catch (error) {
    console.error('上传封面错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 删除小说
const deleteNovel = async (req, res) => {
  try {
    const { id } = req.params;

    const novel = await prisma.novel.findUnique({
      where: { id: parseInt(id) }
    });

    if (!novel) {
      return res.status(404).json({ error: '小说不存在' });
    }

    if (novel.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权删除此小说' });
    }

    // 先删除相关的章节、评论等
    await prisma.chapter.deleteMany({ where: { novelId: parseInt(id) } });
    await prisma.comment.deleteMany({ where: { novelId: parseInt(id) } });
    await prisma.bookshelfItem.deleteMany({ where: { novelId: parseInt(id) } });
    await prisma.readingHistory.deleteMany({ where: { novelId: parseInt(id) } });

    // 删除小说
    await prisma.novel.delete({ where: { id: parseInt(id) } });

    res.json({ message: '小说删除成功' });
  } catch (error) {
    console.error('删除小说错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  getAllNovels,
  getNovelById,
  createNovel,
  updateNovel,
  getMyNovels,
  getHotNovels,
  uploadCover,
  deleteNovel
};
