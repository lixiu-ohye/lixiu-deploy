#!/bin/bash
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║ 哩修 AI影像助手 - 生产环境部署脚本     ║"
echo "║ Version 3.0.0                             ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}[1/8] 检查环境...${NC}"
for cmd in docker docker-compose git curl; do
  if ! command -v $cmd &>/dev/null; then echo -e "${RED}错误: $cmd 未安装${NC}"; exit 1; fi
done
AVAILABLE_SPACE=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -lt 10 ]; then echo -e "${RED}磁盘不足: ${AVAILABLE_SPACE}G (需要10G)${NC}"; exit 1; fi
echo -e "${GREEN} ✅ Docker: $(docker --version | awk '{print $3}' | sed 's/,//') 磁盘: ${AVAILABLE_SPACE}G${NC}"

echo -e "${YELLOW}[2/8] 配置环境变量...${NC}"
if [ ! -f .env ]; then
  if [ -f .env.production ]; then
    cp .env.production .env
    echo -e "${GREEN} ✅ 已创建 .env 文件${NC}"
  else
    cp .env.example .env
    echo -e "${YELLOW} ⚠️ 请编辑 .env 文件后重新运行${NC}"
    exit 1
  fi
fi
set -a; source .env; set +a
echo -e "${GREEN} ✅ .env 已加载${NC}"

echo -e "${YELLOW}[3/8] 创建目录结构...${NC}"
mkdir -p data/uploads/{images,videos} data/outputs/{images,videos} data/models data/crawler_data
mkdir -p nginx/ssl nginx/certbot/www logs
echo -e "${GREEN} ✅ 目录创建完成${NC}"

echo -e "${YELLOW}[4/8] 配置SSL证书...${NC}"
if [ -f "nginx/ssl/live/${DOMAIN:-lixiu.ai}/fullchain.pem" ]; then
  echo -e "${GREEN} ✅ SSL证书已存在${NC}"
else
  echo -e "${YELLOW} 获取SSL证书...${NC}"
  docker run -d --name certbot-nginx -p 80:80 \
    -v $(pwd)/nginx/certbot/www:/var/www/certbot:ro \
    -v $(pwd)/nginx/certbot.conf:/etc/nginx/conf.d/default.conf:ro nginx:alpine 2>/dev/null || true
  sleep 5
  docker run --rm -v $(pwd)/nginx/ssl:/etc/letsencrypt -v $(pwd)/nginx/certbot/www:/var/www/certbot \
    certbot/certbot certonly --webroot --webroot-path=/var/www/certbot \
    --email ${EMAIL:-admin@lixiu.ai} --agree-tos --no-eff-email --force-renewal \
    -d ${DOMAIN:-lixiu.ai} -d www.${DOMAIN:-lixiu.ai} 2>/dev/null || echo -e "${YELLOW} ⚠️ SSL获取失败，使用自签名兜底${NC}"
  docker stop certbot-nginx 2>/dev/null || true; docker rm certbot-nginx 2>/dev/null || true
fi

echo -e "${YELLOW}[5/8] 准备代码...${NC}"
[ -d ".git" ] && git pull origin main 2>/dev/null || true

echo -e "${YELLOW}[6/8] 构建镜像...${NC}"
docker-compose -f docker-compose.prod.yml build

echo -e "${YELLOW}[7/8] 启动服务...${NC}"
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.prod.yml up -d

echo -e "${YELLOW}[8/8] 验证部署...${NC}"
sleep 30

ALL_HEALTHY=true
for S in nginx backend celery-worker redis mongodb; do
  STATUS=$(docker inspect -f '{{.State.Status}}' lixiu-$S 2>/dev/null || echo "not_found")
  if [ "$STATUS" = "running" ]; then echo -e "${GREEN} ✅ lixiu-$S: 运行中${NC}"
  else echo -e "${RED} ❌ lixiu-$S: $STATUS${NC}"; ALL_HEALTHY=false; fi
done

if curl -f -s -o /dev/null http://localhost/health 2>/dev/null; then
  echo -e "${GREEN} ✅ 健康检查通过${NC}"
else echo -e "${YELLOW} ⚠️ 健康检查失败${NC}"; ALL_HEALTHY=false; fi

echo ""
echo -e "${BLUE}========================================${NC}"
[ "$ALL_HEALTHY" = true ] && echo -e "${GREEN} 🎉 部署成功！${NC}" || echo -e "${YELLOW} ⚠️ 部分服务异常${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "🌐 https://${DOMAIN:-lixiu.ai}"
echo -e "📊 Grafana: http://localhost:3000"
echo -e "📈 Prometheus: http://localhost:9090"
echo ""
echo -e "日志: docker-compose -f docker-compose.prod.yml logs -f"
echo -e "重启: docker-compose -f docker-compose.prod.yml restart"
