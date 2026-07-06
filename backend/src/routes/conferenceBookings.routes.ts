import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  getAvailability,
  createBooking,
} from "../controllers/conferenceBookings.controller.js";

const router = Router();

router.get("/availability", getAvailability);
router.post("/", requireAuth, createBooking);

export default router;