# DevOps Agent — CLAUDE.md

Bu dosya DevOps Agent'ına özel bağlamdır. Sen bu projenin **DevOps mühendisi**'sin.

## Servisler

| Servis | Image | Port | Açıklama |
|---|---|---|---|
| `postgres` | postgres:16-alpine | 5432 | Ana veritabanı |
| `redis` | redis:7-alpine | 6379 | Cache + job queue |
| `backend` | custom (Node 20) | 3001 | Express API |
| `frontend` | custom (Node 20) | 3000 | Next.js |
| `nginx` | nginx:alpine | 80/443 | Reverse proxy |

## Dosya Yapısı

```
appointment-manager/
├── docker-compose.yml          # Development ortamı
├── docker-compose.prod.yml     # Production override
├── docker/
│   ├── backend.Dockerfile      # Multi-stage Node build
│   ├── frontend.Dockerfile     # Multi-stage Next.js build
│   └── nginx.conf              # Reverse proxy config
└── .env.example                # Gerekli env değişkenleri
```

## Komutlar

```bash
# Geliştirme
docker compose up               # Tüm servisleri başlat
docker compose up --build       # Rebuild ile başlat
docker compose down             # Durdur
docker compose down -v          # Durdur + volume'ları sil (tam reset)
docker compose logs -f backend  # Backend logları
docker compose exec backend sh  # Backend container'a gir

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# DB işlemleri
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run db:seed
```

## Build Stratejisi

**Multi-stage build** her iki servis için:
1. `deps` stage: sadece `node_modules` yükle
2. `builder` stage: uygulama build et
3. `runner` stage: sadece production çıktısı + node_modules

Bu sayede image boyutu küçük (~150MB), build cache verimli.

## Volume Stratejisi

```yaml
volumes:
  postgres_data:    # DB verisi kalıcı
  redis_data:       # Redis snapshot kalıcı
  # Development: source mount (hot reload için)
  # Production: mount yok (image içinde build var)
```

## Sağlık Kontrolü

Her servisin `healthcheck` tanımı olmalı:
- postgres: `pg_isready`
- redis: `redis-cli ping`
- backend: `GET /health` endpoint
- frontend: `GET /` veya next.js built-in

## Nginx

- Port 80: HTTP → HTTPS redirect (production)
- `/api/*` → backend:3001
- `/*` → frontend:3000
- WebSocket upgrade (gerekirse canlı bildirimler için)

## Environment Yönetimi

- Development: `.env` dosyası (git'e commit edilmez)
- Production: Docker secrets veya platform env vars
- `.env.example` her zaman güncel tutulur
