import { Router } from "express";
import {
  getPendingAnswers,
  reviewAnswer,
  submitForReview,
} from "../controllers/approval.controller";
import { authenticateToken, requireTeacher } from "../middleware/auth";
import { sanitizeBody } from "../middleware/sanitize.middleware";

const router = Router();

router.patch("/:doubtId/submit", authenticateToken, submitForReview);
router.patch(
  "/:doubtId/review",
  authenticateToken,
  requireTeacher,
  sanitizeBody({ editedContent: 2000 }),
  reviewAnswer
);
router.get("/pending", authenticateToken, requireTeacher, getPendingAnswers);

export default router;
