import { Router } from "express";
import { getSubmissionById, getSubmissions, submit } from "../controllers/submission.controller";
import { authenticateToken } from "../middleware/auth";
import { sanitizeBody } from "../middleware/sanitize.middleware";

const router = Router();

router.post("/", authenticateToken, sanitizeBody({ code: 3000 }), submit);
router.get("/", authenticateToken, getSubmissions);
router.get("/:id", authenticateToken, getSubmissionById);

export default router;
