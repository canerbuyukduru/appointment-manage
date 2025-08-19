import express from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import { adminLogin, getAllOwners } from "../controllers/adminController.js";

const router = express.Router();

router.post("/login",adminLogin)
router.get("/owners", authenticate, authorizeAdmin, getAllOwners);

export default router;
