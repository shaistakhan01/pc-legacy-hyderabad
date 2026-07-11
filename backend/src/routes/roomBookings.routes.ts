import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { getAvailability, createBooking, createStaffAssistedBooking, modifyBooking } from "../controllers/roomBookings.controller.js";

const router = Router();

router.get("/availability", getAvailability);
router.post("/", requireAuth, createBooking);
router.post("/staff-assisted", requireAuth, requireRole("staff", "admin", "super_admin"), createStaffAssistedBooking);
router.patch("/:bookingId/modify", requireAuth, modifyBooking);

export default router;