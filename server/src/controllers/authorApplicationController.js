const prisma = require('../config/db');

// 提交作家申请
exports.submitApplication = async (req, res) => {
  try {
    const { penName, introduction } = req.body;
    const userId = req.user.id;

    // 检查是否已经有申请
    const existingApplication = await prisma.authorApplication.findUnique({
      where: { userId }
    });

    if (existingApplication) {
      return res.status(400).json({ message: '您已经提交过申请' });
    }

    const application = await prisma.authorApplication.create({
      data: {
        userId,
        penName,
        introduction,
        status: 'PENDING'
      }
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('提交申请失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取用户的申请状态
exports.getApplicationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const application = await prisma.authorApplication.findUnique({
      where: { userId }
    });

    res.status(200).json(application);
  } catch (error) {
    console.error('获取申请状态失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取所有作家申请（管理员）
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await prisma.authorApplication.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.status(200).json(applications);
  } catch (error) {
    console.error('获取申请列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 审核作家申请（管理员）
exports.approveApplication = async (req, res) => {
  try {
    const { applicationId, status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: '无效的状态' });
    }

    const application = await prisma.authorApplication.update({
      where: { id: applicationId },
      data: { status }
    });

    // 如果批准，更新用户角色
    if (status === 'APPROVED') {
      const currentUser = await prisma.user.findUnique({ 
        where: { id: application.userId } 
      }); 
      if (currentUser && currentUser.role !== 'ADMIN') { 
        await prisma.user.update({ 
          where: { id: application.userId }, 
          data: { role: 'AUTHOR' } 
        }); 
      } 
    }

    res.status(200).json(application);
  } catch (error) {
    console.error('审核申请失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
