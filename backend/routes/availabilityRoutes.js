// routes/availabilityRoutes.js
import express from "express";
import { getAvailability } from "../controllers/availabilityController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, getAvailability);

export default router;
