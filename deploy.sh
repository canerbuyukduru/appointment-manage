#!/bin/bash
set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${BLUE}[DEPLOY]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

log "Randevu Sistemi — Production Deploy Başlatılıyor"
echo "================================================="

# .env kontrolü
if [ ! -f ".env" ]; then
  fail ".env dosyası bulunamadı! cp .env.production.example .env yapıp doldurun."
fi
ok ".env dosyası mevcut"

# Git pull
log "Kod güncelleniyor..."
git pull origin main || warn "git pull başarısız (belki git yok veya değişiklik yok)"

# Production build
log "Docker image'ları build ediliyor..."
docker compose -f docker-compose.prod.yml build --no-cache
ok "Build tamamlandı"

# Önceki container'ları durdur, yenilerini başlat
log "Container'lar başlatılıyor..."
docker compose -f docker-compose.prod.yml up -d
ok "Container'lar ayakta"

# Migration
log "Veritabanı migration çalıştırılıyor..."
sleep 5  # postgres'in hazır olmasını bekle
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
ok "Migration tamamlandı"

# Eski image temizliği
log "Kullanılmayan image'lar temizleniyor..."
docker image prune -f
ok "Temizlik yapıldı"

# Health check
log "Health check yapılıyor..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  ok "Backend sağlıklı (HTTP 200)"
else
  warn "Backend health check başarısız (HTTP $HTTP_CODE) — logları kontrol edin:"
  echo "  docker compose -f docker-compose.prod.yml logs backend --tail=50"
fi

echo ""
echo "================================================="
ok "Deploy tamamlandı!"
log "Loglar için: docker compose -f docker-compose.prod.yml logs -f"
