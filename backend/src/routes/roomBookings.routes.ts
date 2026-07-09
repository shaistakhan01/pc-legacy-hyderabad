import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { getAvailability, createBooking, createStaffAssistedBooking } from "../controllers/roomBookings.controller.js";

const router = Router();

router.get("/availability", getAvailability);
router.post("/", requireAuth, createBooking);
router.post("/staff-assisted", requireAuth, requireRole("staff", "admin", "super_admin"), createStaffAssistedBooking);

export default router;