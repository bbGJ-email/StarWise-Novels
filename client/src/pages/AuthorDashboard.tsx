import { useState, useEffect } from 'react';
import { Card, List, Button, Modal, Form, Input, Select, message, Typography, Space, Tag, Empty, Upload, Progress, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, BookOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAppStore } from '../store';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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
  createdAt: string;
  _count: { chapters: number };
}

const categories = ['玄幻', '仙侠', '都市', '言情', '科幻', '悬疑', '历史', '其他'];
const statusOptions = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '已完结', value: 'COMPLETED' },
];

export default function AuthorDashboard() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [coverModalVisible, setCoverModalVisible] = useState(false);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [currentNovel, setCurrentNovel] = useState<Novel | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form] = Form.useForm();
  const { user } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchMyNovels();
  }, [user]);

  const fetchMyNovels = async () => {
    setLoading(true);
    try {
      const response = await api.get('/novels/my');
      setNovels(response.data);
    } catch (error) {
      console.error('获取我的小说失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingNovel(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (novel: Novel) => {
    setEditingNovel(novel);
    form.setFieldsValue({
      ...novel,
      tags: novel.tags?.join(', ') || '',
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      };

      if (editingNovel) {
        await api.put(`/novels/${editingNovel.id}`, data);
        message.success('更新成功');
      } else {
        await api.post('/novels', data);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchMyNovels();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'green';
      case 'COMPLETED': return 'blue';
      default: return 'orange';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return '已发布';
      case 'COMPLETED': return '已完结';
      default: return '草稿';
    }
  };

  const handleUploadCover = (novel: Novel) => {
    setCurrentNovel(novel);
    setCoverModalVisible(true);
  };

  const handleCoverUpload = async (file: any) => {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('cover', file);

    try {
      const response = await api.post(`/novels/${currentNovel?.id}/cover`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          setUploadProgress(percentCompleted);
        },
      });

      message.success('封面上传成功');
      setCoverModalVisible(false);
      fetchMyNovels();
    } catch (error: any) {
      message.error(error.response?.data?.error || '上传失败');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/novels/${id}`);
      message.success('小说删除成功');
      fetchMyNovels();
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>作者后台</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建小说
        </Button>
      </div>

      {/* 数据统计 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card>
          <Text strong>总小说数</Text>
          <div style={{ fontSize: 24, marginTop: 8 }}>{novels.length}</div>
        </Card>
        <Card>
          <Text strong>总章节数</Text>
          <div style={{ fontSize: 24, marginTop: 8 }}>
            {novels.reduce((sum, novel) => sum + (novel._count?.chapters || 0), 0)}
          </div>
        </Card>
        <Card>
          <Text strong>总阅读量</Text>
          <div style={{ fontSize: 24, marginTop: 8 }}>
            {novels.reduce((sum, novel) => sum + (novel.views || 0), 0)}
          </div>
        </Card>
        <Card>
          <Text strong>总收藏量</Text>
          <div style={{ fontSize: 24, marginTop: 8 }}>
            {novels.reduce((sum, novel) => sum + (novel.favorites || 0), 0)}
          </div>
        </Card>
      </div>

      <Card>
        <List
          loading={loading}
          dataSource={novels}
          locale={{ emptyText: <Empty description="还没有创建任何小说" /> }}
          renderItem={(novel) => (
            <List.Item
              actions={[
                <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(novel)}>编辑</Button>,
                <Button type="link" icon={<UploadOutlined />} onClick={() => handleUploadCover(novel)}>上传封面</Button>,
                <Button type="link" onClick={() => navigate(`/author/novel/${novel.id}/chapters`)}>章节管理</Button>,
                <Button type="link" onClick={() => navigate(`/novel/${novel.id}`)}>查看</Button>,
                <Popconfirm
                  title="确定要删除这部小说吗？删除后无法恢复。"
                  onConfirm={() => handleDelete(novel.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={
                  novel.cover ? (
                    <img src={novel.cover} alt="" style={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 4 }} />
                  ) : (
                    <div style={{ 
                      width: 80, 
                      height: 100, 
                      background: '#f0f0f0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      borderRadius: 4
                    }}>
                      <BookOutlined style={{ fontSize: 32, color: '#999' }} />
                    </div>
                  )
                }
                title={
                  <Space>
                    <Text strong>{novel.title}</Text>
                    <Tag color={getStatusColor(novel.status)}>{getStatusText(novel.status)}</Tag>
                  </Space>
                }
                description={
                  <>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Text type="secondary">{novel.description}</Text>
                    </div>
                    <br />
                    <Space>
                      <Text type="secondary">分类：{novel.category}</Text>
                      <Text type="secondary">章节数：{novel._count.chapters}</Text>
                    </Space>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={editingNovel ? '编辑小说' : '新建小说'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="书名" rules={[{ required: true, message: '请输入书名' }]}>
            <Input placeholder="请输入书名" />
          </Form.Item>

          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="请选择分类">
              {categories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Input placeholder="多个标签用逗号分隔" />
          </Form.Item>

          <Form.Item name="status" label="状态">
            <Select>
              {statusOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="简介">
            <TextArea rows={4} placeholder="请输入小说简介" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingNovel ? '保存' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 封面上传模态框 */}
      <Modal
        title="上传封面"
        open={coverModalVisible}
        onCancel={() => setCoverModalVisible(false)}
        footer={null}
        width={400}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {currentNovel?.cover ? (
            <img 
              src={currentNovel.cover} 
              alt="当前封面" 
              style={{ 
                width: 160, 
                height: 200, 
                objectFit: 'cover', 
                borderRadius: 4,
                marginBottom: 16
              }} 
            />
          ) : (
            <div style={{ 
              width: 160, 
              height: 200, 
              background: '#f0f0f0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: 4,
              margin: '0 auto 16px'
            }}>
              <BookOutlined style={{ fontSize: 64, color: '#999' }} />
            </div>
          )}
          <Typography.Text>{currentNovel?.title}</Typography.Text>
        </div>

        {uploading && (
          <Progress percent={uploadProgress} status="active" style={{ marginBottom: 24 }} />
        )}

        <Upload
          name="cover"
          showUploadList={false}
          beforeUpload={(file) => {
            handleCoverUpload(file);
            return false;
          }}
          maxCount={1}
          disabled={uploading}
        >
          <Button 
            type="primary" 
            icon={<UploadOutlined />} 
            disabled={uploading}
            style={{ width: '100%' }}
          >
            {uploading ? '上传中...' : '选择图片'}
          </Button>
        </Upload>

        <div style={{ marginTop: 16, textAlign: 'center', color: '#999' }}>
          <Typography.Text type="secondary">支持 JPEG、PNG、GIF 格式，最大 5MB</Typography.Text>
        </div>
      </Modal>
    </div>
  );
}
