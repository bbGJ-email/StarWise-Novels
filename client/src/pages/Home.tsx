import { useState, useEffect } from 'react';
import { Row, Col, Card, List, Typography, Tag, Input, Select, Carousel, Button, Modal, Badge } from 'antd';
import { BookOutlined, EyeOutlined, HeartOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Novel {
  id: number;
  title: string;
  cover?: string;
  description?: string;
  category: string;
  tags: string[];
  views: number;
  favorites: number;
  author: { id: number; username: string };
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const categories = ['全部', '玄幻', '仙侠', '都市', '言情', '科幻', '悬疑', '历史', '其他'];

export default function Home() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [hotNovels, setHotNovels] = useState<Novel[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [announcementModalVisible, setAnnouncementModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNovels();
    fetchHotNovels();
    fetchAnnouncement();
  }, [selectedCategory, searchText]);

  const fetchAnnouncement = async () => {
    try {
      const response = await api.get('/announcements/active');
      if (response.data) {
        setAnnouncement(response.data);
        // 检查是否需要自动弹出公告
        checkAnnouncementPopup();
      }
    } catch (error) {
      console.error('获取公告失败:', error);
    }
  };

  const checkAnnouncementPopup = () => {
    if (announcement) {
      const lastAnnouncementId = localStorage.getItem('lastAnnouncementId');
      if (lastAnnouncementId !== announcement.id.toString()) {
        // 新公告，自动弹出
        setAnnouncementModalVisible(true);
        // 记录已查看的公告ID
        localStorage.setItem('lastAnnouncementId', announcement.id.toString());
      }
    }
  };

  const handleShowAnnouncement = () => {
    setAnnouncementModalVisible(true);
  };

  const fetchNovels = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCategory !== '全部') params.category = selectedCategory;
      if (searchText) params.search = searchText;
      
      const response = await api.get('/novels', { params });
      setNovels(response.data.novels);
    } catch (error) {
      console.error('获取小说列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotNovels = async () => {
    try {
      const response = await api.get('/novels/hot');
      setHotNovels(response.data);
    } catch (error) {
      console.error('获取热门小说失败:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>欢迎来到星智文学</Title>
        {announcement && (
          <Badge dot={true}>
            <Button 
              type="primary" 
              icon={<BellOutlined />} 
              onClick={handleShowAnnouncement}
            >
              公告
            </Button>
          </Badge>
        )}
      </div>
      
      {/* 轮播图推荐 */}
      <Carousel autoplay style={{ marginBottom: 24, height: 300 }}>
        {novels.slice(0, 3).map((novel) => (
          <div key={novel.id} style={{ position: 'relative', height: '100%' }}>
            <div 
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '0 40px',
                color: 'white'
              }}
              onClick={() => navigate(`/novel/${novel.id}`)}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 24, marginBottom: 16 }}>{novel.title}</h3>
                <p style={{ marginBottom: 16, opacity: 0.9 }}>{novel.description?.substring(0, 100)}...</p>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span>作者：{novel.author.username}</span>
                  <span>分类：{novel.category}</span>
                </div>
              </div>
              <div style={{ width: 120, height: 180 }}>
                {novel.cover ? (
                  <img 
                    src={novel.cover} 
                    alt={novel.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8
                  }}>
                    <BookOutlined style={{ fontSize: 48 }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Search
            placeholder="搜索小说或作者"
            allowClear
            enterButton="搜索"
            size="large"
            onSearch={handleSearch}
          />
        </Col>
        <Col xs={24} md={12}>
          <Select
            style={{ width: '100%' }}
            size="large"
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="选择分类"
          >
            {categories.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card title="最新小说" loading={loading}>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
              dataSource={novels}
              renderItem={(novel) => (
                <List.Item>
                  <Card
                    hoverable
                    cover={
                      novel.cover ? (
                        <img alt={novel.title} src={novel.cover} style={{ height: 200, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ height: 200, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BookOutlined style={{ fontSize: 48, color: '#999' }} />
                        </div>
                      )
                    }
                    onClick={() => navigate(`/novel/${novel.id}`)}
                  >
                    <Card.Meta
                      title={
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {novel.title}
                        </div>
                      }
                      description={
                        <>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Text type="secondary">作者: {novel.author.username}</Text>
                          </div>
                          <div style={{ marginTop: 8 }}>
                            {novel.tags.slice(0, 2).map(tag => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </div>
                          <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
                            <span><EyeOutlined /> {novel.views}</span>
                            <span><HeartOutlined /> {novel.favorites}</span>
                          </div>
                        </>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="热门榜单">
            <List
              dataSource={hotNovels}
              renderItem={(novel, index) => (
                <List.Item onClick={() => navigate(`/novel/${novel.id}`)} style={{ cursor: 'pointer' }}>
                  <List.Item.Meta
                    avatar={
                      <div style={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        background: index < 3 ? '#ff4d4f' : '#d9d9d9',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: 12
                      }}>
                        {index + 1}
                      </div>
                    }
                    title={
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {novel.title}
                      </div>
                    }
                    description={
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Text type="secondary">{novel.author.username}</Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 公告弹窗 */}
      <Modal
        title={announcement?.title}
        open={announcementModalVisible}
        onCancel={() => setAnnouncementModalVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setAnnouncementModalVisible(false)}>
            我知道了
          </Button>
        ]}
        width={600}
      >
        {announcement && (
          <div style={{ lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: announcement.content }} />
        )}
      </Modal>
    </div>
  );
}
