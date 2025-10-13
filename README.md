# Beauty Center - Randevu Yönetim Sistemi

Güzellik merkezi randevu yönetim sistemi - Müşteriler güzellik merkezlerini keşfedip kolayca randevu alabilir, işletme sahipleri randevularını yönetebilir.

## 🚀 Özellikler

### 👤 Kullanıcılar (Müşteriler)
- Hesap oluşturma ve giriş yapma
- Güzellik merkezlerini arama ve filtreleme
- Hizmetleri görüntüleme ve randevu alma
- Randevu geçmişini görüntüleme
- Randevu iptal etme

### 🏢 İşletme Sahipleri (Owners)
- İşletme kaydı ve onay süreci
- Departman ve hizmet yönetimi
- Randevu görüntüleme ve onaylama/reddetme
- Çalışma saatlerini belirleme
- Dashboard ve istatistikler
- Müşteri randevuları oluşturma
- Email bildirimleri

### 👑 Admin Paneli
- İşletme başvurularını onaylama/reddetme
- Kullanıcı yönetimi
- İşletme durumunu kontrol etme
- Sistem istatistikleri

## 🛠️ Teknoloji Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL veritabanı
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Nodemailer** - Email gönderimi
- **Node-cron** - Zamanlı görevler
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Next.js 15** - React framework
- **Tailwind CSS** - Utility-first CSS
- **Redux Toolkit** - State management
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## 📁 Proje Yapısı

```
├── backend/
│   ├── controllers/         # Request handlers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic services
│   ├── db/                 # Database connection
│   └── index.js            # Server entry point
├── frontend/
│   ├── app/                # Next.js app directory
│   ├── components/         # Reusable components
│   ├── store/              # Redux store
│   └── utils/              # Utility functions
└── README.md
```

## 🚀 Kurulum

### Gereksinimler
- Node.js (18.0.0+)
- MongoDB
- NPM veya Yarn

### Backend Kurulumu

1. Backend dizinine geçin:
```bash
cd backend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/beauty-center
JWT_SECRET=your_jwt_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_SERVICE=gmail
FRONTEND_URL=http://localhost:3000
```

4. Sunucuyu başlatın:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Frontend Kurulumu

1. Frontend dizinine geçin:
```bash
cd frontend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 📱 API Endpoints

### Authentication
```
POST /api/users/register     # Kullanıcı kaydı
POST /api/users/login        # Giriş yapma
POST /api/users/logout       # Çıkış yapma
```

### Beauty Centers
```
GET    /api/users/beauty-centers           # Tüm merkezler
POST   /api/users/beauty-centers           # Merkez oluştur
GET    /api/users/beauty-centers/mine      # Kendi merkezim
PUT    /api/users/beauty-centers/mine      # Merkez güncelle
```

### Appointments
```
GET    /api/appointments                   # Randevularım
POST   /api/appointments                   # Randevu oluştur
PATCH  /api/appointments/:id/cancel        # Randevu iptal
```

### Owner Routes
```
GET    /api/owner/appointments             # İşletme randevuları
PATCH  /api/owner/appointments/:id/approve # Randevu onayla
PATCH  /api/owner/appointments/:id/reject  # Randevu reddet
```

## 🗄️ Veritabanı Modelleri

### User Model
- Kullanıcı bilgileri (ad, email, telefon, şifre)
- Rol sistemi (user, owner, admin)
- Hesap durumu yönetimi

### BeautyCenter Model
- İşletme bilgileri
- Adres ve iletişim
- Çalışma saatleri
- Onay durumu

### Appointment Model
- Randevu detayları
- Durum yönetimi (pending, approved, cancelled, completed)
- İlişkiler (user, center, department, service)

### Department & Service Models
- Hiyerarşik yapı (merkez > departman > hizmet)
- Fiyat ve süre bilgileri

## 🔐 Güvenlik Özellikleri

- JWT tabanlı authentication
- Password hashing (bcrypt)
- Role-based access control
- Input validation ve sanitization
- CORS yapılandırması
- Rate limiting (implement edilebilir)

## 📧 Email Servisleri

- Randevu onayı bildirimleri
- Randevu iptal bildirimleri
- Hoş geldin mesajları
- Şifre sıfırlama (implement edilebilir)

## ⏰ Zamanlı Görevler (Cron Jobs)

- Geçmiş randevuları temizleme
- Otomatik durum güncellemeleri
- Email hatırlatmaları

## 🎨 UI/UX Özellikleri

- Responsive design (mobile-first)
- Modern ve temiz arayüz
- Loading states ve error handling
- Toast notifications
- Form validations
- Search ve filtering

## 🤝 Katkı Sağlama

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

Proje hakkında sorularınız için iletişime geçebilirsiniz.

## 🐛 Bilinen Sorunlar

- [ ] Timezone handling improvements needed
- [ ] Advanced search filters can be added
- [ ] Push notifications can be implemented

## 🔮 Gelecek Özellikler

- [ ] Mobile app (React Native)
- [ ] Payment integration
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Social media login
- [ ] Review and rating system

---

⭐ Bu projeyi beğendiyseniz star vermeyi unutmayın!
