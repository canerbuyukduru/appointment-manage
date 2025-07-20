import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getMyBeautyCenter, updateMyBeautyCenter } from '../controllers/ownerController.js';

const router = express.Router();

router.route("/").get(authenticate, getMyBeautyCenter);

router.route("/update").put(authenticate, updateMyBeautyCenter);

export default router;