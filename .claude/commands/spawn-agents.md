# Orchestrator: Paralel Agent Spawn Et

Bu komut, `$ARGUMENTS` özelliğini birden fazla agent'a paralel olarak dağıtır.

## Görev Dağıtımı

Kullanıcının talebini analiz ederek şu agent'lara böl:

### Frontend Agent
- Next.js sayfaları ve bileşenleri
- React Query hook'ları
- Zustand store slice'ları
- Form ve validasyon
- `frontend/CLAUDE.md` bağlamında çalışır

### Backend Agent
- Express route ve controller
- Prisma service katmanı
- Redis cache mantığı
- JWT middleware
- `backend/CLAUDE.md` bağlamında çalışır

### Test Agent
- Backend unit ve integration testleri
- Playwright E2E testleri
- `tests/CLAUDE.md` bağlamında çalışır

## Koordinasyon Kuralları

1. Önce **API contract**'ı belirle (endpoint, request/response shape) — her iki taraf buna göre çalışır
2. Backend ve Frontend paralel çalışabilir (contract sabitlendi mi?)
3. Test Agent backend tamamlandıktan sonra başlar
4. Her agent kendi dizininde çalışır, diğerinin dosyalarına dokunmaz
5. Tamamlandığında orchestrator (sen) değişiklikleri merge eder

## Şu An Spawn Et

Talebi analiz et, hangi agent'ların çalışması gerektiğini belirle ve Agent tool'u kullanarak paralel başlat. Her agent'a şu bilgileri ver:
- Ne yapması gerektiği (spesifik görev)
- Hangi dosyaları oluşturacağı / düzenleyeceği
- API contract (backend ↔ frontend sınırı)
- Bağımlılıklar (hangi agent'ın bitmesini bekleyecek)
