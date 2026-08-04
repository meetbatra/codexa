import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import type { NextFunction, Request, Response } from "express";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 8080;

app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_API_URL,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
);

app.listen(port, () => {
  console.log(`Codexa backend running on port ${port}`);
});
