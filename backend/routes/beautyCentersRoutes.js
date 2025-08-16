// routes/beautyCenterRoutes.js
import express from "express";
import { authenticate, authorizeOwner } from "../middleware/authMiddleware.js";
import { createBeautyCenter, getMyBeautyCenter, updateMyBeautyCenter } from "../controllers/beautyCentersController.js";

const router = express.Router();

// Sadece giriş yapan owner güzellik merkezi oluşturabilir
router.post("/", authenticate, authorizeOwner, createBeautyCenter);

// Owner kendi merkezini görür
router.get("/mine", authenticate, authorizeOwner, getMyBeautyCenter);

// Owner kendi merkezini günceller
router.put("/mine", authenticate, authorizeOwner, updateMyBeautyCenter);

export default router;
