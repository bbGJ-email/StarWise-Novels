import { useState, useEffect } from 'react';
import { Card, Typography, Tabs, Table, Button, Space, message, Modal, Form, Input, Select, Switch, Tag, Empty, Badge } from 'antd';
import { UserOutlined, BookOutlined, DashboardOutlined, DeleteOutlined, EditOutlined, BellOutlined, PlusOutlined, CheckOutlined, CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import RichTextEditor from '../components/RichTextEditor';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Novel {
  id: number;
  title: string;
  author: { id: number; username: string };
  category: string;
  status: string;
  views: number;
  favorites: number;
  createdAt: string;
}

interface AuthorApplication {
  id: number;
  userId: number;
  user: { id: number; username: string; email: string };
  penName: string;
  introduction: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Chapter {
  id: number;
  title: string;
  chapterNumber: number;
  status: string;
  novel: { id: number; title: string; author: { username: string } };
  createdAt: string;
}

interface Comment {
  id: number;
  content: string;
  user: { id: number; username: string };
  novel: { id: number; title: string };
  chapter: { id: number; title: string } | null;
  status: string;
  createdAt: string;
}

interface CommentReport {
  id: number;
  comment: {
    id: number;
    content: string;
    user: { id: number; username: string };
    novel: { id: number; title: string };
  };
  user: { id: number; username: string };
  reason: string;
  status: string;
  createdAt: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const roleOptions = [
  { label: '普通用户', value: 'USER' },
  { label: '作者', value: 'AUTHOR' },
  { label: '管理员', value: 'ADMIN' },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [applications, setApplications] = useState<AuthorApplication[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentReports, setCommentReports] = useState<CommentReport[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [announcementModalVisible, setAnnouncementModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchNovels();
    fetchApplications();
    fetchChapters();
    fetchComments();
    fetchCommentReports();
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('获取公告列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = () => {
    setEditingAnnouncement(null);
    form.resetFields();
    setAnnouncementModalVisible(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    form.setFieldsValue(announcement);
    setAnnouncementModalVisible(true);
  };

  const handleSubmitAnnouncement = async (values: any) => {
    try {
      if (editingAnnouncement) {
        await api.put(`/announcements/${editingAnnouncement.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/announcements', values);
        message.success('创建成功');
      }
      setAnnouncementModalVisible(false);
      fetchAnnouncements();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      await api.delete(`/announcements/${id}`);
      message.success('删除成功');
      fetchAnnouncements();
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleToggleAnnouncement = async (id: number, isActive: boolean) => {
    try {
      if (isActive) {
        await api.put(`/announcements/${id}/activate`);
      } else {
        await api.put(`/announcements/${id}/deactivate`);
      }
      message.success('操作成功');
      fetchAnnouncements();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/comments/admin/pending');
      setComments(response.data.comments);
    } catch (error) {
      console.error('获取待审核评论失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/comments/admin/reports');
      setCommentReports(response.data.reports);
    } catch (error) {
      console.error('获取评论举报失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewComment = async (id: number, status: string) => {
    try {
      await api.put(`/comments/admin/review/${id}`, { status });
      message.success(status === 'APPROVED' ? '审核通过' : '已拒绝');
      fetchComments();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleCommentReport = async (id: number, status: string, commentStatus?: string) => {
    try {
      await api.put(`/comments/admin/reports/${id}`, { status, commentStatus });
      message.success('处理成功');
      fetchCommentReports();
      if (commentStatus) {
        fetchComments();
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const response = await api.get('/chapters/admin/pending');
      setChapters(response.data);
    } catch (error) {
      console.error('获取待审核章节失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewChapter = async (id: number, status: string) => {
    try {
      await api.put(`/chapters/admin/review/${id}`, { status });
      message.success(status === 'APPROVED' ? '审核通过' : '已拒绝');
      fetchChapters();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/author-application/all');
      setApplications(response.data);
    } catch (error) {
      console.error('获取作家申请失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (id: number, status: string) => {
    try {
      await api.post('/author-application/approve', { applicationId: id, status });
      message.success(status === 'APPROVED' ? '审核通过' : '已拒绝');
      fetchApplications();
      fetchUsers(); // 刷新用户列表，因为用户角色可能已更改
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNovels = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/novels');
      setNovels(response.data);
    } catch (error) {
      console.error('获取小说列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setUserModalVisible(true);
  };

  const handleSubmitUser = async (values: any) => {
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/admin/users', values);
        message.success('创建成功');
      }
      setUserModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await api.delete(`/admin/users/${id}`);
      message.success('删除成功');
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleApproveNovel = async (id: number) => {
    try {
      await api.put(`/novels/${id}`, { status: 'PUBLISHED' });
      message.success('审核通过');
      fetchNovels();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleRejectNovel = async (id: number) => {
    try {
      await api.put(`/novels/${id}`, { status: 'DRAFT' });
      message.success('已拒绝');
      fetchNovels();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleDeleteNovel = async (id: number) => {
    try {
      await api.delete(`/novels/${id}`);
      message.success('小说删除成功');
      fetchNovels();
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleMap: any = {
          USER: '普通用户',
          AUTHOR: '作者',
          ADMIN: '管理员'
        };
        return roleMap[role] || role;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditUser(record)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteUser(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  const novelColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <Text strong>{title}</Text>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      render: (author: any) => author.username,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: any = {
          PUBLISHED: '已发布',
          DRAFT: '草稿',
          COMPLETED: '已完结'
        };
        return statusMap[status] || status;
      }
    },
    {
      title: '阅读量',
      dataIndex: 'views',
      key: 'views',
    },
    {
      title: '收藏量',
      dataIndex: 'favorites',
      key: 'favorites',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Novel) => (
        <Space size="middle">
          <Button type="link" onClick={() => navigate(`/novel/${record.id}`)}>查看</Button>
          <Popconfirm
            title="确定要删除这部小说吗？删除后无法恢复。"
            onConfirm={() => handleDeleteNovel(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>管理员后台</Title>
      </div>

      <Tabs defaultActiveKey="dashboard">
        <TabPane tab={<><DashboardOutlined /> 仪表盘</>} key="dashboard">
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <Card size="small">
                <Text strong>用户总数</Text>
                <div style={{ fontSize: 24, marginTop: 8 }}>{users.length}</div>
              </Card>
              <Card size="small">
                <Text strong>小说总数</Text>
                <div style={{ fontSize: 24, marginTop: 8 }}>{novels.length}</div>
              </Card>
              <Card size="small">
                <Text strong>作者数量</Text>
                <div style={{ fontSize: 24, marginTop: 8 }}>{users.filter(u => u.role === 'AUTHOR').length}</div>
              </Card>
            </div>
          </Card>
        </TabPane>

        <TabPane tab={<><UserOutlined /> 用户管理</>} key="users">
          <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" onClick={() => {
                setEditingUser(null);
                form.resetFields();
                setUserModalVisible(true);
              }}>
                新建用户
              </Button>
            </div>
            <Table 
              dataSource={users} 
              columns={userColumns} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<><BookOutlined /> 小说管理</>} key="novels">
          <Card>
            <Table 
              dataSource={novels} 
              columns={novelColumns} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="内容审核" key="review">
          <Card>
            <Tabs defaultActiveKey="novels">
              <TabPane tab="小说审核" key="novels">
                <Table 
                  dataSource={novels.filter(n => n.status === 'DRAFT')} 
                  columns={[
                    ...novelColumns,
                    {
                      title: '操作',
                      key: 'action',
                      render: (_: any, record: Novel) => (
                        <Space size="middle">
                          <Button type="link" onClick={() => navigate(`/novel/${record.id}`)}>查看</Button>
                          <Button type="primary" onClick={() => handleApproveNovel(record.id)}>通过</Button>
                          <Button danger onClick={() => handleRejectNovel(record.id)}>拒绝</Button>
                        </Space>
                      ),
                    },
                  ]} 
                  rowKey="id" 
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: '暂无待审核小说' }}
                />
              </TabPane>
              <TabPane tab="作家申请" key="author-applications">
                <Table 
                  dataSource={applications.filter(a => a.status === 'PENDING')} 
                  columns={[
                    {
                      title: '用户',
                      dataIndex: 'user',
                      key: 'user',
                      render: (user: any) => (
                        <div>
                          <Text strong>{user.username}</Text>
                          <br />
                          <Text type="secondary">{user.email}</Text>
                        </div>
                      ),
                    },
                    {
                      title: '笔名',
                      dataIndex: 'penName',
                      key: 'penName',
                    },
                    {
                      title: '个人介绍',
                      dataIndex: 'introduction',
                      key: 'introduction',
                      render: (intro: string) => (
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2 }}>
                          {intro}
                        </div>
                      ),
                    },
                    {
                      title: '申请时间',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (time: string) => new Date(time).toLocaleString(),
                    },
                    {
                      title: '操作',
                      key: 'action',
                      render: (_: any, record: AuthorApplication) => (
                        <Space size="middle">
                          <Button type="primary" onClick={() => handleApproveApplication(record.id, 'APPROVED')}>通过</Button>
                          <Button danger onClick={() => handleApproveApplication(record.id, 'REJECTED')}>拒绝</Button>
                        </Space>
                      ),
                    },
                  ]} 
                  rowKey="id" 
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: '暂无待审核的作家申请' }}
                />
              </TabPane>
              <TabPane tab="章节审核" key="chapters">
                <Table 
                  dataSource={chapters} 
                  columns={[
                    {
                      title: '章节标题',
                      dataIndex: 'title',
                      key: 'title',
                      render: (title: string) => <Text strong>{title}</Text>,
                    },
                    {
                      title: '章节序号',
                      dataIndex: 'chapterNumber',
                      key: 'chapterNumber',
                    },
                    {
                      title: '所属小说',
                      dataIndex: 'novel',
                      key: 'novel',
                      render: (novel: any) => (
                        <div>
                          <Text strong>{novel.title}</Text>
                          <br />
                          <Text type="secondary">作者: {novel.author.username}</Text>
                        </div>
                      ),
                    },
                    {
                      title: '提交时间',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (time: string) => new Date(time).toLocaleString(),
                    },
                    {
                      title: '操作',
                      key: 'action',
                      render: (_: any, record: Chapter) => (
                        <Space size="middle">
                          <Button type="link" onClick={() => navigate(`/reader/${record.novel.id}/${record.id}`)}>查看</Button>
                          <Button type="primary" onClick={() => handleReviewChapter(record.id, 'APPROVED')}>通过</Button>
                          <Button danger onClick={() => handleReviewChapter(record.id, 'REJECTED')}>拒绝</Button>
                        </Space>
                      ),
                    },
                  ]} 
                  rowKey="id" 
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: '暂无待审核章节' }}
                />
              </TabPane>
              <TabPane tab="评论管理" key="comments">
                <Tabs defaultActiveKey="pending">
                  <TabPane tab="待审核评论" key="pending">
                    <Table 
                      dataSource={comments} 
                      columns={[
                        {
                          title: '评论内容',
                          dataIndex: 'content',
                          key: 'content',
                          render: (content: string) => (
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2 }}>
                              {content}
                            </div>
                          ),
                        },
                        {
                          title: '评论用户',
                          dataIndex: 'user',
                          key: 'user',
                          render: (user: any) => user.username,
                        },
                        {
                          title: '所属小说',
                          dataIndex: 'novel',
                          key: 'novel',
                          render: (novel: any) => (
                            <Text strong>{novel.title}</Text>
                          ),
                        },
                        {
                          title: '所属章节',
                          dataIndex: 'chapter',
                          key: 'chapter',
                          render: (chapter: any) => chapter?.title || '-',
                        },
                        {
                          title: '提交时间',
                          dataIndex: 'createdAt',
                          key: 'createdAt',
                          render: (time: string) => new Date(time).toLocaleString(),
                        },
                        {
                          title: '操作',
                          key: 'action',
                          render: (_: any, record: Comment) => (
                            <Space size="middle">
                              <Button type="primary" onClick={() => handleReviewComment(record.id, 'APPROVED')}>通过</Button>
                              <Button danger onClick={() => handleReviewComment(record.id, 'REJECTED')}>拒绝</Button>
                            </Space>
                          ),
                        },
                      ]} 
                      rowKey="id" 
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                      locale={{ emptyText: '暂无待审核评论' }}
                    />
                  </TabPane>
                  <TabPane tab="评论举报" key="reports">
                    <Table 
                      dataSource={commentReports} 
                      columns={[
                        {
                          title: '被举报评论',
                          dataIndex: 'comment',
                          key: 'comment',
                          render: (comment: any) => (
                            <div>
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2 }}>
                                {comment.content}
                              </div>
                              <Text type="secondary">评论用户: {comment.user.username}</Text>
                              <br />
                              <Text type="secondary">小说: {comment.novel.title}</Text>
                            </div>
                          ),
                        },
                        {
                          title: '举报用户',
                          dataIndex: 'user',
                          key: 'user',
                          render: (user: any) => user.username,
                        },
                        {
                          title: '举报原因',
                          dataIndex: 'reason',
                          key: 'reason',
                          render: (reason: string) => (
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2 }}>
                              {reason}
                            </div>
                          ),
                        },
                        {
                          title: '举报时间',
                          dataIndex: 'createdAt',
                          key: 'createdAt',
                          render: (time: string) => new Date(time).toLocaleString(),
                        },
                        {
                          title: '操作',
                          key: 'action',
                          render: (_: any, record: CommentReport) => (
                            <Space size="middle">
                              <Button type="primary" onClick={() => handleCommentReport(record.id, 'APPROVED', 'REJECTED')}>确认违规</Button>
                              <Button onClick={() => handleCommentReport(record.id, 'REJECTED')}>驳回举报</Button>
                            </Space>
                          ),
                        },
                      ]} 
                      rowKey="id" 
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                      locale={{ emptyText: '暂无评论举报' }}
                    />
                  </TabPane>
                </Tabs>
              </TabPane>
            </Tabs>
          </Card>
        </TabPane>

        <TabPane tab={<><BellOutlined /> 公告管理</>} key="announcements">
          <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateAnnouncement}>
                新建公告
              </Button>
            </div>
            <Table
              loading={loading}
              dataSource={announcements}
              columns={[
                {
                  title: 'ID',
                  dataIndex: 'id',
                  key: 'id',
                },
                {
                  title: '标题',
                  dataIndex: 'title',
                  key: 'title',
                },
                {
                  title: '内容',
                  dataIndex: 'content',
                  key: 'content',
                  render: (content: string) => (
                    <Text ellipsis={{ rows: 2 }}>{content.replace(/<[^>]*>/g, '')}</Text>
                  ),
                },
                {
                  title: '状态',
                  dataIndex: 'isActive',
                  key: 'isActive',
                  render: (isActive: boolean) => (
                    <Tag color={isActive ? 'green' : 'gray'}>
                      {isActive ? '已激活' : '已停用'}
                    </Tag>
                  ),
                },
                {
                  title: '创建时间',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (createdAt: string) => new Date(createdAt).toLocaleString(),
                },
                {
                  title: '更新时间',
                  dataIndex: 'updatedAt',
                  key: 'updatedAt',
                  render: (updatedAt: string) => new Date(updatedAt).toLocaleString(),
                },
                {
                  title: '状态',
                  key: 'status',
                  render: (_: any, record: Announcement) => (
                    <Switch
                      checked={record.isActive}
                      onChange={(checked) => handleToggleAnnouncement(record.id, checked)}
                    />
                  ),
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_: any, record: Announcement) => (
                    <Space>
                      <Button 
                        type="link" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditAnnouncement(record)}
                      >
                        编辑
                      </Button>
                      <Button 
                        danger 
                        type="link" 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDeleteAnnouncement(record.id)}
                      >
                        删除
                      </Button>
                    </Space>
                  ),
                },
              ]}
              rowKey="id"
              locale={{ emptyText: <Empty description="暂无公告" /> }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitUser}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item name="password" label="密码" rules={[{ required: !editingUser, message: '请输入密码' }]}>
            <Input.Password placeholder={editingUser ? '不修改密码请留空' : '请输入密码'} />
          </Form.Item>

          <Form.Item name="role" label="角色">
            <Select>
              {roleOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? '保存' : '创建'}
              </Button>
              <Button onClick={() => setUserModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingAnnouncement ? '编辑公告' : '新建公告'}
        open={announcementModalVisible}
        onCancel={() => setAnnouncementModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitAnnouncement}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入公告标题' }]}>
            <Input placeholder="请输入公告标题" />
          </Form.Item>

          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入公告内容' }]}>
            <RichTextEditor 
              value={form.getFieldValue('content') || ''} 
              onChange={(value) => form.setFieldsValue({ content: value })} 
              placeholder="请输入公告内容" 
            />
          </Form.Item>

          <Form.Item name="isActive" label="状态" valuePropName="checked">
            <Switch checkedChildren="激活" unCheckedChildren="停用" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAnnouncement ? '保存' : '创建'}
              </Button>
              <Button onClick={() => setAnnouncementModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
