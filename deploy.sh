#!/bin/bash
set -e

echo "?? ?拐耨 AI敶勗??拇? - 銝?桅蝵脰???
echo "=================================="

if ! command -v docker &> /dev/null; then
    echo "??霂瑕?摰? Docker ??docker-compose"
    exit 1
fi

if [ ! -f .env ]; then
    echo "?? 霂瑕??蔭 .env ?辣嚗???.env.example嚗?
    exit 1
fi

# ?遣敹??桀?
mkdir -p data/uploads data/outputs data/models data/crawler_data
mkdir -p nginx/ssl frontend

# 璉??SSL 霂髡
if [ ! -f nginx/ssl/fullchain.pem ]; then
    echo "?? ?芣?瘚SSL霂髡嚗蝙?刻蝑曉?嚗?鈭抒憓窈雿輻Let's Encrypt嚗?
    mkdir -p nginx/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/privkey.pem \
        -out nginx/ssl/fullchain.pem \
        -subj "/C=CN/ST=Guangdong/L=Shenzhen/O=lixiu/CN=lixiu.ai" 2>/dev/null
fi

# ?函蔡?垢
echo "? ?函蔡?垢..."
cp lixiu_index.html frontend/index.html

# ?臬?
echo "? ?臬 Docker ?..."
docker-compose -f docker-compose.prod.yml up -d

echo "??蝑???臬..."
sleep 15

# 璉?亦??docker-compose -f docker-compose.prod.yml ps

# 撉?
echo "?? 撉??函蔡..."
curl -sf http://localhost/health && echo " ??API 甇?虜" || echo " ??API 撘虜"

echo ""
echo "???函蔡摰?嚗?
echo "?? 霈輸?啣?: http://localhost"
echo "?? ?: http://localhost:9090 (Prometheus) / http://localhost:3000 (Grafana)"
echo ""
echo "?? ?漣?臬? SSL: 餈?隞乩??賭誘?瑕?霂髡"
echo "   docker run -it --rm -v \$(pwd)/nginx/ssl:/etc/letsencrypt certbot/certbot certonly --standalone -d lixiu.ai -d www.lixiu.ai"
