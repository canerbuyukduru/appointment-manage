import express from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import { adminLogin, approveOwner, getAllOwners, rejectOwner } from "../controllers/adminController.js";

const router = express.Router();

router.post("/login",adminLogin)
router.get("/owners", authenticate, authorizeAdmin, getAllOwners);
router.patch("/owners/:id/approve", authenticate, authorizeAdmin, approveOwner);
router.patch("/owners/:id/reject", authenticate, authorizeAdmin, rejectOwner);

export default router;
