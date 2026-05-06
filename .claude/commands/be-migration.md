# Backend: Prisma Migration Oluştur

Sen bu projenin **Backend Agent**'ısın. Görevin: `$ARGUMENTS` için Prisma schema değişikliği ve migration oluşturmak.

## Yapman Gerekenler

1. `backend/prisma/schema.prisma` dosyasını oku
2. Gerekli model değişikliklerini yap (yeni model, alan ekleme/çıkarma, ilişki)
3. Migration oluştur: `npx prisma migrate dev --name <açıklayıcı-isim>`
4. Prisma client'ı yenile: `npx prisma generate`
5. Seed dosyasını güncelle (`backend/prisma/seed.ts`) — yeni model için örnek veri ekle
6. Etkilenen TypeScript tip tanımlarını güncelle

## Schema Kuralları

- Her model `id`, `createdAt`, `updatedAt` alanlarına sahip olmalı
- Soft delete için `deletedAt DateTime?` kullan (gerçek silme yok)
- Enum değerleri UPPER_SNAKE_CASE
- Foreign key'ler için `onDelete: Cascade` veya `onDelete: SetNull` belirt
- Arama yapılacak alanlara `@@index` ekle
- Unique kısıtlamaları `@@unique` ile tanımla
- Tarihler `DateTime @default(now())` formatında

## Önemli İndeksler (performans)

Şu alanlara mutlaka index ekle:
- `Appointment`: `(staffId, appointmentDate, status)`
- `Appointment`: `(businessId, appointmentDate)`
- `Business`: `(slug)`, `(categoryId, status)`
- `Review`: `(businessId, isVisible)`

Migration sonrası `npx prisma studio` ile veriyi doğrula.
