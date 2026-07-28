#!/bin/bash
# 数据备份脚本
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="lixiu_backup_${TIMESTAMP}"
RETENTION_DAYS=30

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "${GREEN}📦 开始备份...${NC}"
mkdir -p $BACKUP_DIR

echo -e "${YELLOW}[1/4] 备份MongoDB...${NC}"
MONGO_USER=${MONGO_USER:-lixiu_admin}
MONGO_PASSWORD=${MONGO_PASSWORD:-myy123456}
docker exec lixiu-mongodb mongodump --username $MONGO_USER --password $MONGO_PASSWORD --authenticationDatabase admin --db lixiu --out /tmp/mongo_backup --gzip
docker cp lixiu-mongodb:/tmp/mongo_backup $BACKUP_DIR/mongo_$TIMESTAMP
docker exec lixiu-mongodb rm -rf /tmp/mongo_backup
echo -e "${GREEN} ✅ MongoDB备份完成${NC}"

echo -e "${YELLOW}[2/4] 备份Redis...${NC}"
REDIS_PASSWORD=${REDIS_PASSWORD:-lixiu_redis_2026}
docker exec lixiu-redis redis-cli -a $REDIS_PASSWORD BGSAVE; sleep 5
docker cp lixiu-redis:/data/dump.rdb $BACKUP_DIR/redis_${TIMESTAMP}.rdb
echo -e "${GREEN} ✅ Redis备份完成${NC}"

echo -e "${YELLOW}[3/4] 备份上传文件...${NC}"
tar -czf $BACKUP_DIR/uploads_${TIMESTAMP}.tar.gz data/uploads/ 2>/dev/null || true
echo -e "${GREEN} ✅ 文件备份完成${NC}"

echo -e "${YELLOW}[4/4] 备份配置...${NC}"
tar -czf $BACKUP_DIR/config_${TIMESTAMP}.tar.gz .env docker-compose.prod.yml nginx/nginx.conf monitoring/ 2>/dev/null || true
echo -e "${GREEN} ✅ 配置备份完成${NC}"

echo -e "${YELLOW}打包所有备份...${NC}"
cd $BACKUP_DIR && tar -czf ${BACKUP_NAME}.tar.gz mongo_${TIMESTAMP}/ redis_${TIMESTAMP}.rdb uploads_${TIMESTAMP}.tar.gz config_${TIMESTAMP}.tar.gz 2>/dev/null || true
rm -rf mongo_${TIMESTAMP} redis_${TIMESTAMP}.rdb uploads_${TIMESTAMP}.tar.gz config_${TIMESTAMP}.tar.gz
BACKUP_SIZE=$(du -h ${BACKUP_NAME}.tar.gz | cut -f1)
echo -e "${GREEN} ✅ 打包完成: ${BACKUP_NAME}.tar.gz (${BACKUP_SIZE})${NC}"

echo -e "${YELLOW}清理 ${RETENTION_DAYS}天前的旧备份...${NC}"
find $BACKUP_DIR -name "lixiu_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
echo -e "${GREEN} ✅ 清理完成${NC}"

if [ -n "$REMOTE_BACKUP_URL" ]; then
  echo -e "${YELLOW}上传远程...${NC}"
  # aws s3 cp $BACKUP_DIR/${BACKUP_NAME}.tar.gz s3://lixiu-backups/ 2>/dev/null || true
fi

echo ""; echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} 🎉 备份完成！文件: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz (${BACKUP_SIZE})${NC}"
echo -e "${GREEN}========================================${NC}"
