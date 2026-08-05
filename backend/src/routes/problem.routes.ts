import { Router } from "express";
import {
  createProblem,
  getProblemById,
  getProblems,
  getStarterCode,
} from "../controllers/problem.controller";
import { authenticateToken, requireTeacher } from "../middleware/auth";

const router = Router();

router.post("/", authenticateToken, requireTeacher, createProblem);
router.get("/", getProblems);
router.get("/:id", getProblemById);
router.get("/:id/starter-code", getStarterCode);

export default router;
