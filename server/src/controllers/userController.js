const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '请填写完整信息' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: '用户名至少3个字符' });
    }

    const existingUser = await prisma.user.findFirst({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'USER'
      },
      select: { id: true, username: true, role: true }
    });

    const token = generateToken({ userId: user.id });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '请填写用户名和密码' });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = generateToken({ userId: user.id });

    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, email: true, avatar: true, role: true, createdAt: true }
    });

    res.json(user);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { username, avatar },
      select: { id: true, username: true, email: true, avatar: true, role: true }
    });

    res.json(user);
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
