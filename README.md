Student Management System
Modern, full-stack öğrenci yönetim sistemi. Admin paneli ve öğrenci portalı ile kapsamlı eğitim yönetimi çözümü.
🚀 Özellikler
Admin Paneli

Öğrenci Yönetimi: Öğrenci ekleme, düzenleme, silme ve görüntüleme
Ders Yönetimi: Ders tanımlama, kapasité yönetimi ve ders durumu kontrolü
Kayıt İşlemleri: Öğrenci-ders eşleştirmesi ve kayıt yönetimi
Dashboard: Anlık istatistikler ve özet bilgiler
Raporlama: Detaylı raporlar ve analitik veriler

Öğrenci Portalı

Profil Yönetimi: Kişisel bilgileri güncelleme
Ders Kayıt: Mevcut derslere kayıt olma
Derslerim: Kayıtlı olunan dersleri görüntüleme
Ders İptali: Kayıtlı derslerden ayrılma

Sistem Özellikleri

JWT Tabanlı Kimlik Doğrulama: Cookie-based güvenli oturum yönetimi
Role-Based Access Control (RBAC): Admin ve öğrenci yetki seviyeleri
Responsive Design: Mobil uyumlu modern arayüz
Real-time Updates: Redux Toolkit Query ile anlık veri senkronizasyonu
Form Validasyonu: Kapsamlı client-side ve server-side doğrulama

🛠 Teknoloji Stack
Frontend

React 19 - Modern UI kütüphanesi
Redux Toolkit - State management
Redux Toolkit Query - API state management
React Router DOM - Client-side routing
React Hook Form - Form yönetimi ve validasyon
Tailwind CSS - Utility-first CSS framework
Lucide React - Modern icon seti
React Toastify - Bildirim sistemi
Vite - Build tool ve development server

Backend

Node.js - JavaScript runtime
Express.js - Web framework
MongoDB - NoSQL veritabanı
Mongoose - MongoDB ODM
JWT - JSON Web Token authentication
bcrypt - Password hashing
Joi - Data validation
Cookie Parser - Cookie yönetimi
CORS - Cross-Origin Resource Sharing

DevOps & Tools

Docker - Containerization
Docker Compose - Multi-container orchestration
MongoDB Atlas - Cloud database
Jest - Testing framework
ESLint - Code linting

📋 Gereksinimler

Node.js 18+
npm veya yarn
MongoDB (yerel kurulum veya MongoDB Atlas)
Git
Docker (opsiyonel)

🚀 Kurulum
1. Projeyi Klonlayın
bashgit clone https://github.com/yourusername/student-management-system.git
cd student-management-system
2. Backend Kurulumu
bashcd server
npm install
Environment Variables (.env)
envNODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-management-system
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:3000
MongoDB Atlas Kullanımı (Önerilen)
envMONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-management-system?retryWrites=true&w=majority
3. Frontend Kurulumu
bashcd client
npm install
Environment Variables (.env)
envVITE_API_URL=http://localhost:5000
🖥 Çalıştırma
Development Modu
Backend'i çalıştırın:
bashcd server
npm run dev
Backend: http://localhost:5000
Frontend'i çalıştırın:
bashcd client
npm run dev
Frontend: http://localhost:3000
Production Modu
Backend Build:
bashcd server
npm start
Frontend Build:
bashcd client
npm run build
npm run preview
Docker ile Çalıştırma
bash# Tüm servisleri ayağa kaldır
docker-compose up -d

# Logları görüntüle
docker-compose logs -f

# Servisleri durdur
docker-compose down

Frontend: http://localhost:3000
Backend API: http://localhost:5000

🧪 Test
Backend Testleri
bashcd server

# Temel API testleri
npm test

# Detaylı test çıktısı
npm run test -- --verbose
Test Kapsamı

✅ API Health Check
✅ User Registration
✅ User Authentication
✅ Protected Route Access
✅ CRUD Operations

📁 Proje Yapısı
student-management-system/
├── client/                    # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── admin/         # Admin-specific components
│   │   │   ├── common/        # Shared components
│   │   │   └── student/       # Student-specific components
│   │   ├── pages/             # Page components
│   │   │   ├── admin/         # Admin pages
│   │   │   └── student/       # Student pages
│   │   ├── store/             # Redux store
│   │   │   ├── api/           # RTK Query API slices
│   │   │   └── features/      # Redux slices
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Main App component
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                    # Express Backend
│   ├── config/                # Configuration files
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Custom middleware
│   ├── models/                # Mongoose models
│   ├── routes/                # API routes
│   ├── scripts/               # Database scripts
│   ├── tests/                 # Test files
│   ├── app.js                 # Express app setup
│   └── package.json
├── docker-compose.yml         # Docker configuration
└── README.md
🌐 API Endpoints
Authentication
POST   /api/auth/login          # Kullanıcı girişi
POST   /api/auth/logout         # Kullanıcı çıkışı  
GET    /api/auth/profile        # Profil bilgisi
POST   /api/auth/register       # Kullanıcı kaydı
Admin - Student Management
GET    /api/admin/students              # Tüm öğrenciler
GET    /api/admin/students/:id          # Öğrenci detayı
POST   /api/admin/students              # Yeni öğrenci
PUT    /api/admin/students/:id          # Öğrenci güncelle
DELETE /api/admin/students/:id          # Öğrenci sil
Admin - Lesson Management
GET    /api/admin/lessons               # Tüm dersler
GET    /api/admin/lessons/:id           # Ders detayı  
POST   /api/admin/lessons               # Yeni ders
PUT    /api/admin/lessons/:id           # Ders güncelle
DELETE /api/admin/lessons/:id           # Ders sil
GET    /api/admin/lessons/stats         # Ders istatistikleri
Admin - Enrollment Management
GET    /api/admin/enrollments           # Tüm kayıtlar
POST   /api/admin/enrollments           # Yeni kayıt
DELETE /api/admin/enrollments/:id       # Kayıt sil
GET    /api/admin/enrollments/student/:studentId  # Öğrencinin dersleri
GET    /api/admin/enrollments/lesson/:lessonId    # Dersteki öğrenciler
Student Portal
GET    /api/student/profile             # Profil bilgisi
PUT    /api/student/profile             # Profil güncelle
GET    /api/student/lessons/my          # Kayıtlı derslerim
GET    /api/student/lessons/available   # Kayıt açık dersler
POST   /api/student/enroll              # Derse kayıt ol
DELETE /api/student/drop/:lessonId      # Dersi bırak
👥 Kullanıcı Rolleri
Admin

Tüm sistem yönetimi
Öğrenci CRUD işlemleri
Ders CRUD işlemleri
Kayıt yönetimi
Raporlar ve istatistikler

Student

Profil yönetimi
Mevcut dersleri görüntüleme
Derse kayıt olma
Kayıtlı derslerini görüntüleme
Dersten ayrılma

🗄 Veritabanı Şeması
Users Collection
javascript{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  role: String (admin/student),
  firstName: String,
  lastName: String,
  createdAt: Date,
  updatedAt: Date
}
Lessons Collection
javascript{
  _id: ObjectId,
  name: String,
  code: String (unique),
  credits: Number,
  capacity: Number,
  enrolledStudentsCount: Number,
  status: String (active/inactive),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
Enrollments Collection
javascript{
  _id: ObjectId,
  student: ObjectId (ref: User),
  lesson: ObjectId (ref: Lesson),
  enrollmentDate: Date,
  status: String (active/completed/dropped)
}
🔐 Güvenlik

JWT Authentication: HttpOnly cookie tabanlı güvenli oturum
Password Hashing: bcrypt ile güçlü şifreleme
Data Validation: Joi ile kapsamlı doğrulama
CORS Protection: Cross-origin koruma
Rate Limiting: API rate limiting (production için)
Input Sanitization: MongoDB injection koruması
