#!/bin/bash
# 数据恢复脚本
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

if [ -z "$1" ]; then
  echo -e "${RED}用法: ./restore.sh <备份文件.tar.gz>${NC}"
  echo -e "示例: ./restore.sh backups/lixiu_backup_20260101_120000.tar.gz"
  exit 1
fi
BACKUP_FILE="$1"
[ ! -f "$BACKUP_FILE" ] && { echo -e "${RED}错误: 文件不存在: $BACKUP_FILE${NC}"; exit 1; }

echo -e "${YELLOW}⚠️ 恢复将覆盖现有数据！${NC}"
read -p "确认恢复？(yes): " CONFIRM
[ "$CONFIRM" != "yes" ] && { echo "已取消"; exit 0; }

echo -e "${GREEN}📦 开始恢复...${NC}"
RESTORE_DIR="./restore_temp"
mkdir -p $RESTORE_DIR && tar -xzf "$BACKUP_FILE" -C $RESTORE_DIR

echo -e "${YELLOW}[1/3] 恢复MongoDB...${NC}"
MONGO_DIR=$(find $RESTORE_DIR -name "mongo_*" -type d | head -1)
if [ -n "$MONGO_DIR" ]; then
  docker cp $MONGO_DIR lixiu-mongodb:/tmp/mongo_restore
  docker exec lixiu-mongodb mongorestore --username ${MONGO_USER:-lixiu_admin} --password ${MONGO_PASSWORD:-myy123456} --authenticationDatabase admin --db lixiu --drop --gzip /tmp/mongo_restore/lixiu
  docker exec lixiu-mongodb rm -rf /tmp/mongo_restore
  echo -e "${GREEN} ✅ MongoDB恢复完成${NC}"
fi

echo -e "${YELLOW}[2/3] 恢复Redis...${NC}"
REDIS_FILE=$(find $RESTORE_DIR -name "redis_*.rdb" | head -1)
if [ -n "$REDIS_FILE" ]; then
  docker cp $REDIS_FILE lixiu-redis:/data/dump.rdb
  docker restart lixiu-redis; sleep 5
  echo -e "${GREEN} ✅ Redis恢复完成${NC}"
fi

echo -e "${YELLOW}[3/3] 恢复上传文件...${NC}"
UPLOADS_FILE=$(find $RESTORE_DIR -name "uploads_*.tar.gz" | head -1)
[ -n "$UPLOADS_FILE" ] && tar -xzf $UPLOADS_FILE -C ./ && echo -e "${GREEN} ✅ 文件恢复完成${NC}"

rm -rf $RESTORE_DIR
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} 🎉 恢复完成！${NC}"
echo -e "${GREEN}========================================${NC}"
