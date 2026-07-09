import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { listGuests, getGuest, createGuest, updateGuest } from "../controllers/guests.controller.js";
import { getGuestBookings } from "../controllers/guests.controller.js";
import { getGuestStats } from "../controllers/guests.controller.js";

const router = Router();

router.get("/", requireAuth, requireRole("staff", "admin", "super_admin"), listGuests);
router.get("/:id", requireAuth, requireRole("staff", "admin", "super_admin"), getGuest);
router.post("/", requireAuth, requireRole("staff", "admin", "super_admin"), createGuest);
router.patch("/:id", requireAuth, requireRole("staff", "admin", "super_admin"), updateGuest);
router.get("/:id/bookings", requireAuth, requireRole("staff", "admin", "super_admin"), getGuestBookings);
router.get("/:id/stats", requireAuth, requireRole("staff", "admin", "super_admin"), getGuestStats);

export default router;