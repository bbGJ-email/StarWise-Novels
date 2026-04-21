import { Routes, Route } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { BookOutlined, HomeOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from './store';
import Home from './pages/Home';
import NovelList from './pages/NovelList';
import Login from './pages/Login';
import Register from './pages/Register';
import NovelDetail from './pages/NovelDetail';
import Reader from './pages/Reader';
import UserCenter from './pages/UserCenter';
import AuthorDashboard from './pages/AuthorDashboard';
import ChapterManagement from './pages/ChapterManagement';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

const { Header, Content, Footer } = Layout;

function App() {
  const { user, logout } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: '/novels', icon: <BookOutlined />, label: <Link to="/novels">小说库</Link> },
  ];

  if (user) {
    menuItems.push({
      key: '/user',
      icon: <UserOutlined />,
      label: <Link to="/user">个人中心</Link>,
    });
    if (user.role === 'AUTHOR' || user.role === 'ADMIN') {
      menuItems.push({
        key: '/author',
        icon: <BookOutlined />,
        label: <Link to="/author">作者后台</Link>,
      });
    }
    if (user.role === 'ADMIN') {
      menuItems.push({
        key: '/admin',
        icon: <SettingOutlined />,
        label: <Link to="/admin">管理后台</Link>,
      });
    }
  }

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="logo">星智文学</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="header-menu"
        />
        <div className="header-user">
          {user ? (
            <>
              <span>欢迎，{user.username}</span>
              <a onClick={handleLogout} style={{ marginLeft: 16, color: '#fff', cursor: 'pointer' }}>
                退出
              </a>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#fff', marginRight: 16 }}>登录</Link>
              <Link to="/register" style={{ color: '#fff' }}>注册</Link>
            </>
          )}
        </div>
      </Header>
      <Content className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/novels" element={<NovelList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/novel/:id" element={<NovelDetail />} />
          <Route path="/reader/:novelId/:chapterId" element={<Reader />} />
          <Route path="/user" element={<UserCenter />} />
          <Route path="/author" element={<AuthorDashboard />} />
          <Route path="/author/novel/:novelId/chapters" element={<ChapterManagement />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Content>
      <Footer className="app-footer">
        星智文学 ©{new Date().getFullYear()} Created by 星智计算
      </Footer>
    </Layout>
  );
}

export default App;
