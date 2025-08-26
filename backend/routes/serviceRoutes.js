import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { createService, updateService, deleteService, getServicesByDepartment } from "../controllers/serviceController.js";

const router = express.Router();

// Sadece giriş yapmış owner kullanabilir
router.post("/", authenticate, createService);
router.put("/:id", authenticate, updateService);
router.delete("/:id", authenticate, deleteService);

router.get("/department/:departmentId", authenticate, getServicesByDepartment);

export default router;
