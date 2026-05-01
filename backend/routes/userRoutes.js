import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMyProfile,
  updateMyProfile,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post("/register", registerLimiter, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", authenticate, logoutUser);

router.get("/profile", authenticate, getMyProfile);
router.put("/profile", authenticate, updateMyProfile);



export default router;