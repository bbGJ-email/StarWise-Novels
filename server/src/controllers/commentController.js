const prisma = require('../config/db');

// 发布评论
const createComment = async (req, res) => {
  try {
    const { novelId, chapterId, content, parentId } = req.body;

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user.id,
        novelId: parseInt(novelId),
        chapterId: chapterId ? parseInt(chapterId) : null,
        parentId: parentId ? parseInt(parentId) : null
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('发布评论错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取评论列表
const getComments = async (req, res) => {
  try {
    const { novelId, chapterId, page = 1, pageSize = 20 } = req.query;

    const where = { novelId: parseInt(novelId) };
    if (chapterId) {
      where.chapterId = parseInt(chapterId);
    }
    where.parentId = null; // 只获取顶级评论
    where.status = 'APPROVED'; // 只获取已审核通过的评论

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize),
        include: {
          user: { select: { id: true, username: true, avatar: true } },
          children: {
            where: { status: 'APPROVED' },
            orderBy: { createdAt: 'asc' },
            include: {
              user: { select: { id: true, username: true, avatar: true } }
            }
          }
        }
      }),
      prisma.comment.count({ where })
    ]);

    res.json({ comments, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 回复评论
const replyComment = async (req, res) => {
  try {
    const { parentId, content, novelId } = req.body;

    const parentComment = await prisma.comment.findUnique({
      where: { id: parseInt(parentId) }
    });

    if (!parentComment) {
      return res.status(404).json({ error: '父评论不存在' });
    }

    const reply = await prisma.comment.create({
      data: {
        content,
        userId: req.user.id,
        novelId: parseInt(novelId),
        parentId: parseInt(parentId)
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } }
      }
    });

    res.status(201).json(reply);
  } catch (error) {
    console.error('回复评论错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 删除评论
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    // 只有评论作者或管理员可以删除评论
    if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权删除此评论' });
    }

    // 级联删除所有回复
    await prisma.comment.deleteMany({
      where: { parentId: parseInt(id) }
    });

    // 删除评论举报
    await prisma.commentReport.deleteMany({
      where: { commentId: parseInt(id) }
    });

    // 删除评论本身
    await prisma.comment.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: '评论删除成功' });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 举报评论
const reportComment = async (req, res) => {
  try {
    const { commentId, reason } = req.body;

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    });

    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    // 检查是否已经举报过
    const existingReport = await prisma.commentReport.findFirst({
      where: { commentId: parseInt(commentId), userId: req.user.id }
    });

    if (existingReport) {
      return res.status(400).json({ error: '您已经举报过此评论' });
    }

    const report = await prisma.commentReport.create({
      data: {
        commentId: parseInt(commentId),
        userId: req.user.id,
        reason
      }
    });

    res.status(201).json({ message: '举报成功', report });
  } catch (error) {
    console.error('举报评论错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取待审核评论
const getPendingComments = async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize),
        include: {
          user: { select: { id: true, username: true } },
          novel: { select: { id: true, title: true } },
          chapter: { select: { id: true, title: true } }
        }
      }),
      prisma.comment.count({ where: { status: 'PENDING' } })
    ]);

    res.json({ comments, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取待审核评论错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 审核评论
const reviewComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: '无效的审核状态' });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({ comment: updatedComment, message: '审核成功' });
  } catch (error) {
    console.error('审核评论错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取评论举报列表
const getCommentReports = async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;

    const [reports, total] = await Promise.all([
      prisma.commentReport.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize),
        include: {
          comment: {
            include: {
              user: { select: { id: true, username: true } },
              novel: { select: { id: true, title: true } }
            }
          },
          user: { select: { id: true, username: true } }
        }
      }),
      prisma.commentReport.count({ where: { status: 'PENDING' } })
    ]);

    res.json({ reports, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('获取评论举报列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 处理评论举报
const handleCommentReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, commentStatus } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: '无效的处理状态' });
    }

    const report = await prisma.commentReport.findUnique({
      where: { id: parseInt(id) }
    });

    if (!report) {
      return res.status(404).json({ error: '举报记录不存在' });
    }

    // 开始事务
    await prisma.$transaction(async (prisma) => {
      // 更新举报状态
      await prisma.commentReport.update({
        where: { id: parseInt(id) },
        data: { status }
      });

      // 如果举报被批准，更新评论状态
      if (status === 'APPROVED' && commentStatus) {
        await prisma.comment.update({
          where: { id: report.commentId },
          data: { status: commentStatus }
        });
      }
    });

    res.json({ message: '处理成功' });
  } catch (error) {
    console.error('处理评论举报错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  createComment,
  getComments,
  replyComment,
  deleteComment,
  reportComment,
  getPendingComments,
  reviewComment,
  getCommentReports,
  handleCommentReport
};