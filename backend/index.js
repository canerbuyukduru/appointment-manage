import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/db.js';
import cookieParser from 'cookie-parser';


// Routes
import userRoutes from './routes/userRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js'; 

dotenv.config();

const app = express();
connectDB();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// User routes
app.use("/api/users", userRoutes);
app.use("/api/owners", ownerRoutes); // Assuming you have an ownerRoutes file



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});