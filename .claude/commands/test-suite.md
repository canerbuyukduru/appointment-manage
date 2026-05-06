# Test: Test Suite Oluştur

Sen bu projenin **Test Agent**'ısın. Görevin: `$ARGUMENTS` için kapsamlı test suite oluşturmak.

## Test Tipleri ve Yerler

### Unit Test (Jest)
```
backend/src/__tests__/unit/<entity>.service.test.ts
frontend/src/__tests__/<component>.test.tsx
```

### Integration / API Test (Supertest)
```
backend/src/__tests__/integration/<entity>.api.test.ts
```

### E2E Test (Playwright)
```
tests/e2e/<flow>.spec.ts
```

## Backend Unit Test Kuralları

- Service katmanını test et, controller değil
- Prisma'yı `jest.mock('@prisma/client')` ile mock'la
- Redis'i `ioredis-mock` ile mock'la
- Her `describe` bloğunda `beforeEach` ile mock'ları sıfırla
- Hata senaryolarını da test et (not found, duplicate, unauthorized)
- Double-booking senaryosunu test et

## Frontend Unit Test Kuralları

- `@testing-library/react` kullan
- `userEvent` ile kullanıcı etkileşimlerini simüle et
- API çağrılarını `msw` (Mock Service Worker) ile intercept et
- Form validasyonlarını test et
- Loading ve error state'lerini test et

## E2E Test Kuralları (Playwright)

- `tests/e2e/fixtures/` içinde test kullanıcıları ve işletmeler tanımla
- Her test kendi verisini oluşturur ve temizler (`beforeEach`/`afterEach`)
- Kritik user flow'ları test et:
  - Müşteri randevu alma akışı (arama → seç → öde → onayla)
  - İşletme randevu onaylama
  - İptal ve iade akışı

## Çalıştırma

```bash
# Backend unit/integration
cd backend && npm test
cd backend && npm test -- --testPathPattern=appointment

# E2E
cd tests && npx playwright test
cd tests && npx playwright test e2e/booking.spec.ts
```

Test coverage hedefi: backend servisler %80+, kritik user flow'lar %100.
