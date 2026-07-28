#!/bin/bash
set -e

DOMAIN="lixiu.ai"
EMAIL="your-email@example.com"
SSL_DIR="./nginx/ssl"
CERTBOT_DIR="./nginx/certbot"

echo "?? SSL霂髡?蔭?"
echo "===================="

mkdir -p $SSL_DIR
mkdir -p $CERTBOT_DIR/www

if [ -f "$SSL_DIR/live/$DOMAIN/fullchain.pem" ]; then
    echo "?? 霂髡撌脣??剁?撠?蝏剜?..."
    docker run --rm \
        -v $(pwd)/$SSL_DIR:/etc/letsencrypt \
        -v $(pwd)/$CERTBOT_DIR/www:/var/www/certbot \
        certbot/certbot renew --quiet
    echo "??霂髡蝏剜?摰?"
else
    echo "?? ?瑕??啗?銋?.."
    docker run -d --name certbot-nginx \
        -p 80:80 \
        -v $(pwd)/$CERTBOT_DIR/www:/var/www/certbot:ro \
        -v $(pwd)/nginx/certbot.conf:/etc/nginx/conf.d/default.conf:ro \
        nginx:alpine

    docker run --rm \
        -v $(pwd)/$SSL_DIR:/etc/letsencrypt \
        -v $(pwd)/$CERTBOT_DIR/www:/var/www/certbot \
        certbot/certbot certonly --webroot --webroot-path=/var/www/certbot \
        --email $EMAIL --agree-tos --no-eff-email --force-renewal \
        -d $DOMAIN -d www.$DOMAIN

    docker stop certbot-nginx 2>/dev/null || true
    docker rm certbot-nginx 2>/dev/null || true
    echo "??SSL霂髡?瑕?摰?"
fi

chmod -R 755 $SSL_DIR

CRON_JOB="0 3 * * * cd $(pwd) && ./scripts/ssl-setup.sh >> /var/log/ssl-renewal.log 2>&1"
if ! crontab -l 2>/dev/null | grep -q "ssl-setup.sh"; then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "??撌脫溶??函賒???嗡遙??
fi

echo "?? SSL?蔭摰?嚗?
