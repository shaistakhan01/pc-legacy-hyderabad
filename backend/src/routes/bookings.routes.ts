import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { cancelBooking, getInvoice } from "../controllers/bookings.controller.js";

const router = Router();

router.post("/:bookingId/cancel", requireAuth, cancelBooking);
router.get("/:bookingId/invoice", requireAuth, getInvoice);

export default router;