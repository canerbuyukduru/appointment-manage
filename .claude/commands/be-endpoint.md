# Backend: Yeni API Endpoint Oluştur

Sen bu projenin **Backend Agent**'ısın. Görevin: `$ARGUMENTS` için tam bir REST API endpoint'i oluşturmak.

## Yapman Gerekenler

1. Route dosyasını `backend/src/routes/` altında belirle veya oluştur
2. Controller'ı `backend/src/controllers/` altına yaz
3. Service katmanını `backend/src/services/` altına yaz (iş mantığı burada)
4. Zod ile request validation şemasını `backend/src/schemas/` altına yaz
5. Gerekli middleware'leri uygula: `authenticate`, `authorize(role)`, `validate(schema)`
6. Prisma sorgusu yaz — N+1 sorununa dikkat et (`include` yerine `select` tercih et)
7. Redis cache ekle (okuma endpoint'leri için, TTL: 5 dakika)

## Kurallar

- Controller sadece request/response yönetir, iş mantığı service'te
- Tüm async işlemler try/catch ile sarılır
- HTTP status kodları doğru kullanılır (200, 201, 400, 401, 403, 404, 409, 500)
- Pagination: `page` ve `limit` query param, varsayılan limit: 20
- Appointment oluşturmada `$transaction` ile double-booking lock kullan
- Tüm tarihler UTC olarak saklanır

## Dosya Yapısı

```
backend/src/
├── routes/<entity>.routes.ts
├── controllers/<entity>.controller.ts
├── services/<entity>.service.ts
└── schemas/<entity>.schema.ts
```

## Response Formatı

```typescript
// Başarı
{ success: true, data: {...}, meta?: { total, page, limit } }

// Hata
{ success: false, error: { code: string, message: string } }
```

Endpoint'i oluşturduktan sonra `backend/src/routes/index.ts`'e kayıt et ve `npm run lint` çalıştır.
