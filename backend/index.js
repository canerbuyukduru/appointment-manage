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

import cors from 'cors';
dotenv.config();

const app = express();
connectDB();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // Eğer cookie/token kullanıyorsan bu da gerekli olabilir
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// User routes
app.use("/api/users", userRoutes);
app.use("/api/owners", ownerRoutes); // Assuming you have an ownerRoutes file
app.use("/api/beauty-centers", beautyCentersRoutes); // Assuming beauty centers are managed by owners
app.use("/api/departments", departmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/admin", beautyCentersRoutes); // Assuming beauty centers are managed by owners
app.use("/api/appointments", appointmentsRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});