import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/db.js';
import userRoutes from './routes/userRoute.js';

dotenv.config();

const app = express();
connectDB();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// User routes
app.use("/api/users", userRoutes);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});