import express from "express";

import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import { cancelAppointment, createAppointment, getAppointmentsByUser } from "../controllers/appointmentController.js";
const router = express.Router();

// Yeni randevu oluştur
router.post("/", authenticate, createAppointment);

// Kullanıcının kendi randevularını getir
router.get("/my", authenticate, getAppointmentsByUser);

// Randevu iptal et
router.delete("/:id", authenticate, cancelAppointment);

export default router;
