#!/bin/bash
set -e

# Renkler
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${BLUE}[SETUP]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

if [ "$(id -u)" -ne 0 ]; then
  echo "Bu script root olarak çalıştırılmalı: sudo bash setup-vps.sh"
  exit 1
fi

read -p "Domain adınızı girin (örnek: randevu.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
  echo "Domain gerekli!"
  exit 1
fi

log "Ubuntu VPS Kurulumu Başlatılıyor — Domain: $DOMAIN"
echo "=========================================================="

# Sistem güncelleme
log "Sistem güncelleniyor..."
apt update && apt upgrade -y
apt install -y curl git ufw
ok "Sistem güncellendi"

# Docker kurulumu
log "Docker kuruluyor..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  ok "Docker kuruldu"
else
  ok "Docker zaten kurulu: $(docker --version)"
fi

# Docker Compose plugin kontrolü
if ! docker compose version &> /dev/null; then
  log "Docker Compose plugin kuruluyor..."
  apt install -y docker-compose-plugin
  ok "Docker Compose kuruldu"
else
  ok "Docker Compose zaten kurulu: $(docker compose version)"
fi

# Certbot kurulumu
log "Certbot kuruluyor..."
apt install -y certbot
ok "Certbot kuruldu"

# Firewall
log "Firewall ayarlanıyor..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ok "Firewall aktif (22, 80, 443)"

# SSL sertifika
log "SSL sertifikası alınıyor: $DOMAIN"
warn "NOT: Bu adımda $DOMAIN, bu sunucunun IP'sine yönlendirilmiş olmalı!"
read -p "DNS kaydı hazır mı? (e/h): " READY
if [ "$READY" = "e" ]; then
  certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN"
  ok "SSL sertifikası alındı"

  # Auto-renew cron
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'docker exec randevu_nginx nginx -s reload'") | crontab -
  ok "Auto-renew cron eklendi"
else
  warn "SSL atlandı. Sonradan: certbot certonly --standalone -d $DOMAIN"
fi

# nginx.prod.conf içindeki DOMAIN_NAME placeholder'ını güncelle
log "nginx konfigürasyonu güncelleniyor..."
if [ -f "docker/nginx.prod.conf" ]; then
  sed -i "s/DOMAIN_NAME/$DOMAIN/g" docker/nginx.prod.conf
  ok "nginx.prod.conf güncellendi ($DOMAIN)"
fi

echo ""
echo "=========================================================="
ok "VPS kurulumu tamamlandı!"
echo ""
echo "Sonraki adımlar:"
echo "  1. cp .env.production.example .env"
echo "  2. nano .env  (gerçek değerleri doldurun)"
echo "  3. bash deploy.sh"
