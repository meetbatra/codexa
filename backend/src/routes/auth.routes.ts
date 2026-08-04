import { Router } from "express";
import {
  authenticateToken,
} from "../middleware/auth";
import {
  getMe,
  login,
  register,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);

export default router;
