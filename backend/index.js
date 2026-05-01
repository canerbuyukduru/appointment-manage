import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/db.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import cronService from './services/cronService.js';
import { loginLimiter, registerLimiter, generalLimiter } from './middleware/rateLimiter.js';

// Routes
import userRoutes from './routes/userRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js'; 
import beautyCentersRoutes from './routes/beautyCentersRoutes.js';
import appointmentsRoutes from './routes/appointmentsRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

import cors from 'cors';
import { authenticate, authorizeAdmin } from './middleware/authMiddleware.js';
dotenv.config();

const app = express();
connectDB();
const PORT = process.env.PORT || 5001;

const corsOptions = {
  origin: function (origin, callback) {
    // Development'ta localhost'a izin ver
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL // Production frontend URL
    ];
    
    // Origin yoksa (Postman, mobile app vs.) veya allowed origins'te varsa izin ver
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Cookie'ler için gerekli
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
};

app.use(helmet());
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// ✅ Genel rate limiter (tüm istekler için)
app.use(generalLimiter);

// Express app oluşturduktan sonra ve routes'tan önce ekle:

// 🔔 Cron Service'i başlat
console.log('📅 Initializing cron services...');
// cronService otomatik olarak constructor'da init() çağırır

// Graceful shutdown için process listener'ları ekle
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  cronService.stopAllJobs();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  cronService.stopAllJobs();
  process.exit(0);
});

// Manuel hatırlatma endpoint'i (opsiyonel - admin/owner için)
app.post('/api/admin/send-reminder/:appointmentId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await cronService.sendManualReminder(req.params.appointmentId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cron job durumlarını görme endpoint'i (opsiyonel - admin için)
app.get('/api/admin/cron-status', authenticate, authorizeAdmin, (req, res) => {
  try {
    const jobs = cronService.getActiveJobs();
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User routes (loginLimiter, registerLimiter burada kullanılacak)
app.use("/api/users", userRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/beauty-centers", beautyCentersRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/admin", adminRoutes); 
app.use("/api/availability", availabilityRoutes);
app.use('/api/comments', commentRoutes); 


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});