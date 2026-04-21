import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Space, message, Select } from 'antd';
import { LeftOutlined, RightOutlined, ArrowLeftOutlined, SettingOutlined } from '@ant-design/icons';
import api from '../api';

const { Title } = Typography;
const { Option } = Select;

interface Chapter {
  id: number;
  novelId: number;
  title: string;
  content: string;
  chapterNumber: number;
  novel: { id: number; title: string; chapters: Array<{ id: number; chapterNumber: number }> };
}

const backgrounds = [
  { name: '米白', color: '#fdf6e3' },
  { name: '护眼绿', color: '#e8f5e9' },
  { name: '夜间黑', color: '#1a1a1a' },
  { name: '羊皮纸', color: '#f5f0e1' },
];

const fontSizes = [14, 16, 18, 20, 22];

export default function Reader() {
  const { novelId, chapterId } = useParams<{ novelId: string; chapterId: string }>();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [bgColor, setBgColor] = useState('#fdf6e3');
  const [fontSize, setFontSize] = useState(18);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (chapterId && novelId) {
      fetchChapter();
      // 记录阅读历史
      addReadingHistory();
    }
  }, [chapterId, novelId]);

  const addReadingHistory = async () => {
    try {
      await api.post('/reading-history', {
        novelId: parseInt(novelId!),
        chapterId: parseInt(chapterId!)
      });
    } catch (error) {
      console.error('添加阅读历史失败:', error);
    }
  };

  const fetchChapter = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/chapters/${chapterId}`);
      setChapter(response.data);
    } catch (error) {
      console.error('获取章节失败:', error);
      message.error('获取章节失败');
    } finally {
      setLoading(false);
    }
  };

  const getPrevChapter = () => {
    if (!chapter || !chapter.novel.chapters) return null;
    const chapters = chapter.novel.chapters;
    const currentIndex = chapters.findIndex(c => c.id === parseInt(chapterId!));
    return currentIndex > 0 ? chapters[currentIndex - 1] : null;
  };

  const getNextChapter = () => {
    if (!chapter || !chapter.novel.chapters) return null;
    const chapters = chapter.novel.chapters;
    const currentIndex = chapters.findIndex(c => c.id === parseInt(chapterId!));
    return currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
  };

  const prevChapter = chapter ? getPrevChapter() : null;
  const nextChapter = chapter ? getNextChapter() : null;

  const isDark = bgColor === '#1a1a1a';
  const textColor = isDark ? '#e0e0e0' : '#333';

  return (
    <div style={{ 
      background: bgColor, 
      minHeight: 'calc(100vh - 112px)',
      padding: '24px 48px',
      transition: 'background 0.3s'
    }}>
      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(`/novel/${novelId}`)}
          style={{ marginBottom: 16, background: isDark ? '#333' : '#fff', color: textColor, borderColor: isDark ? '#444' : '#d9d9d9' }}
        >
          返回书籍
        </Button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3} style={{ color: textColor, margin: 0 }}>
              {chapter?.novel.title}
            </Title>
            <Title level={4} style={{ color: textColor, margin: '8px 0 0 0' }}>
              第{chapter?.chapterNumber}章 {chapter?.title}
            </Title>
          </div>
          
          <Button 
            icon={<SettingOutlined />} 
            onClick={() => setShowSettings(!showSettings)}
            style={{ background: isDark ? '#333' : '#fff', color: textColor, borderColor: isDark ? '#444' : '#d9d9d9' }}
          >
            阅读设置
          </Button>
        </div>

        {showSettings && (
          <Card style={{ marginTop: 16, background: isDark ? '#2a2a2a' : '#fff', border: isDark ? '1px solid #444' : '1px solid #d9d9d9' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <span style={{ color: textColor, marginRight: 16 }}>背景色：</span>
                <Space>
                  {backgrounds.map(bg => (
                    <Button
                      key={bg.name}
                      style={{ background: bg.color, width: 80, color: bg.color === '#1a1a1a' ? '#fff' : '#333' }}
                      onClick={() => setBgColor(bg.color)}
                    >
                      {bg.name}
                    </Button>
                  ))}
                </Space>
              </div>
              <div>
                <span style={{ color: textColor, marginRight: 16 }}>字号：</span>
                <Select
                  value={fontSize}
                  onChange={setFontSize}
                  style={{ width: 120 }}
                >
                  {fontSizes.map(size => (
                    <Option key={size} value={size}>{size}px</Option>
                  ))}
                </Select>
              </div>
            </Space>
          </Card>
        )}
      </div>

      <Card 
        loading={loading}
        style={{ 
          background: 'transparent', 
          border: 'none',
          boxShadow: 'none'
        }}
      >
        <div style={{ 
          fontSize, 
          lineHeight: 1.8,
          color: textColor,
          maxWidth: 800,
          margin: '0 auto'
        }} dangerouslySetInnerHTML={{ __html: chapter?.content || '' }}>
        </div>
      </Card>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: 48,
        gap: 16
      }}>
        <Button 
          size="large"
          icon={<LeftOutlined />}
          disabled={!prevChapter}
          onClick={() => prevChapter && navigate(`/reader/${novelId}/${prevChapter.id}`)}
          style={{ background: isDark ? '#333' : '#fff', color: textColor, borderColor: isDark ? '#444' : '#d9d9d9' }}
        >
          上一章
        </Button>
        <Button 
          type="primary"
          size="large"
          icon={<RightOutlined />}
          disabled={!nextChapter}
          onClick={() => nextChapter && navigate(`/reader/${novelId}/${nextChapter.id}`)}
        >
          下一章
        </Button>
      </div>
    </div>
  );
}
