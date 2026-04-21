const prisma = require('../config/db');

// 获取公告列表
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(announcements);
  } catch (error) {
    console.error('获取公告列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取活跃的公告
const getActiveAnnouncement = async (req, res) => {
  try {
    const announcement = await prisma.announcement.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(announcement);
  } catch (error) {
    console.error('获取活跃公告错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 创建公告
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, isActive } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: '请填写完整信息' });
    }

    // 如果设置为活跃，先将其他公告设为非活跃
    if (isActive) {
      await prisma.announcement.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        isActive: isActive || false
      }
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error('创建公告错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 更新公告
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isActive } = req.body;

    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) }
    });

    if (!announcement) {
      return res.status(404).json({ error: '公告不存在' });
    }

    // 如果设置为活跃，先将其他公告设为非活跃
    if (isActive) {
      await prisma.announcement.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        isActive
      }
    });

    res.json(updatedAnnouncement);
  } catch (error) {
    console.error('更新公告错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 删除公告
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) }
    });

    if (!announcement) {
      return res.status(404).json({ error: '公告不存在' });
    }

    await prisma.announcement.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: '公告删除成功' });
  } catch (error) {
    console.error('删除公告错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 激活公告
const activateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    // 先将所有公告设为非活跃
    await prisma.announcement.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // 激活指定公告
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: { isActive: true }
    });

    res.json(updatedAnnouncement);
  } catch (error) {
    console.error('激活公告错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 停用公告
const deactivateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    res.json(updatedAnnouncement);
  } catch (error) {
    console.error('停用公告错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  getAnnouncements,
  getActiveAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  activateAnnouncement,
  deactivateAnnouncement
};