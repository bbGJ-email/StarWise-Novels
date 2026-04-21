require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const novelRoutes = require('./routes/novelRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const bookshelfRoutes = require('./routes/bookshelfRoutes');
const readingHistoryRoutes = require('./routes/readingHistoryRoutes');
const authorApplicationRoutes = require('./routes/authorApplicationRoutes');
const commentRoutes = require('./routes/commentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/users', userRoutes);
app.use('/api/novels', novelRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/bookshelf', bookshelfRoutes);
app.use('/api/reading-history', readingHistoryRoutes);
app.use('/api/author-application', authorApplicationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/announcements', announcementRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '星智文学后端服务运行正常' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`星智文学后端服务运行在 http://0.0.0.0:${PORT}`);
  console.log(`可通过 http://localhost:${PORT} 访问`);
});
