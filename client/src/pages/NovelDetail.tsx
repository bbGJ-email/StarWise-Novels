import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, Tag, List, message, Space, Form, Input, Avatar, Divider, Modal } from 'antd';
import { BookOutlined, HeartOutlined, ReadOutlined, PlusOutlined, SendOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import api from '../api';
import { useAppStore } from '../store';

const { Title, Text, Paragraph } = Typography;

interface Novel {
  id: number;
  title: string;
  cover?: string;
  description?: string;
  category: string;
  tags: string[];
  status: string;
  views: number;
  favorites: number;
  author: { id: number; username: string };
  chapters: Array<{ id: number; title: string; chapterNumber: number; createdAt: string }>;
}

interface Comment {
  id: number;
  content: string;
  user: { id: number; username: string; avatar?: string };
  createdAt: string;
  children: Array<{
    id: number;
    content: string;
    user: { id: number; username: string; avatar?: string };
    createdAt: string;
  }>;
}

export default function NovelDetail() {
  const { id } = useParams<{ id: string }>();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentForm] = Form.useForm();
  const [replyForm] = Form.useForm();
  const [replyingCommentId, setReplyingCommentId] = useState<number | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);
  const { user } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchNovelDetail();
      fetchComments();
    }
  }, [id]);

  const fetchComments = async () => {
    try {
      const response = await api.get('/comments', { params: { novelId: id } });
      setComments(response.data.comments);
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  };

  const fetchNovelDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/novels/${id}`);
      setNovel(response.data);
    } catch (error) {
      console.error('获取小说详情失败:', error);
      message.error('获取小说详情失败');
    } finally {
      setLoading(false);
    }
  };

  const addToBookshelf = async () => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    try {
      await api.post('/bookshelf', { novelId: novel?.id });
      message.success('已添加到书架');
      fetchNovelDetail();
    } catch (error: any) {
      message.error(error.response?.data?.error || '添加失败');
    }
  };

  const startReading = () => {
    if (novel && novel.chapters && novel.chapters.length > 0) {
      navigate(`/reader/${novel.id}/${novel.chapters[0].id}`);
    } else {
      message.warning('该小说暂无章节');
    }
  };

  const handleCommentSubmit = async (values: { content: string }) => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    try {
      await api.post('/comments', { novelId: id, content: values.content });
      message.success('评论成功');
      commentForm.resetFields();
      fetchComments();
    } catch (error: any) {
      message.error(error.response?.data?.error || '评论失败');
    }
  };

  const handleReplySubmit = async (values: { content: string }) => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    if (!replyingCommentId) return;
    try {
      await api.post('/comments/reply', { parentId: replyingCommentId, content: values.content, novelId: id });
      message.success('回复成功');
      replyForm.resetFields();
      setReplyingCommentId(null);
      fetchComments();
    } catch (error: any) {
      message.error(error.response?.data?.error || '回复失败');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    try {
      await api.delete(`/comments/${commentId}`);
      message.success('删除成功');
      fetchComments();
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleReportComment = (commentId: number) => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setReportingCommentId(commentId);
    setReportModalVisible(true);
  };

  const handleReportSubmit = async () => {
    if (!reportingCommentId) return;
    try {
      await api.post('/comments/report', { commentId: reportingCommentId, reason: reportReason });
      message.success('举报成功');
      setReportModalVisible(false);
      setReportReason('');
      setReportingCommentId(null);
    } catch (error: any) {
      message.error(error.response?.data?.error || '举报失败');
    }
  };

  if (!novel) return null;

  return (
    <div>
      <Card loading={loading}>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            {novel.cover ? (
              <img
                alt={novel.title}
                src={novel.cover}
                style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8 }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: 400,
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8
              }}>
                <BookOutlined style={{ fontSize: 64, color: '#999' }} />
              </div>
            )}
          </Col>
          <Col xs={24} md={16}>
            <Title level={2}>{novel.title}</Title>
            <Space style={{ marginBottom: 16 }}>
              <Text type="secondary">作者：{novel.author.username}</Text>
              <Tag color="blue">{novel.category}</Tag>
              <Tag color={novel.status === 'COMPLETED' ? 'green' : 'orange'}>
                {novel.status === 'COMPLETED' ? '已完结' : novel.status === 'PUBLISHED' ? '连载中' : '草稿'}
              </Tag>
            </Space>
            <Space style={{ marginBottom: 16 }}>
              <span><ReadOutlined /> {novel.views} 阅读</span>
              <span><HeartOutlined /> {novel.favorites} 收藏</span>
            </Space>
            <div style={{ 
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: 24
            }}>
              <Paragraph>{novel.description || '暂无简介'}</Paragraph>
            </div>
            <Space>
              <Button type="primary" size="large" icon={<ReadOutlined />} onClick={startReading}>
                开始阅读
              </Button>
              <Button size="large" icon={<PlusOutlined />} onClick={addToBookshelf}>
                加入书架
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card title="目录" style={{ marginTop: 24 }}>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
          dataSource={novel.chapters}
          renderItem={(chapter) => (
            <List.Item>
              <Card
                hoverable
                size="small"
                onClick={() => navigate(`/reader/${novel.id}/${chapter.id}`)}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  第{chapter.chapterNumber}章 {chapter.title}
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Card title="评论" style={{ marginTop: 24 }}>
        <Form form={commentForm} onFinish={handleCommentSubmit} layout="vertical">
          <Form.Item name="content" rules={[{ required: true, message: '请输入评论内容' }]}>
            <Input.TextArea rows={4} placeholder="写下你的评论..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
              发布评论
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        {comments.length > 0 ? (
          <List
            dataSource={comments}
            renderItem={(comment) => (
              <List.Item key={comment.id}>
                <List.Item.Meta
                  avatar={<Avatar src={comment.user.avatar}>{comment.user.username.charAt(0)}</Avatar>}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{comment.user.username}</span>
                      <span style={{ fontSize: 12, color: '#999' }}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                  }
                  description={comment.content}
                />
                <div style={{ marginTop: 8, marginLeft: 48 }}>
                  <Space size="small">
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => setReplyingCommentId(comment.id === replyingCommentId ? null : comment.id)}
                    >
                      回复
                    </Button>
                    {user && (user.id === comment.user.id || user.role === 'ADMIN') && (
                      <Button 
                        type="link" 
                        size="small" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        删除
                      </Button>
                    )}
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => handleReportComment(comment.id)}
                    >
                      举报
                    </Button>
                  </Space>
                  
                  {replyingCommentId === comment.id && (
                    <Form 
                      form={replyForm} 
                      onFinish={handleReplySubmit} 
                      layout="vertical" 
                      style={{ marginTop: 12, padding: 12, background: '#f9f9f9', borderRadius: 4 }}
                    >
                      <Form.Item name="content" rules={[{ required: true, message: '请输入回复内容' }]}>
                        <Input.TextArea rows={2} placeholder="写下你的回复..." />
                      </Form.Item>
                      <Form.Item>
                        <Space>
                          <Button type="primary" htmlType="submit" size="small">
                            回复
                          </Button>
                          <Button size="small" onClick={() => setReplyingCommentId(null)}>
                            取消
                          </Button>
                        </Space>
                      </Form.Item>
                    </Form>
                  )}
                  
                  {comment.children && comment.children.length > 0 && (
                    <List
                      dataSource={comment.children}
                      style={{ marginTop: 12 }}
                      renderItem={(reply) => (
                        <List.Item key={reply.id}>
                          <List.Item.Meta
                            avatar={<Avatar src={reply.user.avatar}>{reply.user.username.charAt(0)}</Avatar>}
                            title={
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{reply.user.username}</span>
                                <span style={{ fontSize: 12, color: '#999' }}>
                                  {new Date(reply.createdAt).toLocaleString()}
                                </span>
                              </div>
                            }
                            description={reply.content}
                          />
                          <div style={{ marginLeft: 48 }}>
                            <Space size="small">
                              {user && (user.id === reply.user.id || user.role === 'ADMIN') && (
                                <Button 
                                  type="link" 
                                  size="small" 
                                  danger 
                                  icon={<DeleteOutlined />} 
                                  onClick={() => handleDeleteComment(reply.id)}
                                >
                                  删除
                                </Button>
                              )}
                              <Button 
                                type="link" 
                                size="small" 
                                onClick={() => handleReportComment(reply.id)}
                              >
                                举报
                              </Button>
                            </Space>
                          </div>
                        </List.Item>
                      )}
                    />
                  )}
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">暂无评论，快来发表第一条评论吧！</Text>
        )}
      </Card>

      <Modal
        title="举报评论"
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        onOk={handleReportSubmit}
      >
        <Input.TextArea 
          rows={4} 
          placeholder="请输入举报原因"
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
