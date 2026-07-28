# ==========================================
# 哩修 AI影像助手 - 数据库初始化脚本（完整版）
# ==========================================

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
  print(` ✅ ${col}`);
});

// ========== 2. 索引 ==========
print('');
print('📇 创建索引...');

db.templates.createIndex({ category: 1, usage_count: -1 });
db.templates.createIndex({ tags: 1 });
db.templates.createIndex({ created_at: -1 });
db.templates.createIndex({ name: 'text', description: 'text' });

db.tutorials.createIndex({ platform: 1, type: 1 });
db.tutorials.createIndex({ title: 'text', content: 'text', tags: 'text' });
db.tutorials.createIndex({ learned_at: -1 });
db.tutorials.createIndex({ tutorial_id: 1 }, { unique: true, sparse: true });

db.skills.createIndex({ category: 1, success_rate: -1 });
db.skills.createIndex({ platform: 1 });
db.skills.createIndex({ name: 'text', description: 'text' });

db.tasks.createIndex({ task_id: 1 }, { unique: true });
db.tasks.createIndex({ status: 1, created_at: -1 });
db.tasks.createIndex({ user_id: 1, created_at: -1 });
db.tasks.createIndex({ type: 1, status: 1 });
db.tasks.createIndex({ completed_at: 1 }, { expireAfterSeconds: 86400, sparse: true });

db.users.createIndex({ email: 1 }, { unique: true, sparse: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ created_at: -1 });

db.feedback.createIndex({ task_id: 1 });
db.feedback.createIndex({ rating: -1 });
db.feedback.createIndex({ created_at: -1 });

db.learning_logs.createIndex({ timestamp: -1 });
db.learning_logs.createIndex({ platform: 1, status: 1 });
db.learning_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

print(' ✅ 全部索引创建完成');

// ========== 3. 默认模板（12个）==========
print('');
print('📝 插入默认模板...');

const defaultTemplates = [
  { template_id: 'tpl_beauty_natural', name: '自然美颜', category: 'beauty', subcategory: 'daily', type: 'portrait',
    description: '适合日常自拍，效果自然不夸张，保留皮肤质感', params: { smooth: 40, whiten: 25, sharpen: 20, big_eyes: 15, slim_face: 20, slim_nose: 10 },
    filter: { name: 'natural', intensity: 30 }, tags: ['自然', '日常', '自拍', '新手推荐'], difficulty: 'easy', usage_count: 0, rating: 4.5, reviews: 128, is_active: true, created_at: new Date(), updated_at: new Date() },
  { template_id: 'tpl_beauty_premium', name: '精致奶油肌', category: 'beauty', subcategory: 'premium', type: 'portrait',
    description: '打造精致奶油肌效果，适合重要场合和写真', params: { smooth: 55, whiten: 35, sharpen: 30, big_eyes: 20, slim_face: 30, slim_nose: 15, whiten_teeth: 10, eye_bag_remove: 15 },
    filter: { name: 'cream_skin', intensity: 55 }, tags: ['精致', '奶油肌', '高级感', '写真'], difficulty: 'medium', usage_count: 0, rating: 4.8, reviews: 256, is_active: true, created_at: new Date(), updated_at: new Date() },
  { template_id: 'tpl_beauty_quick', name: '一键快修', category: 'beauty', subcategory: 'quick', type: 'portrait',
    description: '快速美化，3秒出片，适合紧急分享', params: { smooth: 45, whiten: 30, big_eyes: 10, slim_face: 15 },
    filter: { name: 'auto_enhance', intensity: 40 }, tags: ['快速', '一键', '分享'], difficulty: 'easy', usage_count: 0, rating: 4.3, reviews: 89, is_active: true, created_at: new Date(), updated_at: new Date() },
  { template_id: 'tpl_style_japanese', name: '日系清新', category: 'style', subcategory: 'japanese', type: 'portrait',
    description: '日系清新风格，适合户外和旅行照片', params: { smooth: 35, whiten: 20, sharpen: 10, big_eyes: 30, slim_face: 15 },
    filter: { name: 'pink_mist', intensity: 45 }, color_grade: { temperature: -5, tint: 8, saturation: -10, brightness: 5 },
    tags: ['日系', '清新', '户外', '旅行'], difficulty: 'medium', usage_count: 0, rating: 4.4, reviews: 167, is_active: true, created_at: new Date(), updated_at: new Date() },
  { template_id: 'tpl_style_korean', name: '韩系水光肌', category: 'style', subcategory: 'korean', type: 'portrait',
    description: '韩系水光肌效果，透亮有光泽', params: { smooth: 60, whiten: 45, big_eyes: 20, slim_face: 35, v_face: 20 },
    filter: { name: 'cool_white', intensity: 60 }, color_grade: { temperature: -10, tint: 5, saturation: -5, brightness: 10, contrast: 5 },
    tags: ['韩系', '水光肌', '透亮', '偶像'], difficulty: 'medium', usage_count: 0, rating: 4.7, reviews: 203, is_active: true, created_at: new Date(), updated_at: new Date() },
  { template_id: 'tpl_style_vintage', name: '复古胶片', category: 'style', subcategory: 'vintage', type: 'portrait',
    description: '复古胶片风格，怀旧氛围感', params: { smooth: 25, sharpen: 40 },
    filter: { name: 'vintage', intensity: 65 }, color_grade: { temperature: 15, saturation: -20, contrast: 15, grain: 25, vignette: 30 },
    tags: ['复古', '胶片', '怀旧', '氛围感'], difficulty: 'hard', usage_count: 0, rating: 4.6, reviews: 145, is_active: true, created_at: new Date(), updated_at: new Date() },
  { template_id: 'tpl_filter_sunset', name: '日落暖阳', category: 'filter', subcategory: 'warm', type: 'landscape',
    description: '温暖日落色调，适合风景和逆光人像', filter: { name: 'warm_sun', intensity: 50 },
    color_grade: { temperature: 20, tint: 10, saturation: 15, brightness: -5, contrast: 10, highlights: -10, shadows: 15 },
    tags: ['日落', '暖色调', '逆光', '风景'], difficulty: 'easy', usage_count: 0, rating: 4.8, reviews: 312, is_active: true, created_at: new Date(), updated_at: new Date() },
  { template_id: 'tpl_filter_cool', name: '清冷蓝调', category: 'filter', subcategory: 'cool', type: 'landscape',
    description: '清冷蓝调，适合城市夜景和海洋', filter: { name: 'cool_blue', intensity: 55 },
    color_grade: { temperature: -25, tint: -5, saturation: -10, brightness: 5, contrast: 20, highlights: 10, shadows: -10 },
    tags: ['蓝调', '清冷', '夜景', '海洋'], difficulty: 'easy', usage_count: 0, rating: 4.5, reviews: 189, is_active: true, created_at: new Date(), updated_at: new Date() },
  { template_id: 'tpl_vlog_daily', name: '日常Vlog', category: 'vlog', subcategory: 'daily', type: 'video',
    description: '日常Vlog模板，自动转场和配乐', params: { transitions: 'fade', transition_duration: 0.5, music: 'vlog_daily_bgm', music_volume: 0.3, speed: 1.0, max_duration: 60, auto_subtitle: true, subtitle_style: 'minimal' },
    effects: ['fade_in', 'fade_out'], tags: ['Vlog', '日常', '快速', '自动'], difficulty: 'easy', usage_count: 0, rating: 4.3, reviews: 98, is_active: true, created_at: new Date(), updated_at: new Date() },
  { template_id: 'tpl_vlog_travel', name: '旅行Vlog', category: 'vlog', subcategory: 'travel', type: 'video',
    description: '旅行Vlog模板，电影感转场', params: { transitions: 'cinematic', transition_duration: 0.8, music: 'travel_adventure', music_volume: 0.4, speed: 1.0, max_duration: 180, auto_subtitle: true, subtitle_style: 'elegant', color_grade: 'travel_warm' },
    effects: ['zoom_in', 'pan', 'slow_motion_intro'], tags: ['旅行', '电影感', 'Vlog'], difficulty: 'medium', usage_count: 0, rating: 4.6, reviews: 156, is_active: true, created_at: new Date(), updated_at: new Date() },
  { template_id: 'tpl_beat_fast', name: '快节奏卡点', category: 'beat', subcategory: 'fast', type: 'video',
    description: '快节奏卡点，适合舞蹈和运动视频', params: { beat_detection: true, bpm_range: '120-160', transition_speed: 'fast', clip_duration: 'auto', music: 'beat_fast_edm', music_volume: 0.5 },
    effects: ['flash', 'zoom_pulse', 'glitch'], tags: ['卡点', '快节奏', '舞蹈', '运动'], difficulty: 'hard', usage_count: 0, rating: 4.9, reviews: 267, is_active: true, created_at: new Date(), updated_at: new Date() },
  { template_id: 'tpl_beat_slow', name: '慢节奏氛围', category: 'beat', subcategory: 'slow', type: 'video',
    description: '慢节奏卡点，适合情绪和氛围视频', params: { beat_detection: true, bpm_range: '60-90', transition_speed: 'slow', clip_duration: 'auto', music: 'beat_slow_lofi', music_volume: 0.35 },
    effects: ['slow_fade', 'light_leak', 'film_grain'], tags: ['慢节奏', '氛围', '情绪', 'Lofi'], difficulty: 'medium', usage_count: 0, rating: 4.5, reviews: 134, is_active: true, created_at: new Date(), updated_at: new Date() }
];

let insertedCount = 0;
defaultTemplates.forEach(t => {
  if (!db.templates.findOne({ template_id: t.template_id })) {
    db.templates.insertOne(t); insertedCount++;
  }
});
print(` ✅ 插入 ${insertedCount} 个新模板（共 ${defaultTemplates.length} 个）`);

// ========== 4. 初始技能 ==========
print('');
print('🧠 插入初始AI技能...');

const initialSkills = [
  { name: '人像精修-奶油肌', category: 'beauty', platform: '小红书',
    description: '学习自小红书热门教程，打造精致奶油肌效果',
    steps: [{ order: 1, action: '磨皮', tool: '醒图', params: { intensity: 55 } }, { order: 2, action: '美白', tool: '醒图', params: { intensity: 35 } }, { order: 3, action: '大眼', tool: '醒图', params: { intensity: 20 } }, { order: 4, action: '瘦脸', tool: '醒图', params: { intensity: 30 } }, { order: 5, action: '锐化', tool: '醒图', params: { intensity: 30 } }],
    source_tutorial: '小红书-精致奶油肌教程', source_url: 'https://www.xiaohongshu.com/explore/xxxxx', success_rate: 98.5, usage_count: 0, created_at: new Date() },
  { name: '日落氛围调色', category: 'filter', platform: '抖音',
    description: '温暖日落色调，适合风景和逆光人像',
    steps: [{ order: 1, action: '色温+20', tool: '醒图', params: { temperature: 20 } }, { order: 2, action: '饱和度+15', tool: '醒图', params: { saturation: 15 } }, { order: 3, action: '对比度+10', tool: '醒图', params: { contrast: 10 } }, { order: 4, action: '高光-10', tool: '醒图', params: { highlights: -10 } }],
    source_tutorial: '抖音-日落调色参数', source_url: 'https://www.douyin.com/video/xxxxx', success_rate: 96.8, usage_count: 0, created_at: new Date() },
  { name: 'Vlog快剪-自动转场', category: 'vlog', platform: 'B站',
    description: '自动添加转场和背景音乐',
    steps: [{ order: 1, action: '导入素材', tool: '剪映', params: {} }, { order: 2, action: '智能分割', tool: '剪映', params: { method: 'scene_detect' } }, { order: 3, action: '添加转场', tool: '剪映', params: { type: 'fade', duration: 0.5 } }, { order: 4, action: '添加BGM', tool: '剪映', params: { category: 'vlog' } }, { order: 5, action: '自动字幕', tool: '剪映', params: { lang: 'zh' } }],
    source_tutorial: 'B站-Vlog剪辑教程', source_url: 'https://www.bilibili.com/video/xxxxx', success_rate: 94.2, usage_count: 0, created_at: new Date() },
];

let skillCount = 0;
initialSkills.forEach(s => {
  if (!db.skills.findOne({ name: s.name })) { db.skills.insertOne(s); skillCount++; }
});
print(` ✅ 插入 ${skillCount} 个初始技能`);

// ========== 5. 系统配置 ==========
print('');
print('⚙️ 插入系统配置...');

db.system_config.insertOne({
  key: 'system_settings', version: '3.0.0', app_name: '哩修 AI影像助手',
  settings: {
    max_upload_size: 524288000, max_batch_size: 10, processing_timeout: 600,
    auto_learning_interval: 21600, skill_cleanup_days: 30, feedback_threshold: 3.5,
    supported_formats: { images: ['jpg','jpeg','png','webp','heic'], videos: ['mp4','mov','avi','mkv'] },
    ai_models: { tutorial_parser: 'gpt-4-vision-preview', image_analyzer: 'gpt-4-vision-preview', video_analyzer: 'gpt-4-vision-preview' },
    platforms: [
      { id: 'xiaohongshu', name: '小红书', enabled: true },
      { id: 'douyin', name: '抖音', enabled: true },
      { id: 'bilibili', name: 'B站', enabled: true }
    ]
  },
  created_at: new Date(), updated_at: new Date()
});
print(' ✅ 系统配置完成');

// ========== 6. 数据库用户 ==========
print('');
print('👤 创建数据库用户...');

db.createUser({ user: 'lixiu_app', pwd: 'myy123456', roles: [{ role: 'readWrite', db: 'lixiu' }] });
db.createUser({ user: 'lixiu_reader', pwd: 'myy123456', roles: [{ role: 'read', db: 'lixiu' }] });
print(' ✅ 用户创建完成');

// ========== 7. 统计 ==========
print('');
print('📊 初始化统计数据...');

db.createCollection('stats');
db.stats.insertOne({ total_processed: 0, total_learned: initialSkills.length, total_templates: defaultTemplates.length, total_users: 0, average_rating: 0, last_updated: new Date() });
print(' ✅ 统计数据初始化完成');

// ========== 总结 ==========
print('');
print('='.repeat(50));
print('🎉 数据库初始化完成！');
print('='.repeat(50));
print('');
print(` 📦 集合数量: ${collections.length + 1}`);
print(` 📝 默认模板: ${defaultTemplates.length} 个`);
print(` 🧠 初始技能: ${initialSkills.length} 个`);
print(` ⚙️ 系统配置: 1 份`);
print(` 👤 数据库用户: 2 个`);
print('');
print('⚠️ 请立即修改生产环境密码！');
