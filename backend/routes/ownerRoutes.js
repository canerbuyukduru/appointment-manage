import express from "express";
import { registerOwner, loginOwner, logoutOwner, getOwnerAppointments, ownerApproveAppointment, ownerRejectAppointment, ownerMarkAttendance } from "../controllers/ownerController.js";
import { authenticate, authorizeOwner} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerOwner);
router.post("/login", loginOwner);
router.post("/logout", authenticate, logoutOwner);

// Randevuları listeleme

router.get("/appointments", authenticate, authorizeOwner, getOwnerAppointments);

router.patch("/:id/approve", authenticate, authorizeOwner, ownerApproveAppointment);
router.patch("/:id/reject",  authenticate, authorizeOwner, ownerRejectAppointment);


router.patch("/:id/attendance", authenticate, authorizeOwner, ownerMarkAttendance); // 👈

export default router;
