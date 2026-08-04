import { Router } from "express";
import {
  getPendingAnswers,
  reviewAnswer,
  submitForReview,
} from "../controllers/approval.controller";
import { authenticateToken, requireTeacher } from "../middleware/auth";

const router = Router();

router.patch("/:doubtId/submit", authenticateToken, submitForReview);
router.patch("/:doubtId/review", authenticateToken, requireTeacher, reviewAnswer);
router.get("/pending", authenticateToken, requireTeacher, getPendingAnswers);

export default router;
