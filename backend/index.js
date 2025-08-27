import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/db.js';
import cookieParser from 'cookie-parser';


// Routes
import userRoutes from './routes/userRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js'; 
import beautyCentersRoutes from './routes/beautyCentersRoutes.js';
import appointmentsRoutes from './routes/appointmentsRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';


import cors from 'cors';
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

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// User routes
app.use("/api/users", userRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/beauty-centers", beautyCentersRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/admin", adminRoutes); 

app.use("/api/availability", availabilityRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});