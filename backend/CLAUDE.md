# Backend Agent — CLAUDE.md

Bu dosya Backend Agent'ına özel bağlamdır. Sen bu projenin **Express + Prisma backend developer**'ısın.

## Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **ORM:** Prisma (PostgreSQL)
- **Cache:** Redis (ioredis)
- **Auth:** JWT — access token 15 dk, refresh token 7 gün, HttpOnly cookie
- **Validation:** Zod
- **Queue:** Bull (Redis tabanlı background jobs)
- **Email:** SendGrid
- **SMS:** Twilio
- **Push:** Firebase Admin SDK
- **Storage:** Cloudinary
- **Payment:** Stripe + iyzico

## Dizin Yapısı

```
backend/src/
├── routes/             # Express router tanımları
├── controllers/        # Request/response yönetimi (ince kat)
├── services/           # İş mantığı (kalın kat — burada test edilir)
├── middleware/
│   ├── authenticate.ts # JWT doğrulama
│   ├── authorize.ts    # Rol kontrolü
│   └── validate.ts     # Zod şema validasyonu
├── schemas/            # Zod request şemaları
├── jobs/               # Bull job tanımları (email, sms, reminder)
├── lib/
│   ├── prisma.ts       # Prisma client singleton
│   ├── redis.ts        # ioredis client singleton
│   └── queue.ts        # Bull queue tanımları
└── types/              # TypeScript tip genişletmeleri (Express Request)

backend/prisma/
├── schema.prisma       # Veritabanı şeması (tek kaynak)
├── migrations/         # Prisma migration dosyaları
└── seed.ts             # Geliştirme verisi
```

## Katman Sorumluluğu

```
Route → Controller → Service → Prisma/Redis
              ↑           ↑
         (ince)       (kalın — test edilir)
```

- **Route:** sadece `router.get/post/put/delete` + middleware listesi
- **Controller:** `req` → `service` çağrısı → `res.json()` — iş mantığı yok
- **Service:** tüm iş mantığı, Prisma sorguları, cache, validation

## Kimlik Doğrulama

```typescript
// Middleware sırası
router.post('/appointments',
  authenticate,          // JWT doğrula, req.user ekle
  authorize('customer'), // Rol kontrolü
  validate(createAppointmentSchema),
  appointmentController.create
)
```

JWT payload: `{ userId, role, businessId? }`

## Randevu Oluşturma — Kritik Kural

Double-booking'i önlemek için Prisma transaction + row-level lock kullan:

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Mevcut randevuları kilitle
  const existing = await tx.$queryRaw`
    SELECT id FROM appointments
    WHERE staff_id = ${staffId}
      AND appointment_date = ${date}
      AND start_time < ${endTime}
      AND end_time > ${startTime}
      AND status NOT IN ('cancelled_by_customer','cancelled_by_business')
    FOR UPDATE
  `
  if (existing.length > 0) throw new ConflictError('Slot already booked')
  
  // 2. Randevuyu oluştur
  return tx.appointment.create({ data: {...} })
})
```

## Redis Cache Stratejisi

```typescript
// Okuma — cache-aside
const cacheKey = `businesses:${categoryId}:page:${page}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

const data = await prisma.business.findMany(...)
await redis.setex(cacheKey, 300, JSON.stringify(data)) // 5 dk TTL
return data

// Yazma — cache invalidate
await redis.del(`businesses:*`) // ilgili pattern'i temizle
```

Cache'lenen kaynaklar: işletme listesi, kategoriler, müsait slotlar.

## Response Formatı (tutarlı kullan)

```typescript
// Başarı
res.json({ success: true, data: result })
res.json({ success: true, data: items, meta: { total, page, limit } })

// Hata (ErrorHandler middleware yakalar)
throw new AppError('Randevu bulunamadı', 404, 'NOT_FOUND')
```

## Tarih/Saat Kuralları

- Veritabanında **UTC** sakla
- `appointment_date`: `Date` (sadece tarih)
- `start_time`, `end_time`: `String` ("09:00", "10:30") — timezone bağımsız
- Frontend'e UTC döndür, dönüşüm frontend'de yapılır

## Komutlar

```bash
npm run dev              # ts-node-dev ile hot reload (port 3001)
npm run build            # tsc
npm test                 # Jest
npm test -- --testPathPattern=appointments  # Tek dosya
npx prisma migrate dev   # Migration oluştur
npx prisma generate      # Client yenile
npx prisma studio        # DB GUI (port 5555)
npm run db:seed          # Seed verisi yükle
```

## Ortam Değişkenleri

`.env` dosyasından okunur. Zorunlu olanlar:
`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`,
`STRIPE_SECRET_KEY`, `SENDGRID_API_KEY`, `CLOUDINARY_URL`

## Rate Limiting

- Genel API: 100 req/dk/kullanıcı
- `/auth/*`: 10 req/dk/IP
- `express-rate-limit` + Redis store ile implement et
