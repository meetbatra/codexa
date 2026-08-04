import { Router } from "express";
import { getSubmissionById, getSubmissions, submit } from "../controllers/submission.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/", authenticateToken, submit);
router.get("/", authenticateToken, getSubmissions);
router.get("/:id", authenticateToken, getSubmissionById);

export default router;
