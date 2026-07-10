import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { getSummary } from "../controllers/reports.controller.js";
import { getSummary, getRevenueTrend } from "../controllers/reports.controller.js";


const router = Router();

router.get("/summary", requireAuth, requireRole("staff", "admin", "super_admin"), getSummary);
router.get("/revenue-trend", requireAuth, requireRole("staff", "admin", "super_admin"), getRevenueTrend);

export default router;