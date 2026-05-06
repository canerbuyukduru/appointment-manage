# Frontend Agent — CLAUDE.md

Bu dosya Frontend Agent'ına özel bağlamdır. Sen bu projenin **Next.js frontend developer**'ısın.

## Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + shadcn/ui (`@/components/ui/*`)
- **State:** Zustand (client state) + React Query / TanStack Query (server state)
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios (`@/lib/api`) — doğrudan `fetch` yazma
- **Charts:** Recharts
- **Calendar:** FullCalendar
- **Maps:** Google Maps (`@react-google-maps/api`)
- **Dates:** date-fns

## Dizin Yapısı

```
frontend/src/
├── app/                    # Next.js App Router sayfaları
│   ├── (auth)/             # Giriş/kayıt (layout: auth layout)
│   ├── (customer)/         # Müşteri sayfaları (layout: müşteri header)
│   ├── (business)/         # İşletme dashboard (layout: sidebar)
│   ├── (admin)/            # Admin panel (layout: admin sidebar)
│   └── api/                # Next.js API routes (yalnızca proxy için)
├── components/
│   ├── ui/                 # shadcn/ui bileşenleri (düzenleme — silme)
│   ├── appointment/        # Randevu bileşenleri
│   ├── business/           # İşletme bileşenleri
│   ├── customer/           # Müşteri bileşenleri
│   └── shared/             # Header, Sidebar, Footer, vb.
├── hooks/                  # React Query hooks (use-<entity>.ts)
├── store/                  # Zustand store slice'ları
├── lib/
│   ├── api.ts              # Axios instance (baseURL, interceptors)
│   ├── utils.ts            # cn() ve yardımcılar
│   └── validations/        # Zod şemaları
└── types/                  # TypeScript tip tanımları
```

## Bileşen Yazım Kuralları

- `"use client"` yalnızca event handler, state veya browser API kullanıldığında
- Server component varsayılan — veri çekimi server'da yapılır
- Yeni UI bileşeni yazmadan önce `@/components/ui/` ve shadcn docs'a bak
- `cn()` ile className birleştir (`clsx` doğrudan kullanma)
- Bileşen adı PascalCase, dosya adı kebab-case

## State Yönetimi

```typescript
// Server state → React Query
const { data, isLoading } = useQuery({
  queryKey: ['businesses', filters],
  queryFn: () => api.get('/businesses', { params: filters })
})

// Client state → Zustand
const { user, setUser } = useAuthStore()
```

## API Çağrıları

Tüm API çağrıları `@/lib/api.ts` üzerinden yapılır:
```typescript
// lib/api.ts — Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true  // HttpOnly cookie için
})
```

Hook'lar `@/hooks/` altında tanımlanır, component içinde doğrudan axios çağrısı yapılmaz.

## Tasarım Sistemi

| Token | Değer |
|---|---|
| Primary | `#2563EB` |
| Accent | `#F59E0B` |
| Success | `#10B981` |
| Error | `#EF4444` |
| Font | Inter |

- Mobil öncelikli: breakpoint sırası `sm → md → lg → xl`
- Touch target minimum: `min-h-[44px] min-w-[44px]`
- Loading state: skeleton (`<Skeleton />`) kullan, spinner değil
- Form error: `FormMessage` bileşeni, inline göster

## Randevu Alma Akışı (kritik)

`app/(customer)/booking/` altında çok adımlı form. Adımlar:
1. Hizmet seçimi
2. Personel seçimi (opsiyonel)
3. Tarih + saat (FullCalendar + slot grid)
4. Bilgi onayı
5. Ödeme (Stripe Elements)
6. Başarı ekranı

Adım state'i Zustand `useBookingStore`'da tutulur, URL'de `?step=N` ile yansıtılır.

## Komutlar

```bash
npm run dev       # Geliştirme sunucusu (port 3000)
npm run build     # Production build
npm run lint      # ESLint
npm test          # Jest + React Testing Library
npm run test:e2e  # Playwright
```

## Backend API Base URL

- Development: `http://localhost:3001/api`
- Docker: `http://backend:3001/api`
- Production: `NEXT_PUBLIC_API_URL` env değişkeninden
