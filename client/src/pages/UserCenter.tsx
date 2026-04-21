import { useState, useEffect } from 'react';
import { Card, List, Typography, Tabs, Button, message, Avatar, Empty, Form, Input, Modal } from 'antd';
import { BookOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAppStore } from '../store';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface BookshelfItem {
  id: number;
  novel: {
    id: number;
    title: string;
    cover?: string;
    description?: string;
    author: { username: string };
  };
  addedAt: string;
}

interface ReadingHistoryItem {
  id: number;
  novel: {
    id: number;
    title: string;
    cover?: string;
    author: { username: string };
  };
  chapter: {
    id: number;
    title: string;
    chapterNumber: number;
  };
  readAt: string;
}

export default function UserCenter() {
  const [bookshelf, setBookshelf] = useState<BookshelfItem[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchBookshelf();
      fetchReadingHistory();
      fetchApplicationStatus();
    }
  }, [user]);

  const fetchApplicationStatus = async () => {
    try {
      const response = await api.get('/author-application/status');
      setApplication(response.data);
    } catch (error) {
      console.error('获取申请状态失败:', error);
    }
  };

  const handleSubmitApplication = async (values: any) => {
    try {
      await api.post('/author-application/submit', values);
      message.success('申请提交成功，等待审核');
      setIsModalOpen(false);
      form.resetFields();
      fetchApplicationStatus();
    } catch (error: any) {
      message.error(error.response?.data?.message || '申请提交失败');
    }
  };

  const fetchBookshelf = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookshelf');
      setBookshelf(response.data);
    } catch (error) {
      console.error('获取书架失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReadingHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reading-history');
      setReadingHistory(response.data);
    } catch (error) {
      console.error('获取阅读历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromBookshelf = async (id: number) => {
    try {
      await api.delete(`/bookshelf/${id}`);
      message.success('已从书架移除');
      fetchBookshelf();
    } catch (error: any) {
      message.error(error.response?.data?.error || '移除失败');
    }
  };

  const tabItems = [
    {
      key: '1',
      label: '我的书架',
      children: (
        <List
          loading={loading}
          dataSource={bookshelf}
          locale={{ emptyText: <Empty description="书架空空如也" /> }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => navigate(`/novel/${item.novel.id}`)}>查看</Button>,
                <Button type="link" danger icon={<DeleteOutlined />} onClick={() => removeFromBookshelf(item.id)}>移除</Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  item.novel.cover ? (
                    <Avatar src={item.novel.cover} shape="square" size={64} />
                  ) : (
                    <Avatar icon={<BookOutlined />} shape="square" size={64} />
                  )
                }
                title={<a onClick={() => navigate(`/novel/${item.novel.id}`)}>{item.novel.title}</a>}
                description={
                  <>
                    <Text type="secondary">作者：{item.novel.author.username}</Text>
                    <br />
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Text type="secondary">{item.novel.description}</Text>
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: '2',
      label: '阅读历史',
      children: (
        <List
          loading={loading}
          dataSource={readingHistory}
          locale={{ emptyText: <Empty description="暂无阅读历史" /> }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  onClick={() => navigate(`/reader/${item.novel.id}/${item.chapter.id}`)}
                >
                  继续阅读
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  item.novel.cover ? (
                    <Avatar src={item.novel.cover} shape="square" size={64} />
                  ) : (
                    <Avatar icon={<BookOutlined />} shape="square" size={64} />
                  )
                }
                title={<a onClick={() => navigate(`/novel/${item.novel.id}`)}>{item.novel.title}</a>}
                description={
                  <>
                    <Text type="secondary">作者：{item.novel.author.username}</Text>
                    <br />
                    <Text type="secondary">读到：第{item.chapter.chapterNumber}章 {item.chapter.title}</Text>
                    <br />
                    <Text type="secondary">阅读时间：{new Date(item.readAt).toLocaleString()}</Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: '3',
      label: '个人资料',
      children: (
        <Card>
          <Title level={4}>基本信息</Title>
          <p>用户名：{user?.username}</p>
          <p>邮箱：{user?.email}</p>
          <p>角色：{user?.role === 'ADMIN' ? '管理员' : user?.role === 'AUTHOR' ? '作者' : '普通用户'}</p>
          
          <Title level={4} style={{ marginTop: 24 }}>作家申请</Title>
          {user?.role === 'USER' && (
            <div>
              {application ? (
                <div style={{ marginBottom: 16 }}>
                  <p>申请状态：
                    <Text type={
                      application.status === 'PENDING' ? 'warning' :
                      application.status === 'APPROVED' ? 'success' : 'danger'
                    }>
                      {application.status === 'PENDING' ? '待审核' :
                       application.status === 'APPROVED' ? '已通过' : '已拒绝'}
                    </Text>
                  </p>
                  {application.status === 'PENDING' && (
                    <p>申请时间：{new Date(application.createdAt).toLocaleString()}</p>
                  )}
                </div>
              ) : (
                <Button 
                  type="primary" 
                  icon={<UserAddOutlined />}
                  onClick={() => setIsModalOpen(true)}
                >
                  申请成为作家
                </Button>
              )}
            </div>
          )}
          {user?.role === 'AUTHOR' && (
            <p style={{ color: '#52c41a' }}>您已经是作家，可以开始创作小说了！</p>
          )}
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>个人中心</Title>
      <Tabs defaultActiveKey="1" items={tabItems} />
      
      <Modal
        title="申请成为作家"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmitApplication}
        >
          <Form.Item
            name="penName"
            label="笔名"
            rules={[{ required: true, message: '请输入笔名' }]}
          >
            <Input placeholder="请输入您的笔名" />
          </Form.Item>
          
          <Form.Item
            name="introduction"
            label="个人介绍"
            rules={[{ required: true, message: '请输入个人介绍' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请介绍一下您的写作经历和擅长的题材"
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              提交申请
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
