import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { cancelBooking } from "../controllers/bookings.controller.js";

const router = Router();

router.post("/:bookingId/cancel", requireAuth, cancelBooking);

export default router;