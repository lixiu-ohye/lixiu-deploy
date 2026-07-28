// 哩修 AI影像助手 - 数据库初始化
db = db.getSiblingDB('lixiu');

db.createCollection('templates');
db.createCollection('tutorials');
db.createCollection('skills');
db.createCollection('tasks');
db.createCollection('users');
db.createCollection('feedback');
db.createCollection('learning_logs');

// 索引
db.templates.createIndex({ category: 1, usage_count: -1 });
db.templates.createIndex({ tags: 1 });
db.templates.createIndex({ created_at: -1 });
db.tutorials.createIndex({ platform: 1, type: 1 });
db.tutorials.createIndex({ title: 'text', content: 'text' });
db.tutorials.createIndex({ learned_at: -1 });
db.skills.createIndex({ category: 1, success_rate: -1 });
db.skills.createIndex({ platform: 1 });
db.tasks.createIndex({ task_id: 1 }, { unique: true });
db.tasks.createIndex({ status: 1, created_at: -1 });
db.tasks.createIndex({ user_id: 1 });
db.feedback.createIndex({ task_id: 1 });
db.feedback.createIndex({ rating: -1 });

// 默认模板
db.templates.insertMany([
  {
    name: '自然美颜',
    category: 'beauty',
    type: 'portrait',
    description: '适合日常自拍，效果自然不夸张',
    params: { smooth: 40, whiten: 25, big_eyes: 15, slim_face: 20 },
    tags: ['自然', '日常', '自拍'],
    usage_count: 0, rating: 4.5, created_at: new Date()
  },
  {
    name: '精致奶油肌',
    category: 'beauty',
    type: 'portrait',
    description: '精致奶油肌效果，适合重要场合',
    params: { smooth: 55, whiten: 35, big_eyes: 20, slim_face: 30, sharpen: 30 },
    tags: ['精致', '奶油肌', '高级感'],
    usage_count: 0, rating: 4.8, created_at: new Date()
  },
  {
    name: '日系清新',
    category: 'style',
    type: 'portrait',
    description: '日系清新风格，适合户外照片',
    params: { smooth: 35, whiten: 20, filter: 'pink_mist', intensity: 45 },
    tags: ['日系', '清新', '户外'],
    usage_count: 0, rating: 4.3, created_at: new Date()
  },
  {
    name: '韩系水光肌',
    category: 'style',
    type: 'portrait',
    description: '韩系水光肌效果，透亮有光泽',
    params: { smooth: 60, whiten: 45, filter: 'cool_white', intensity: 60 },
    tags: ['韩系', '水光肌', '透亮'],
    usage_count: 0, rating: 4.6, created_at: new Date()
  },
  {
    name: 'Vlog快剪',
    category: 'vlog',
    type: 'video',
    description: '快速Vlog剪辑，自动转场和配乐',
    params: { transitions: 'fade', music: 'vlog_default', speed: 1.0, duration: 60 },
    tags: ['Vlog', '快速', '日常'],
    usage_count: 0, rating: 4.2, created_at: new Date()
  },
  {
    name: '卡点视频',
    category: 'beat',
    type: 'video',
    description: '自动卡点剪辑，适合音乐类视频',
    params: { beat_detection: true, transition_speed: 'fast', effects: ['flash', 'zoom'] },
    tags: ['卡点', '音乐', '炫酷'],
    usage_count: 0, rating: 4.7, created_at: new Date()
  }
]);

db.createUser({
  user: 'lixiu_admin',
  pwd: 'your-password-here',
  roles: [
    { role: 'readWrite', db: 'lixiu' },
    { role: 'dbAdmin', db: 'lixiu' }
  ]
});

print('✅ 数据库初始化完成！');
print('📊 已创建集合: templates, tutorials, skills, tasks, users, feedback, learning_logs');
print('📝 已插入默认模板: 6 个');
