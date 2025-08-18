import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { cancelAppointment, createAppointment, getMyAppointments } from "../controllers/appointmentController.js";

const router = express.Router();

// Müşteri randevu oluşturur
router.post("/", authenticate, createAppointment);

// Kullanıcının kendi randevularını görüntülemesi
router.get("/my", authenticate, getMyAppointments);

// Kullanıcının kendi randevusunu iptal etmesi
router.delete("/:id", authenticate, cancelAppointment);


export default router;