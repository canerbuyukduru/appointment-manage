// routes/beautyCenterRoutes.js
import express from "express";
import { authenticate, authorizeOwner } from "../middleware/authMiddleware.js";
import { createBeautyCenter, getAllBeautyCenters, getCenterDepartments, getMyBeautyCenter, updateMyBeautyCenter } from "../controllers/beautyCentersController.js";

const router = express.Router();

// /api/users/beauty-centers
router.get("/", getAllBeautyCenters);

// Sadece giriş yapan owner güzellik merkezi oluşturabilir
router.post("/", authenticate, authorizeOwner, createBeautyCenter);

// Owner kendi merkezini görür
router.get("/mine", authenticate, authorizeOwner, getMyBeautyCenter);

// Owner kendi merkezini günceller
router.put("/mine", authenticate, authorizeOwner, updateMyBeautyCenter);

// Belirli center'ın department'larını getir (public)
router.get("/:id/departments", getCenterDepartments);


export default router;
