const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

// 获取用户列表
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取小说列表
const getNovels = async (req, res) => {
  try {
    const novels = await prisma.novel.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        views: true,
        favorites: true,
        createdAt: true,
        author: {
          select: { id: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(novels);
  } catch (error) {
    console.error('获取小说列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 创建用户
const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: '邮箱已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 更新用户
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const updateData = {
      username,
      email,
      role
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 删除用户
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 禁止删除自己
    if (user.id === req.user.id) {
      return res.status(400).json({ error: '不能删除自己' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  getUsers,
  getNovels,
  createUser,
  updateUser,
  deleteUser
};
