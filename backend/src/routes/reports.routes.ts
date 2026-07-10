import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
// import { getSummary } from "../controllers/reports.controller.js";
// import { getSummary, getRevenueTrend } from "../controllers/reports.controller.js";
// import { getSummary, getRevenueTrend, getOccupancy } from "../controllers/reports.controller.js";
import { getSummary, getRevenueTrend, getOccupancy, getBookingTrend } from "../controllers/reports.controller.js";
const router = Router();

router.get("/summary", requireAuth, requireRole("staff", "admin", "super_admin"), getSummary);
router.get("/revenue-trend", requireAuth, requireRole("staff", "admin", "super_admin"), getRevenueTrend);
router.get("/occupancy", requireAuth, requireRole("staff", "admin", "super_admin"), getOccupancy);
router.get("/booking-trend", requireAuth, requireRole("staff", "admin", "super_admin"), getBookingTrend);
export default router;