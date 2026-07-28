// ==========================================
// 哩修 AI影像助手 - 数据库初始化脚本
// ==========================================

db = db.getSiblingDB('lixiu');

print('🗄️ 开始初始化数据库...');
print('');

// ========== 1. 创建集合 ==========
print('📦 创建集合...');

const collections = [
  'templates', 'tutorials', 'skills', 'tasks', 'users',
  'feedback', 'learning_logs', 'system_config', 'api_keys', 'sessions'
];

collections.forEach(col => {
  db.createCollection(col);
  print(` ✅ 创建集合: ${col}`);
});

// ========== 2. 创建索引 ==========
print('');
print('📇 创建索引...');

db.templates.createIndex({ category: 1, usage_count: -1 });
db.templates.createIndex({ tags: 1 });
db.templates.createIndex({ created_at: -1 });
db.templates.createIndex({ name: 'text', description: 'text' });
print(' ✅ templates 索引');

db.tutorials.createIndex({ platform: 1, type: 1 });
db.tutorials.createIndex({ title: 'text', content: 'text', tags: 'text' });
db.tutorials.createIndex({ learned_at: -1 });
db.tutorials.createIndex({ tutorial_id: 1 }, { unique: true, sparse: true });
print(' ✅ tutorials 索引');

db.skills.createIndex({ category: 1, success_rate: -1 });
db.skills.createIndex({ platform: 1 });
db.skills.createIndex({ created_at: -1 });
db.skills.createIndex({ name: 'text', description: 'text' });
print(' ✅ skills 索引');

db.tasks.createIndex({ task_id: 1 }, { unique: true });
db.tasks.createIndex({ status: 1, created_at: -1 });
db.tasks.createIndex({ user_id: 1, created_at: -1 });
db.tasks.createIndex({ type: 1, status: 1 });
db.tasks.createIndex({ completed_at: 1 }, { expireAfterSeconds: 86400, sparse: true });
print(' ✅ tasks 索引');

db.users.createIndex({ email: 1 }, { unique: true, sparse: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ created_at: -1 });
print(' ✅ users 索引');

db.feedback.createIndex({ task_id: 1 });
db.feedback.createIndex({ rating: -1 });
db.feedback.createIndex({ created_at: -1 });
print(' ✅ feedback 索引');

db.learning_logs.createIndex({ timestamp: -1 });
db.learning_logs.createIndex({ platform: 1, status: 1 });
db.learning_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 2592000 });
print(' ✅ learning_logs 索引');

// ========== 3. 插入默认模板 ==========
print('');
print('📝 插入默认模板...');

const defaultTemplates = [
  // 美颜类
  {
    template_id: 'tpl_beauty_natural',
    name: '自然美颜',
    category: 'beauty', subcategory: 'daily', type: 'portrait',
    description: '适合日常自拍，效果自然不夸张，保留皮肤质感',
    thumbnail: '/templates/natural.jpg',
    params: { smooth: 40, whiten: 25, sharpen: 20, big_eyes: 15, slim_face: 20, slim_nose: 10 },
    filter: { name: 'natural', intensity: 30 },
    tags: ['自然', '日常', '自拍', '新手推荐'], difficulty: 'easy',
    usage_count: 0, rating: 4.5, reviews: 128, is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    template_id: 'tpl_beauty_premium',
    name: '精致奶油肌',
    category: 'beauty', subcategory: 'premium', type: 'portrait',
    description: '打造精致奶油肌效果，适合重要场合和写真',
    thumbnail: '/templates/premium.jpg',
    params: { smooth: 55, whiten: 35, sharpen: 30, big_eyes: 20, slim_face: 30, slim_nose: 15, whiten_teeth: 10, eye_bag_remove: 15 },
    filter: { name: 'cream_skin', intensity: 55 },
    tags: ['精致', '奶油肌', '高级感', '写真'], difficulty: 'medium',
    usage_count: 0, rating: 4.8, reviews: 256, is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    template_id: 'tpl_beauty_quick',
    name: '一键快修',
    category: 'beauty', subcategory: 'quick', type: 'portrait',
    description: '快速美化，3秒出片，适合紧急分享',
    thumbnail: '/templates/quick.jpg',
    params: { smooth: 45, whiten: 30, big_eyes: 10, slim_face: 15 },
    filter: { name: 'auto_enhance', intensity: 40 },
    tags: ['快速', '一键', '分享'], difficulty: 'easy',
    usage_count: 0, rating: 4.3, reviews: 89, is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  // 风格类
  {
    template_id: 'tpl_style_japanese',
    name: '日系清新',
    category: 'style', subcategory: 'japanese', type: 'portrait',
    description: '日系清新风格，适合户外和旅行照片',
    thumbnail: '/templates/japanese.jpg',
    params: { smooth: 35, whiten: 20, sharpen: 10, big_eyes: 30, slim_face: 15 },
    filter: { name: 'pink_mist', intensity: 45 },
    color_grade: { temperature: -5, tint: 8, saturation: -10, brightness: 5 },
    tags: ['日系', '清新', '户外', '旅行'], difficulty: 'medium',
    usage_count: 0, rating: 4.4, reviews: 167, is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    template_id: 'tpl_style_korean',
    name: '韩系水光肌',
    category: 'style', subcategory: 'korean', type: 'portrait',
    description: '韩系水光肌效果，透亮有光泽',
    thumbnail: '/templates/korean.jpg',
    params: { smooth: 60, whiten: 45, big_eyes: 20, slim_face: 35, v_face: 20 },
    filter: { name: 'cool_white', intensity: 60 },
    color_grade: { temperature: -10, tint: 5, saturation: -5, brightness: 10, contrast: 5 },
    tags: ['韩系', '水光肌', '透亮', '偶像'], difficulty: 'medium',
    usage_count: 0, rating: 4.7, reviews: 203, is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    template_id: 'tpl_style_vintage',
    name: '复古胶片',
    category: 'style', subcategory: 'vintage', type: 'portrait',
    description: '复古胶片风格，怀旧氛围感',
    thumbnail: '/templates/vintage.jpg',
    params: { smooth: 25, sharpen: 40 },
    filter: { name: 'vintage', intensity: 65 },
    color_grade: { temperature: 15, saturation: -20, contrast: 15, grain: 25, vignette: 30 },
    tags: ['复古', '胶片', '怀旧', '氛围感'], difficulty: 'hard',
    usage_count: 0, rating: 4.6, reviews: 145, is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  // 滤镜类
  {
    template_id: 'tpl_filter_sunset',
    name: '日落暖阳',
    category: 'filter', subcategory: 'warm', type: 'landscape',
    description: '温暖日落色调，适合风景和逆光人像',
    thumbnail: '/templates/sunset.jpg',
    filter: { name: 'warm_sun', intensity: 50 },
    color_grade: { temperature: 20, tint: 10, saturation: 15, brightness: -5, contrast: 10, highlights: -10, shadows: 15 },
    tags: ['日落', '暖色调', '逆光', '风景'], difficulty: 'easy',
    usage_count: 0, rating: 4.8, reviews: 312, is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    template_id: 'tpl_filter_cool',
    name: '清冷蓝调',
    category: 'filter', subcategory: 'cool', type: 'landscape',
    description: '清冷蓝调，适合城市夜景和海洋',
    thumbnail: '/templates/cool.jpg',
    filter: { name: 'cool_blue', intensity: 55 },
    color_grade: { temperature: -25, tint: -5, saturation: -10, brightness: 5, contrast: 20, highlights: 10, shadows: -10 },
    tags: ['蓝调', '清冷', '夜景', '海洋'], difficulty: 'easy',
    usage_count: 0, rating: 4.5, reviews: 189, is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  // Vlog类
  {
    template_id: 'tpl_vlog_daily',
    name: '日常Vlog',
    category: 'vlog', subcategory: 'daily', type: 'video',
    description: '日常Vlog模板，自动转场和配乐',
    thumbnail: '/templates/vlog_daily.jpg',
    params: { transitions: 'fade', transition_duration: 0.5, music: 'vlog_daily_bgm', music_volume: 0.3, speed: 1.0, max_duration: 60, auto_subtitle: true, subtitle_style: 'minimal' },
    effects: ['fade_in', 'fade_out'],
    tags: ['Vlog', '日常', '快速', '自动'], difficulty: 'easy',
    usage_count: 0, rating: 4.3, reviews: 98, is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    template_id: 'tpl_vlog_travel',
    name: '旅行Vlog',
    category: 'vlog', subcategory: 'travel', type: 'video',
    description: '旅行Vlog模板，电影感转场',
    thumbnail: '/templates/vlog_travel.jpg',
    params: { transitions: 'cinematic', transition_duration: 0.8, music: 'travel_adventure', music_volume: 0.4, speed: 1.0, max_duration: 180, auto_subtitle: true, subtitle_style: 'elegant', color_grade: 'travel_warm' },
    effects: ['zoom_in', 'pan', 'slow_motion_intro'],
    tags: ['旅行', '电影感', 'Vlog'], difficulty: 'medium',
    usage_count: 0, rating: 4.6, reviews: 156, is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  // 卡点类
  {
    template_id: 'tpl_beat_fast',
    name: '快节奏卡点',
    category: 'beat', subcategory: 'fast', type: 'video',
    description: '快节奏卡点，适合舞蹈和运动视频',
    thumbnail: '/templates/beat_fast.jpg',
    params: { beat_detection: true, bpm_range: '120-160', transition_speed: 'fast', clip_duration: 'auto', music: 'beat_fast_edm', music_volume: 0.5 },
    effects: ['flash', 'zoom_pulse', 'glitch'],
    tags: ['卡点', '快节奏', '舞蹈', '运动'], difficulty: 'hard',
    usage_count: 0, rating: 4.9, reviews: 267, is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    template_id: 'tpl_beat_slow',
    name: '慢节奏氛围',
    category: 'beat', subcategory: 'slow', type: 'video',
    description: '慢节奏卡点，适合情绪和氛围视频',
    thumbnail: '/templates/beat_slow.jpg',
    params: { beat_detection: true, bpm_range: '60-90', transition_speed: 'slow', clip_duration: 'auto', music: 'beat_slow_lofi', music_volume: 0.35 },
    effects: ['slow_fade', 'light_leak', 'film_grain'],
    tags: ['慢节奏', '氛围', '情绪', 'Lofi'], difficulty: 'medium',
    usage_count: 0, rating: 4.5, reviews: 134, is_active: true,
    created_at: new Date(), updated_at: new Date()
  }
];

let insertedCount = 0;
defaultTemplates.forEach(t => {
  const exists = db.templates.findOne({ template_id: t.template_id });
  if (!exists) {
    db.templates.insertOne(t);
    insertedCount++;
  }
});
print(` ✅ 插入 ${insertedCount} 个默认模板`);

// ========== 4. 创建管理员 ==========
print('');
print('👤 创建管理员用户...');

db.createUser({
  user: 'lixiu_admin',
  pwd: 'your-password-here',
  roles: [
    { role: 'readWrite', db: 'lixiu' },
    { role: 'dbAdmin', db: 'lixiu' }
  ]
});
print(' ✅ 管理员用户创建');

// ========== 5. 系统配置 ==========
print('');
print('⚙️ 初始化系统配置...');

db.system_config.insertOne({
  key: 'system_settings',
  value: {
    version: '2.5.0',
    max_upload_size: 524288000,
    supported_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'avi'],
    max_concurrent_tasks: 10,
    task_timeout: 300,
    auto_cleanup_days: 7,
    features: {
      portrait_enhance: true,
      batch_processing: true,
      video_editing: true,
      auto_learning: true,
      crawler_enabled: true
    }
  },
  created_at: new Date(),
  updated_at: new Date()
});
print(' ✅ 系统配置初始化');

print('');
print('==================================');
print('✅ 数据库初始化完成！');
print(`📊 集合数: ${collections.length}`);
print(`📝 模板数: ${defaultTemplates.length}`);
print('==================================');
