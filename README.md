# BeautyBook — Randevu Yönetim Sistemi

Güzellik merkezi randevu yönetim sistemi. Üç rol: müşteriler randevu alır, işletme sahipleri işletmelerini yönetir, adminler kayıtları denetler.

> UI metinleri, yorumlar ve hata mesajları **Türkçedir**.

---

## PROJE DURUMU (Mayıs 2026)

### Son Tamamlanan İşler

| Tarih | Commit | Yapılan |
|---|---|---|
| Mayıs 2026 | `cbe9384` | Full-stack BeautyBook ilk sürüm |
| Mayıs 2026 | `8d26e72` | MONGO_URI docker-compose'dan kaldırıldı, env_file kullanılıyor |
| Mayıs 2026 | `53f6e40` | Güvenlik düzeltmeleri + auth/register sayfaları koyu tema |
| Mayıs 2026 | `b246761` | Tüm iç sayfalar ve navbar bileşenleri koyu tema |

### Aktif Güvenlik Açıkları (Kritik → Düşük)

**C1 — `backend/.env` git'te takip ediliyor (EN KRİTİK)**
- JWT_SECRET, MongoDB şifresi ve Gmail app password git geçmişinde mevcut
- Düzeltme adımları:
  1. `git rm --cached backend/.env` + `.gitignore`'a ekle
  2. Tüm credential'ları rotate et (JWT_SECRET, MongoDB şifresi, Gmail app password)
  3. `git filter-repo --path backend/.env --invert-paths` ile geçmişten temizle

**C4 — `ownerController.js` `registerOwner` response'da password hash dönüyor**
- `backend/controllers/ownerController.js` → response'dan `password` alanını çıkar

**H3 — HTTPS yok → `secure: false` cookie**
- `backend/utils/createToken.js:13` → şu an `secure: false` (HTTP zorunluluğu)
- Let's Encrypt + Nginx kurulunca `secure: true` yap

**H7 — ReDoS / Regex injection**
- Search param escape edilmiyor
- Düzeltme: `express-mongo-sanitize` paketi ekle

**H8 — CSRF koruması yok**

**H9 — Comment permission kontrolü comment-out edilmiş (herkes yorum yapabilir)**

**Orta Öncelik:**
- `updateOwnerProfile` mevcut şifre gerektirmiyor
- JWT 30 gün, refresh token yok
- bcrypt cost 10 → 12'ye çıkarılmalı
- `Math.random()` geçici şifre → `crypto.randomBytes` kullanılmalı
- Email enumeration: farklı login hata mesajları

---

## DEPLOYMENT (VPS)

**Sunucu:** `145.223.81.130` (Ubuntu)
**Dizin:** `~/appointment-manage`
**Kullanıcı:** `caner`

### VPS'te Deploy Komutları

```bash
cd ~/appointment-manage
git pull
docker compose down
docker compose up -d --build
```

### Admin Seed (ilk kurulumda)

```bash
docker exec appointment-manage-backend-1 node scripts/seedAdmin.js
# Varsayılan: admin@beautybook.com / Admin123!
# Üretimde şifreyi hemen değiştir!
```

### Docker Mimarisi

```
appnet (bridge network)
├── backend   → port 5000 (Node.js + Express)
├── frontend  → port 3000 (Next.js)
└── mongodb   → port 27017 (Mongo 6.0, self-hosted)
```

MongoDB kimlik bilgileri: `admin / C.nemesis123` (authSource=admin)
Volume: `mongodb_data` (kalıcı)

### Önemli Notlar

- `MONGO_INITDB_ROOT_*` sadece volume **ilk** oluşturulduğunda çalışır. Credential hatası alırsan: `docker compose down -v && docker compose up -d`
- `secure: false` cookie: site HTTP üzerinde çalıştığı için. HTTPS kurulunca `backend/utils/createToken.js:13`'ü `true` yap
- `NEXT_PUBLIC_API_URL` docker-compose içinde tırnak içinde: `"NEXT_PUBLIC_API_URL=http://145.223.81.130:5000/api"` (YAML parse hatası önlemi)

---

## MİMARİ

### Stack

- **Backend:** Node.js + Express 5, MongoDB + Mongoose, JWT (HttpOnly cookie)
- **Frontend:** Next.js 15 (App Router), React 19, Redux Toolkit + RTK Query, Tailwind CSS 4
- **Altyapı:** Docker Compose, self-hosted MongoDB

### Klasör Yapısı

```
backend/
├── controllers/      # İş mantığı (9 controller)
├── models/           # Mongoose şemaları
│   ├── User.js       # role: user | owner | admin
│   ├── BeautyCenter.js
│   ├── Appointment.js
│   ├── Department.js
│   ├── Service.js
│   └── Comment.js
├── routes/           # Express router'lar
├── middleware/
│   ├── authMiddleware.js   # JWT doğrulama + isBanned kontrolü
│   └── rateLimiter.js      # login: 5/15dk, register: 3/saat
├── services/
│   ├── cronService.js      # Randevu hatırlatıcı + temizlik
│   └── emailService.js     # Nodemailer / Gmail
├── scripts/
│   └── seedAdmin.js        # Admin kullanıcı oluşturur
└── utils/
    └── createToken.js      # JWT + HttpOnly cookie

frontend/
├── app/
│   ├── page.js             # Anasayfa (güzellik merkezi listesi)
│   ├── login/              # Giriş (user + owner tab)
│   ├── register/user/      # Kullanıcı kaydı
│   ├── register/owner/     # İşletme sahibi kaydı
│   ├── dashboard/          # Profil sayfası (tüm roller)
│   ├── user/appointments/  # Kullanıcı randevuları
│   ├── owner/              # Owner portalı
│   │   ├── dashboard/
│   │   ├── appointments/
│   │   ├── beauty-center/
│   │   └── departments/
│   ├── admin/              # Admin paneli
│   │   ├── dashboard/
│   │   ├── owners/         # İşletme onayları
│   │   ├── users/
│   │   ├── centers/
│   │   └── settings/
│   └── centers/[centerId]/ # Merkez detayı + rezervasyon + yorumlar
├── components/
│   ├── UserNavbar.jsx
│   ├── OwnerNavbar.jsx
│   ├── AdminNavbar.jsx
│   ├── UserProfileModal.jsx
│   └── ProtectedRoute.jsx
└── lib/
    ├── store.js
    ├── features/authSlice.js   # redux-persist ile localStorage
    └── services/               # RTK Query (authApi, beautyCenterApi, ...)
```

### Kimlik Doğrulama Akışı

1. Login/Register → JWT → HttpOnly cookie
2. `authenticate` middleware her korumalı route'da cookie'yi doğrular
3. `req.user` yüklenir (şifre hariç) + `isBanned` kontrolü
4. Rol kapıları: `authorizeAdmin`, `authorizeOwner`

### Veri İlişkileri

```
User (owner) → BeautyCenter → Department → Service
User (user)  → Appointment  → (BeautyCenter + Department + Service snapshot)
```

Randevular booking anındaki servis verisinin anlık görüntüsünü saklar.
Randevu durumları: `pending → approved | rejected`, `approved → cancelled | completed | no-show`

---

## KOYU TEMA (Mayıs 2026 — commit b246761)

Tüm site zinc/mor profesyonel koyu temaya geçirildi.

### Strateji

Tailwind CSS 4 `@theme` direktifi ile gri skalası global olarak tersine çevrildi (`frontend/app/globals.css`). Bu `text-gray-*`, `bg-gray-*`, `border-gray-*` sınıflarını otomatik olarak karartır. `bg-white` geçersiz kılınmadı (gradient butonlarda `text-white` bozulmasın diye) — bunlar her dosyada `bg-zinc-900`'e dönüştürüldü.

### Renk Paleti

| Kullanım | Sınıf |
|---|---|
| Sayfa arkaplanı | `bg-zinc-950` |
| Kart / panel | `bg-zinc-900 border border-zinc-800 rounded-xl` |
| Alt bölüm / satır | `bg-zinc-800` veya `bg-zinc-800/50` |
| Input / Select | `bg-zinc-800 border border-zinc-700 text-zinc-100` |
| Başlık metni | `text-zinc-100` |
| Gövde metni | `text-zinc-300` |
| Etiket / küçük | `text-zinc-400` veya `text-zinc-500` |
| Hover öğe | `hover:bg-zinc-800` |
| Bölücü | `border-zinc-800` / `divide-zinc-800` |
| Başarı badge | `bg-green-950/50 text-green-400` |
| Uyarı badge | `bg-yellow-950/50 text-yellow-400` |
| Hata badge | `bg-red-950/50 text-red-400` |
| İkon arka planı | `bg-blue/purple/green/yellow-950/50` |
| Aktif nav (owner/user) | `bg-purple-950 text-purple-400` |
| Aktif nav (admin) | `bg-red-950 text-red-400` |
| Modal | `bg-zinc-900 border border-zinc-800` |
| Modal iptal butonu | `text-zinc-200 bg-zinc-700 hover:bg-zinc-600` |
| Tablo başlığı | `bg-zinc-800` |
| Sayfalama | `bg-zinc-900 border border-zinc-700 hover:bg-zinc-800` |

---

## GÜVENLİK DÜZELTMELERİ (commit 53f6e40)

| Dosya | Düzeltme |
|---|---|
| `authMiddleware.js` | Her auth isteğinde `isBanned` kontrolü |
| `beautyCentersController.js` | Mass assignment koruması → field allowlist |
| `serviceRoutes.js` | `createService/updateService/deleteService` → `authorizeOwner` eklendi |
| `adminRoutes.js` | Admin login → `loginLimiter` |
| `ownerRoutes.js` | Owner login/register → `loginLimiter` + `registerLimiter` |

---

## KOMUTLAR

### Backend

```bash
cd backend
npm run dev    # nodemon ile geliştirme
npm start      # üretim
```

### Frontend

```bash
cd frontend
npm run dev    # Next.js + Turbopack
npm run build  # Üretim build
npm run lint   # ESLint
```

### Full Stack (Docker)

```bash
docker compose up --build    # İlk kez veya rebuild
docker compose up -d         # Arka planda başlat
docker compose down          # Durdur
docker compose down -v       # Durdur + volume sil (credential reset)
docker compose logs -f backend   # Backend logları
```

---

## ORTAM DEĞİŞKENLERİ

**`backend/.env`**

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://admin:C.nemesis123@mongodb:27017/appointment-manage-system?authSource=admin
JWT_SECRET=<gizli>
EMAIL_USER=canerbuyukduru0@gmail.com
EMAIL_PASS=<gmail-app-password>
EMAIL_SERVICE=gmail
FRONTEND_URL=http://145.223.81.130:3000
```

**`frontend/.env.local`** (lokal geliştirme)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## SONRAKI SPRINT ÖNERİSİ

1. **HTTPS** — Nginx + Let's Encrypt (Certbot) kurulumu → `secure: true` cookie'yi aktif et
2. **Secrets temizliği** — `git rm --cached backend/.env`, credential rotation, `git filter-repo`
3. **`express-mongo-sanitize`** — ReDoS / injection koruması
4. **Comment permission** — Yorum için tamamlanmış randevu şartını geri aç
5. **`crypto.randomBytes`** — Geçici şifre üretimi için `Math.random()` yerine
6. **Input validation** — Zod veya express-validator tüm endpoint'lerde
7. **bcrypt cost** — 10'dan 12'ye çıkar
8. **`registerOwner` response** — Password hash dönmesini engelle

---

## API Endpoint Özeti

```
POST   /api/users/register
POST   /api/users/login
POST   /api/users/logout
GET    /api/users/me
PUT    /api/users/profile

GET    /api/beauty-centers              # Herkese açık
GET    /api/beauty-centers/mine         # Owner
POST   /api/beauty-centers             # Owner
PUT    /api/beauty-centers/mine        # Owner (field allowlist ile)

GET    /api/departments
POST   /api/departments
PUT    /api/departments/:id
DELETE /api/departments/:id

GET    /api/services/department/:id
POST   /api/services
PUT    /api/services/:id
DELETE /api/services/:id

GET    /api/appointments               # Kullanıcı randevuları
POST   /api/appointments
PATCH  /api/appointments/:id/cancel

GET    /api/owner/appointments
PATCH  /api/owner/:id/approve
PATCH  /api/owner/:id/reject
PATCH  /api/owner/:id/attendance
POST   /api/owner/appointments/create-for-customer

POST   /api/admin/login
GET    /api/admin/stats
GET    /api/admin/owners
GET    /api/admin/owners/pending
PATCH  /api/admin/owners/:id/approve
PATCH  /api/admin/owners/:id/reject
GET    /api/admin/users
PATCH  /api/admin/users/:id/ban
GET    /api/admin/beauty-centers
PATCH  /api/admin/beauty-centers/:id/toggle-status
```

---

*Son güncelleme: Mayıs 2026 — commit b246761*
