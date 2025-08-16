import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { createService, updateService, deleteService } from "../controllers/serviceController.js";

const router = express.Router();

// Sadece giriş yapmış owner kullanabilir
router.post("/", authenticate, createService);
router.put("/:id", authenticate, updateService);
router.delete("/:id", authenticate, deleteService);

export default router;
