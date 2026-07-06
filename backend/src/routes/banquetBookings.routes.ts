import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  getAvailability,
  listAddOns,
  createBooking,
} from "../controllers/banquetBookings.controller.js";

const router = Router();

router.get("/availability", getAvailability);
router.get("/add-ons", listAddOns);
router.post("/", requireAuth, createBooking);

export default router;