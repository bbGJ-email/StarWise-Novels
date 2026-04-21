import { useState, useEffect } from 'react';
import { Row, Col, Card, List, Typography, Tag, Input, Select, Pagination } from 'antd';
import { BookOutlined, EyeOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const { Title } = Typography;
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

const categories = ['全部', '玄幻', '仙侠', '都市', '言情', '科幻', '悬疑', '历史', '其他'];

export default function NovelList() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNovels();
  }, [selectedCategory, searchText, page]);

  const fetchNovels = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: pageSize };
      if (selectedCategory !== '全部') params.category = selectedCategory;
      if (searchText) params.search = searchText;
      
      const response = await api.get('/novels', { params });
      setNovels(response.data.novels);
      setTotal(response.data.total);
    } catch (error) {
      console.error('获取小说列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div>
      <Title level={2}>小说库</Title>
      
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
            onChange={(value) => { setSelectedCategory(value); setPage(1); }}
            placeholder="选择分类"
          >
            {categories.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </Col>
      </Row>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
        dataSource={novels}
        loading={loading}
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
                      <Typography.Text type="secondary">作者: {novel.author.username}</Typography.Text>
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

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          showSizeChanger={false}
          showQuickJumper
          showTotal={(total) => `共 ${total} 本小说`}
        />
      </div>
    </div>
  );
}
