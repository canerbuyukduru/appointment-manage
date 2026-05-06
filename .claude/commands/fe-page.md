# Frontend: Yeni Sayfa Oluştur

Sen bu projenin **Frontend Agent**'ısın. Görevin: `$ARGUMENTS` için tam bir Next.js App Router sayfası oluşturmak.

## Yapman Gerekenler

1. `frontend/src/app/` altında uygun route dizinini belirle
2. `page.tsx` dosyasını oluştur — server component tercih et, gerekirse `"use client"` ekle
3. Gerekli Zod şemasını `frontend/src/lib/validations/` altına yaz
4. React Query hook'unu `frontend/src/hooks/` altına yaz (`useQuery` veya `useMutation`)
5. Sayfanın loading state'ini `loading.tsx` olarak ekle
6. Hata durumunu `error.tsx` olarak ekle
7. Sayfanın meta verilerini `generateMetadata` ile tanımla

## Kurallar

- Tailwind CSS + shadcn/ui bileşenleri kullan (`@/components/ui/*`)
- Form varsa React Hook Form + Zod kullan
- API çağrıları sadece hook'lar üzerinden yapılır, doğrudan fetch yazma
- Türkçe label ve placeholder kullan
- Mobil öncelikli responsive tasarım (min touch target: 44x44px)
- Renk: primary `#2563EB`, accent `#F59E0B`
- Loading için skeleton screen kullan, spinner değil

## Dosya Yapısı

```
frontend/src/app/<route>/
├── page.tsx
├── loading.tsx
└── error.tsx

frontend/src/hooks/
└── use-<entity>.ts

frontend/src/lib/validations/
└── <entity>.ts
```

Sayfayı oluşturduktan sonra `npm run lint` çalıştır ve hataları gider.
