import express from "express";
import { registerOwner, loginOwner, logoutOwner, getOwnerAppointments,updateAppointmentStatus, ownerApproveAppointment, ownerRejectAppointment, ownerMarkAttendance, updateOwnerProfile, getOwnerProfile } from "../controllers/ownerController.js";
import { authenticate, authorizeOwner} from "../middleware/authMiddleware.js";
import {  } from '../controllers/appointmentController.js'

const router = express.Router();

router.post("/register", registerOwner);
router.post("/login", loginOwner);
router.post("/logout", authenticate, logoutOwner);
router.get("/profile", authenticate, authorizeOwner, getOwnerProfile);
router.put("/profile", authenticate, authorizeOwner, updateOwnerProfile);

// Randevuları listeleme

router.get("/appointments", authenticate, authorizeOwner, getOwnerAppointments);

router.patch("/:id/approve", authenticate, authorizeOwner, ownerApproveAppointment);
router.patch("/:id/reject",  authenticate, authorizeOwner, ownerRejectAppointment);

// Randevu durumunu güncelle
router.patch("/appointments/:id/status", authenticate, authorizeOwner, updateAppointmentStatus);

router.patch("/:id/attendance", authenticate, authorizeOwner, ownerMarkAttendance); // 👈

export default router;
