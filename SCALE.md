# MarketPulse - Ölçeklendirme Rehberi

## Mimari

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Nginx     │────▶│   API       │
│  (React)    │     │  (Load Bal) │     │  (Node.js)  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                  │
                       ┌──────────────────────────┼──────────┐
                       │                          │          │
                       ▼                          ▼          ▼
                 ┌─────────┐               ┌─────────┐ ┌─────────┐
                 │ Redis   │               │PostgreSQL│ │ Queue   │
                 │ (Cache) │               │  (DB)   │ │ (Bull)  │
                 └─────────┘               └─────────┘ └────┬────┘
                                                            │
                                                            ▼
                                                      ┌─────────────┐
                                                      │  Worker     │
                                                      │  (Scraper)  │
                                                      └─────────────┘
```

## Flow (Önbellek Stratejisi)

```
1. Request ──▶ Redis Cache (0-30 min) ──▶ Return (10ms)
                         │
                         ▼ (stale)
               PostgreSQL (30min-2hr) ──▶ Return (50ms)
                         │
                         ▼ (missing)
               Queue Job ──▶ Background Scraper ──▶ 202 Pending
```

## Kurulum

### 1. Yerel Geliştirme

```bash
# Redis ve PostgreSQL başlat
docker-compose up -d redis postgres

# Backend başlat
npm run server

# Worker başlat (ayrı terminal)
npm run worker
```

### 2. Production Docker

```bash
# Tüm servisleri başlat
docker-compose up -d

# Scale edilmiş worker'lar (5 worker)
docker-compose up -d --scale worker=5
```

### 3. Cloud Deployment (AWS/GCP/Azure)

#### AWS ECS + RDS + ElastiCache

```bash
# 1. RDS PostgreSQL oluştur
aws rds create-db-instance \
  --db-instance-identifier marketpulse-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --allocated-storage 20

# 2. ElastiCache Redis oluştur
aws elasticache create-cache-cluster \
  --cache-cluster-id marketpulse-cache \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1

# 3. ECS Deploy
ecs-cli compose up
```

## API Kullanımı

### Hızlı Sorgu (Cache)
```bash
curl "http://localhost:3001/api/market/insights?symbol=BTC-USD"
# Response: < 50ms, cache'den
```

### İlk Sorgu (Queue)
```bash
curl "http://localhost:3001/api/market/insights?symbol=ETH-USD"
# Response: 202 Accepted
# { "status": "pending", "checkUrl": "..." }

# 10 saniye sonra kontrol
curl "http://localhost:3001/api/market/insights/status?symbol=ETH-USD"
# Response: { "status": "ready", "data": {...} }
```

## Performans

| Katman | Latency | Hit Rate | Scale |
|--------|---------|----------|-------|
| Redis Cache | 5-10ms | 80-90% | 10K RPS |
| PostgreSQL | 20-50ms | 95% | 1K RPS |
| Scraper | 10-30s | N/A | 10/min |

## Monitoring

### Queue Health
```bash
curl "http://localhost:3001/api/queue/stats"
```

### Cache Stats
```bash
redis-cli info stats
```

### Database Health
```bash
# PostgreSQL active connections
SELECT count(*) FROM pg_stat_activity;
```

## Ölçeklendirme Stratejisi

### Yatay Ölçeklendirme (Horizontal)

```yaml
# docker-compose.override.yml
services:
  backend:
    deploy:
      replicas: 3
  worker:
    deploy:
      replicas: 10  # More workers for parallel scraping
```

### Dikey Ölçeklendirme (Vertical)

```yaml
services:
  worker:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 4G  # More memory for Puppeteer
```

## Güvenlik

### Rate Limiting
```javascript
// server.js'e ekle
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### API Authentication
```javascript
// Admin endpoint'ler için
app.post("/api/cache/clear", authenticateAdmin, async (req, res) => {
  // ...
});
```

## Maliyet Analizi (AWS)

| Servis | Instance | Aylık Maliyet |
|--------|----------|---------------|
| ECS (API) | 2x t3.small | $60 |
| ECS (Worker) | 3x t3.medium | $180 |
| RDS PostgreSQL | db.t3.micro | $15 |
| ElastiCache Redis | cache.t3.micro | $15 |
| Data Transfer | 100GB | $10 |
| **Toplam** | | **~$280/ay** |

## Troubleshooting

### Redis bağlantı hatası
```bash
docker-compose logs redis
redis-cli ping
```

### Worker çok yavaş
```bash
# Queue'da bekleyen job sayısı
curl "http://localhost:3001/api/queue/stats"

# Worker scale up
docker-compose up -d --scale worker=10
```

### Database connection pool tükenmiş
```bash
# PostgreSQL max connections artır
ALTER SYSTEM SET max_connections = 200;
```
