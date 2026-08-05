import { Router } from "express";
import { getSubmissionById, getSubmissions, submit, runCode } from "../controllers/submission.controller";
import { authenticateToken } from "../middleware/auth";
import { sanitizeBody } from "../middleware/sanitize.middleware";

const router = Router();

router.post("/run", authenticateToken, sanitizeBody({ code: 3000 }), runCode);
router.post("/", authenticateToken, sanitizeBody({ code: 3000 }), submit);
router.get("/", authenticateToken, getSubmissions);
router.get("/:id", authenticateToken, getSubmissionById);

export default router;
