# 哩修 AI影像助手 - 生产环境部署包

> 自动学习修图剪辑教程，一键美化照片视频 🎨✨

## 📂 完整文件清单（31个文件）

```
lixiu-deploy/
├── docker-compose.prod.yml       ← 16服务编排（核心8+exporter6+prometheus+grafana）
├── .env.production               ← 生产环境变量（密钥已预填）
├── .env.example                  ← 密钥脱敏模板
├── deploy.sh                     ← 8步一键部署（SSL自动获取+健康检查+系统验证）
│
├── backend/
│   ├── Dockerfile.prod           ← 多阶段构建（builder→runtime, 非root, HEALTHCHECK）
│   ├── Dockerfile.crawler        ← Chrome+ChromeDriver+Selenium
│   ├── requirements.txt          ← FastAPI/Celery/Pillow/Motor
│   ├── crawler_requirements.txt  ← httpx/BS4/Selenium
│   ├── middleware/security.py    ← RateLimiter + SecurityMiddleware + InputValidator
│   ├── utils/logger.py           ← 统一日志（JSON格式/按天轮转/ELK就绪/5种日志文件）
│   ├── utils/notifier.py         ← 通知系统（邮件/钉钉/飞书/企业微信）
│   └── db/init.js                ← 10集合 + 全索引 + 12模板 + 3技能 + 3用户 + 系统配置
│
├── frontend/
│   ├── Dockerfile                ← node:20 build → nginx:alpine serve
│   └── src/
│       ├── index.html            ← 首页（v2.5, 30种滤镜/智能对话/开发者后台/爬虫系统）
│       └── health.html           ← 健康检查页（6服务状态/4指标/30秒自动刷新）
│
├── nginx/
│   ├── nginx.conf                ← 生产版（SSL/OCSP/HSTS/4层限流/JSON日志/防盗链/metrics）
│   └── certbot.conf              ← Let's Encrypt 验证配置
│
├── monitoring/
│   ├── prometheus.yml            ← 8个scrape targets
│   ├── alerts.yml                ← 8条告警规则（API/内存/磁盘/Redis/Mongo/Celery/爬虫）
│   └── grafana/
│       ├── datasources/         ← 自动配置数据源
│       └── dashboards/          ← 6面板系统监控仪表板
│
├── scripts/
│   ├── backup.sh                 ← MongoDB+Redis+文件+配置四合一备份（30天轮转）
│   ├── restore.sh                ← 一键恢复（确认后覆盖恢复）
│   ├── ssl-setup.sh             ← SSL自动获取 + crontab续期
│   └── crontab                  ← 定时任务（备份/清理/SSL/健康检查/磁盘）
│
└── logs/                         ← 日志目录（Docker volume映射）
```

## 🚀 快速部署（Linux服务器）

```bash
git clone https://github.com/lixiu-ohye/lixiu-deploy.git /opt/lixiu
cd /opt/lixiu
cp .env.production .env
bash deploy.sh
```

## 🔧 本地开发（WSL2）

```bash
git clone https://github.com/lixiu-ohye/lixiu-deploy.git ~/lixiu-deploy
cd ~/lixiu-deploy
cp .env.production .env
bash deploy.sh
```

## 🎯 密钥清单

所有密钥已预填在 `.env.production`，部署前检查即可。
- OpenAI API Key: 使用 DeepSeek API
- Redis/MongoDB/Grafana 密码：`lixiu_xxx_2026`
- 开发者后台：`lixiu-ohye` / `myy123456`

## 📊 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 网站 | https://lixiu.ai | 主站（配置域名后） |
| 系统状态 | https://lixiu.ai/health | 6服务+4指标监控页 |
| Grafana | http://localhost:3000 | 系统监控仪表板 |
| Prometheus | http://localhost:9090 | 指标数据 |