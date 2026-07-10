import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { getSummary } from "../controllers/reports.controller.js";

const router = Router();

router.get("/summary", requireAuth, requireRole("staff", "admin", "super_admin"), getSummary);

export default router;