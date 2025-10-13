import express from "express";
import {
  createComment,
  getCommentsByCenter,
  getMyComments,
  updateComment,
  deleteComment,
  ownerReplyComment,
} from "../controllers/commentsController.js";
import { authenticate, authorizeOwner } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route - herkes beauty center yorumlarını görebilir
router.get("/:beautyCenterId", getCommentsByCenter);

// Private routes - giriş yapmış kullanıcılar
router.post("/", authenticate, createComment);
router.get("/my/comments", authenticate, getMyComments);
router.put("/:id", authenticate, updateComment);
router.delete("/:id", authenticate, deleteComment);

// Owner routes - sadece owner yanıt verebilir
router.patch("/:id/reply", authenticate, authorizeOwner, ownerReplyComment);

export default router;