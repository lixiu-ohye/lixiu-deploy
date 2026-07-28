// ?拐耨 AI敶勗??拇? - ?唳摨?憪?
db = db.getSiblingDB('lixiu');

db.createCollection('templates');
db.createCollection('tutorials');
db.createCollection('skills');
db.createCollection('tasks');
db.createCollection('users');
db.createCollection('feedback');
db.createCollection('learning_logs');

// 蝝Ｗ?
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

// 暺恕璅⊥
db.templates.insertMany([
  {
    name: '?芰蝢?',
    category: 'beauty',
    type: 'portrait',
    description: '???亙虜?芣?嚗???嗡?憭詨?',
    params: { smooth: 40, whiten: 25, big_eyes: 15, slim_face: 20 },
    tags: ['?芰', '?亙虜', '?芣?'],
    usage_count: 0, rating: 4.5, created_at: new Date()
  },
  {
    name: '蝎曇憟嗆硃??,
    category: 'beauty',
    type: 'portrait',
    description: '蝎曇憟嗆硃?????????箏?',
    params: { smooth: 55, whiten: 35, big_eyes: 20, slim_face: 30, sharpen: 30 },
    tags: ['蝎曇', '憟嗆硃??, '擃漣??],
    usage_count: 0, rating: 4.8, created_at: new Date()
  },
  {
    name: '?亦頂皜',
    category: 'style',
    type: 'portrait',
    description: '?亦頂皜憌嚗??瑕??抒?',
    params: { smooth: 35, whiten: 20, filter: 'pink_mist', intensity: 45 },
    tags: ['?亦頂', '皜', '?瑕?'],
    usage_count: 0, rating: 4.3, created_at: new Date()
  },
  {
    name: '?拍頂瘞游???,
    category: 'style',
    type: 'portrait',
    description: '?拍頂瘞游??????漁??瘜?,
    params: { smooth: 60, whiten: 45, filter: 'cool_white', intensity: 60 },
    tags: ['?拍頂', '瘞游???, '?漁'],
    usage_count: 0, rating: 4.6, created_at: new Date()
  },
  {
    name: 'Vlog敹怠',
    category: 'vlog',
    type: 'video',
    description: '敹恍log?芾?嚗?刻蓮?箏???',
    params: { transitions: 'fade', music: 'vlog_default', speed: 1.0, duration: 60 },
    tags: ['Vlog', '敹恍?, '?亙虜'],
    usage_count: 0, rating: 4.2, created_at: new Date()
  },
  {
    name: '?∠閫?',
    category: 'beat',
    type: 'video',
    description: '?芸?∠?芾?嚗??喃?蝐餉?憸?,
    params: { beat_detection: true, transition_speed: 'fast', effects: ['flash', 'zoom'] },
    tags: ['?∠', '?喃?', '?恍'],
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

print('???唳摨?憪?摰?嚗?);
print('?? 撌脣?撱粹??? templates, tutorials, skills, tasks, users, feedback, learning_logs');
print('?? 撌脫??仿?霈斗芋?? 6 銝?);
