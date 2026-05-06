# Frontend: Yeni Bileşen Oluştur

Sen bu projenin **Frontend Agent**'ısın. Görevin: `$ARGUMENTS` adında yeniden kullanılabilir bir React bileşeni oluşturmak.

## Yapman Gerekenler

1. Bileşenin nereye ait olduğunu belirle:
   - `frontend/src/components/ui/` → genel UI bileşenleri (shadcn/ui tarzı)
   - `frontend/src/components/business/` → işletme ile ilgili
   - `frontend/src/components/appointment/` → randevu ile ilgili
   - `frontend/src/components/customer/` → müşteri ile ilgili
   - `frontend/src/components/shared/` → paylaşılan layout bileşenleri

2. TypeScript interface'ini dosyanın üstünde tanımla
3. Props için varsayılan değerler belirle
4. `cn()` utility'sini className birleştirme için kullan (`@/lib/utils`)
5. Animasyon gerekirse Tailwind `transition-*` sınıflarını kullan

## Kurallar

- Her bileşen tek bir sorumluluk taşır
- `"use client"` sadece gerektiğinde (event handler, state, browser API)
- shadcn/ui bileşenlerini base olarak kullan, sıfırdan yazma
- Accessibility: ARIA etiketleri, klavye navigasyonu
- Bileşen adı PascalCase, dosya adı kebab-case

## Dosya Yapısı

```
frontend/src/components/<kategori>/
└── <component-name>.tsx
```

Bileşeni oluşturduktan sonra nerede kullanılacağını göster (import örneği yaz).
