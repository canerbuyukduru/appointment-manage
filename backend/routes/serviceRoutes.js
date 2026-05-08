import express from "express";
import { authenticate, authorizeOwner } from "../middleware/authMiddleware.js";
import { createService, updateService, deleteService, getServicesByDepartment } from "../controllers/serviceController.js";

const router = express.Router();

router.post("/", authenticate, authorizeOwner, createService);
router.put("/:id", authenticate, authorizeOwner, updateService);
router.delete("/:id", authenticate, authorizeOwner, deleteService);

router.get("/department/:departmentId", authenticate, getServicesByDepartment);

export default router;
