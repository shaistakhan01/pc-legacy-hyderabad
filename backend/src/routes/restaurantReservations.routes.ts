import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { getAvailability, createReservation } from "../controllers/restaurantReservations.controller.js";

const router = Router();

router.get("/availability", getAvailability);
router.post("/", requireAuth, createReservation);

export default router;