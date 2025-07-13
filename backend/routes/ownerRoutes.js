import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getMyBeautyCenter } from '../controllers/ownerController.js';

const router = express.Router();

router.route("/").get(authenticate, getMyBeautyCenter);

export default router;