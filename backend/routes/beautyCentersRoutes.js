import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';
import { getBeautyCenters } from '../controllers/adminController.js';

const router = express.Router();

router.route("/beautyCenters").get(authenticate, authorizeAdmin, getBeautyCenters);

export default router;