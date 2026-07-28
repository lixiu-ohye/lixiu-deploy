# ?拐耨 AI敶勗??拇? - Docker ?漣?函蔡

## 敹恍?憪?
1. ?蔭?臬???
```bash
cp .env.example .env
# 蝻? .env 憛怠??撖
```

2. ?函蔡
```bash
bash deploy.sh
```

3. 撉?
```bash
curl http://localhost/health
```

## ??嗆?

| ? | 蝡臬 | 霂湔? |
|------|------|------|
| Nginx | 80/443 | ??隞?? + ??隞?|
| Backend | 8000 | FastAPI ?垢 API |
| Celery Worker | - | ?曄?/閫?憭?隞餃 |
| Redis | 6379 | 瘨?? + 蝻? |
| MongoDB | 27017 | ?唳????|
| Prometheus | 9090 | 蝟餌?? |
| Grafana | 3000 | ?航??貌銵冽 |

## SSL 霂髡

```bash
docker run -it --rm -v $(pwd)/nginx/ssl:/etc/letsencrypt certbot/certbot certonly --standalone -d lixiu.ai -d www.lixiu.ai
```
