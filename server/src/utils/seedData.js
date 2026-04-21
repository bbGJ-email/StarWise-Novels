const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('开始创建示例数据...');

  try {
    // 清空现有数据
    await prisma.bookshelfItem.deleteMany();
    await prisma.chapter.deleteMany();
    await prisma.novel.deleteMany();
    await prisma.user.deleteMany();

    console.log('已清空现有数据');

    // 创建用户
    const hashedPassword = await bcrypt.hash('123456', 10);

    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@starwise.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    const author = await prisma.user.create({
      data: {
        username: '星空作家',
        email: 'author@starwise.com',
        password: hashedPassword,
        role: 'AUTHOR'
      }
    });

    const user = await prisma.user.create({
      data: {
        username: '普通读者',
        email: 'user@starwise.com',
        password: hashedPassword,
        role: 'USER'
      }
    });

    console.log('用户创建完成');

    // 创建小说
    const novelsData = [
      {
        title: '星神之路',
        description: '一个普通少年意外获得星神传承，从此踏上逆天之路，横扫诸天万界！',
        category: '玄幻',
        tags: ['玄幻', '修仙', '爽文'],
        status: 'PUBLISHED',
        authorId: author.id
      },
      {
        title: '都市至尊神医',
        description: '绝世神医回归都市，一手银针治百病，一双铁拳打天下！',
        category: '都市',
        tags: ['都市', '神医', '热血'],
        status: 'PUBLISHED',
        authorId: author.id
      },
      {
        title: '星际穿越指南',
        description: '未来世界，人类开启星际探索，一位年轻的探险家踏上了未知的征途...',
        category: '科幻',
        tags: ['科幻', '星际', '冒险'],
        status: 'PUBLISHED',
        authorId: author.id
      }
    ];

    const novels = [];
    for (const novelData of novelsData) {
      const novel = await prisma.novel.create({ 
        data: {
          ...novelData,
          tags: JSON.stringify(novelData.tags)
        }
      });
      novels.push(novel);
      console.log(`已创建小说: ${novel.title}`);
    }

    // 创建章节
    const chapterTitles = [
      '第一章 初遇',
      '第二章 觉醒',
      '第三章 试炼',
      '第四章 冲突',
      '第五章 突破'
    ];

    for (const novel of novels) {
      for (let i = 0; i < chapterTitles.length; i++) {
        await prisma.chapter.create({
          data: {
            novelId: novel.id,
            title: chapterTitles[i],
            chapterNumber: i + 1,
            status: 'PUBLISHED',
            content: `这是《${novel.title}》的${chapterTitles[i]}内容。

故事从这里开始...

（此处为章节正文，在实际使用中可以添加更多内容。）

---
本章完，敬请期待下一章！`
          }
        });
      }
      console.log(`已为《${novel.title}》创建 ${chapterTitles.length} 章`);
    }

    // 添加一些到书架
    await prisma.bookshelfItem.create({
      data: {
        userId: user.id,
        novelId: novels[0].id
      }
    });

    console.log('示例数据创建完成！');
    console.log('\n测试账号:');
    console.log('管理员: admin@starwise.com / 123456');
    console.log('作者: author@starwise.com / 123456');
    console.log('普通用户: user@starwise.com / 123456');

  } catch (error) {
    console.error('创建示例数据失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
