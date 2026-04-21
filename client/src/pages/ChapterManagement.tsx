import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, List, Button, Modal, Form, Input, Select, message, Typography, Space, Tag, Empty } from 'antd';
import { PlusOutlined, EditOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api';
import RichTextEditor from '../components/RichTextEditor';

const { Title, Text } = Typography;
const { Option } = Select;

interface Chapter {
  id: number;
  novelId: number;
  title: string;
  content: string;
  chapterNumber: number;
  status: string;
  createdAt: string;
}

interface Novel {
  id: number;
  title: string;
}

const statusOptions = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
];

export default function ChapterManagement() {
  const { novelId } = useParams<{ novelId: string }>();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    if (novelId) {
      fetchNovelDetail();
      fetchChapters();
    }
  }, [novelId]);

  const fetchNovelDetail = async () => {
    try {
      const response = await api.get(`/novels/${novelId}`);
      setNovel({ id: response.data.id, title: response.data.title });
    } catch (error) {
      console.error('获取小说详情失败:', error);
    }
  };

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/chapters/novel/${novelId}`);
      setChapters(response.data);
    } catch (error) {
      console.error('获取章节列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingChapter(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    form.setFieldsValue(chapter);
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingChapter) {
        await api.put(`/chapters/${editingChapter.id}`, values);
        message.success('更新成功');
      } else {
        await api.post(`/chapters/novel/${novelId}`, values);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchChapters();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个章节吗？',
      onOk: async () => {
        try {
          await api.delete(`/chapters/${id}`);
          message.success('删除成功');
          fetchChapters();
        } catch (error: any) {
          message.error(error.response?.data?.error || '删除失败');
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'PUBLISHED' ? 'green' : 'orange';
  };

  const getStatusText = (status: string) => {
    return status === 'PUBLISHED' ? '已发布' : '草稿';
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/author')}
          style={{ marginBottom: 16 }}
        >
          返回作者后台
        </Button>
        <Title level={2}>章节管理 - {novel?.title}</Title>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Text>共 {chapters.length} 章</Text>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建章节
          </Button>
        </div>

        <List
          loading={loading}
          dataSource={chapters}
          locale={{ emptyText: <Empty description="还没有创建任何章节" /> }}
          renderItem={(chapter) => (
            <List.Item
              actions={[
                <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(chapter)}>编辑</Button>,
                <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(chapter.id)}>删除</Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>第{chapter.chapterNumber}章 {chapter.title}</Text>
                    <Tag color={getStatusColor(chapter.status)}>{getStatusText(chapter.status)}</Tag>
                  </Space>
                }
                description={
                  <>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Text type="secondary">{chapter.content ? chapter.content.substring(0, 100) + '...' : '暂无内容'}</Text>
                    </div>
                    <br />
                    <Text type="secondary">创建时间：{new Date(chapter.createdAt).toLocaleString()}</Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={editingChapter ? '编辑章节' : '新建章节'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="章节标题" rules={[{ required: true, message: '请输入章节标题' }]}>
            <Input placeholder="请输入章节标题" />
          </Form.Item>

          <Form.Item name="status" label="状态">
            <Select>
              {statusOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="content" label="章节内容" rules={[{ required: true, message: '请输入章节内容' }]}>
            <RichTextEditor 
              value={form.getFieldValue('content') || ''} 
              onChange={(value) => form.setFieldsValue({ content: value })} 
              placeholder="请输入章节内容" 
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingChapter ? '保存' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
