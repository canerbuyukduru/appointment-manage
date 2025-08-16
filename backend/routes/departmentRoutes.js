import express from "express";
import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from "../controllers/departmentController.js";
import { authenticate, authorizeOwner } from "../middleware/authMiddleware.js";

const router = express.Router();

// sadece giriş yapan ve owner olan kişiler departman ekleyebilir
router.post("/", authenticate, authorizeOwner, createDepartment);
router.get("/", authenticate, authorizeOwner, getDepartments);
router.put("/:id", authenticate, authorizeOwner, updateDepartment);
router.delete("/:id", authenticate, authorizeOwner, deleteDepartment);

export default router;
