import express from "express";
import { registerOwner, loginOwner, logoutOwner } from "../controllers/ownerController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerOwner);
router.post("/login", loginOwner);
router.post("/logout", authenticate, logoutOwner);

export default router;
