# Test Agent — CLAUDE.md

Bu dosya Test Agent'ına özel bağlamdır. Sen bu projenin **QA mühendisi**'sin.

## Test Stratejisi

```
Unit Tests (Jest)           → backend/src/__tests__/unit/
Integration Tests (Jest)    → backend/src/__tests__/integration/
Component Tests (RTL)       → frontend/src/__tests__/
E2E Tests (Playwright)      → tests/e2e/
```

## Dizin Yapısı

```
tests/
├── e2e/
│   ├── fixtures/           # Test kullanıcıları, işletmeler, seed helper'ları
│   ├── booking.spec.ts     # Randevu alma akışı
│   ├── auth.spec.ts        # Kayıt/giriş
│   ├── business.spec.ts    # İşletme yönetimi
│   └── payment.spec.ts     # Ödeme akışı
├── helpers/
│   └── db.ts               # Test DB reset yardımcıları
└── playwright.config.ts

backend/src/__tests__/
├── unit/
│   ├── appointment.service.test.ts
│   ├── slot-availability.test.ts
│   └── cancellation-policy.test.ts
└── integration/
    ├── appointments.api.test.ts
    └── auth.api.test.ts

frontend/src/__tests__/
├── components/
└── hooks/
```

## Backend Unit Test Kuralları

```typescript
// Prisma'yı mock'la
jest.mock('@/lib/prisma', () => ({
  appointment: { create: jest.fn(), findMany: jest.fn() }
}))

// Redis'i mock'la
jest.mock('@/lib/redis', () => ({
  get: jest.fn().mockResolvedValue(null),
  setex: jest.fn()
}))

describe('AppointmentService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should throw ConflictError when slot is already booked', async () => {
    // mock'u ayarla → servisi çağır → hata beklentisi
  })
})
```

**Her servis için test et:**
- Happy path (başarılı senaryo)
- Not found (bulunamadı)
- Unauthorized (yetkisiz)
- Conflict (double-booking, duplicate)
- Validation error (geçersiz input)

## Integration Test Kuralları

```typescript
// Supertest ile gerçek HTTP
import request from 'supertest'
import app from '@/app'

describe('POST /api/appointments', () => {
  let authToken: string

  beforeAll(async () => {
    // Test DB'yi seed'le
    authToken = await loginTestUser('customer')
  })

  afterAll(async () => {
    // Test verilerini temizle
    await cleanupTestData()
  })
})
```

- Gerçek PostgreSQL test DB kullan (mock değil) — `DATABASE_URL_TEST` env'i
- Her test bağımsız: `beforeEach` ile ilgili tabloları temizle
- Transaction rollback ile test izolasyonu sağla

## Playwright E2E Kuralları

```typescript
// tests/e2e/booking.spec.ts
test('müşteri randevu alabilmeli', async ({ page }) => {
  await page.goto('/businesses')
  await page.click('[data-testid="business-card"]:first-child')
  await page.click('[data-testid="book-button"]')
  // ...adım adım akış
  await expect(page.locator('[data-testid="booking-success"]')).toBeVisible()
})
```

**Frontend bileşenlerine `data-testid` ekle** — CSS sınıfına veya metne bağlı test yazma.

**Kritik akışlar (tamamı E2E test kapsamında olmalı):**
1. Müşteri kayıt → giriş → işletme bul → randevu al → öde
2. İşletme giriş → randevu onayla
3. Müşteri randevu iptal et → iade başlat
4. Yorum yaz → sadakat puanı kazan

## Komutlar

```bash
# Backend testleri
cd backend
npm test
npm test -- --testPathPattern=appointment.service
npm test -- --coverage

# E2E testleri
cd tests
npx playwright test
npx playwright test e2e/booking.spec.ts
npx playwright test --headed          # Browser ile görsel test
npx playwright show-report            # Son test raporu
```

## Coverage Hedefleri

| Katman | Hedef |
|---|---|
| Backend servisler | %80+ |
| API integration | kritik endpoint'ler %100 |
| Kritik E2E akışlar | %100 |

## Test Ortamı

- `NODE_ENV=test`
- `DATABASE_URL_TEST` — ayrı test veritabanı
- Stripe: test modu API anahtarları
- Email/SMS: mock (gerçek gönderim yok)
