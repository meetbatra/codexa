import { Router } from "express";
import {
  getDoubts,
  getMyDoubts,
  postDoubt,
} from "../controllers/doubt.controller";
import { authenticateToken } from "../middleware/auth";
import { sanitizeBody } from "../middleware/sanitize.middleware";

const router = Router();

router.post("/", authenticateToken, sanitizeBody({ title: 200, content: 2000 }), postDoubt);
router.get("/", getDoubts);
router.get("/mine", authenticateToken, getMyDoubts);

export default router;
