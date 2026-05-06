# VPS Production Deployment Rehberi

## Gereksinimler

| Bileşen | Minimum |
|---|---|
| İşletim Sistemi | Ubuntu 22.04 LTS |
| RAM | 2 GB (4 GB önerilir) |
| Disk | 20 GB |
| CPU | 2 vCPU |
| Docker | 24+ |
| Docker Compose | v2+ |

---

## Adım 1: VPS Hazırlama

Sunucuya SSH ile bağlan ve setup script'ini çalıştır:

```bash
git clone <repo-url> /opt/randevu
cd /opt/randevu
sudo bash setup-vps.sh
```

Script şunları yapar:
- Sistem güncelleme
- Docker + Docker Compose kurulumu
- Certbot (SSL) kurulumu
- UFW firewall (22, 80, 443)
- Let's Encrypt SSL sertifikası
- Auto-renew cron

---

## Adım 2: Ortam Değişkenleri

```bash
cp .env.production.example .env
nano .env
```

Mutlaka değiştir:
- `DB_PASSWORD` — güçlü rastgele şifre
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — en az 32 karakter
- `FRONTEND_URL` / `DOMAIN_NAME` / `NEXT_PUBLIC_API_URL` — gerçek domain
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — production Stripe anahtarları
- `SENDGRID_API_KEY` — email göndermek için
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — ilk admin hesabı

---

## Adım 3: İlk Deploy

```bash
bash deploy.sh
```

Script şunları yapar:
1. Docker image'larını build eder
2. Tüm servisleri başlatır
3. `prisma migrate deploy` çalıştırır
4. Health check yapar

---

## Adım 4: Seed Verisi (Opsiyonel)

İlk kurulumda demo kategori ve admin kullanıcı oluşturmak için:

```bash
docker compose -f docker-compose.prod.yml exec backend npm run db:seed
```

---

## Sonraki Deploy'lar

Kod değişikliklerini yayınlamak için sadece:

```bash
cd /opt/randevu
bash deploy.sh
```

---

## Sorun Giderme

### Logları izle
```bash
# Tüm servisler
docker compose -f docker-compose.prod.yml logs -f

# Sadece backend
docker compose -f docker-compose.prod.yml logs -f backend

# Sadece frontend
docker compose -f docker-compose.prod.yml logs -f frontend
```

### Container durumları
```bash
docker compose -f docker-compose.prod.yml ps
```

### Backend'e bağlan
```bash
docker compose -f docker-compose.prod.yml exec backend sh
```

### Prisma Studio (dikkatli kullan)
```bash
docker compose -f docker-compose.prod.yml exec backend npx prisma studio
```

### Nginx reload (SSL yenileme sonrası)
```bash
docker exec randevu_nginx nginx -s reload
```

---

## Backup Stratejisi

### PostgreSQL Yedeği
```bash
# Manuel yedek
docker exec randevu_postgres pg_dump -U randevu randevu_db > backup_$(date +%Y%m%d).sql

# Cron ile otomatik (her gece 02:00)
# crontab -e
# 0 2 * * * docker exec randevu_postgres pg_dump -U randevu randevu_db > /opt/backups/randevu_$(date +\%Y\%m\%d).sql
```

### Yedekten Geri Yükleme
```bash
cat backup_20260101.sql | docker exec -i randevu_postgres psql -U randevu randevu_db
```

---

## SSL Sertifika Yenileme

Certbot auto-renew cron kurulumu zaten `setup-vps.sh` tarafından yapılır.
Manuel yenileme için:

```bash
certbot renew
docker exec randevu_nginx nginx -s reload
```

---

## Servis Mimarisi

```
İnternet
    │
    ▼
nginx (80/443)
    ├── /api/* → backend:3001 (Express)
    └── /*     → frontend:3000 (Next.js)
                     │
            backend:3001 (Express + Prisma)
                     ├── postgres:5432
                     └── redis:6379
```

Tüm servisler `randevu_network` bridge ağında çalışır.
postgres ve redis dış porta **açık değildir**.
