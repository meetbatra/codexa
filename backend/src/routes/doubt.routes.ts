import { Router } from "express";
import {
  getDoubts,
  getMyDoubts,
  postDoubt,
} from "../controllers/doubt.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/", authenticateToken, postDoubt);
router.get("/", authenticateToken, getDoubts);
router.get("/mine", authenticateToken, getMyDoubts);

export default router;
