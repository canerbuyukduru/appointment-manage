import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMyProfile,
  updateMyProfile,
  getAllBeautyCenters,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser);

router.get("/profile", authenticate, getMyProfile);
router.put("/profile", authenticate, updateMyProfile);

// /api/users/beauty-centers
router.get("/beauty-centers", getAllBeautyCenters);

export default router;
