import { Router } from "express";
import { getAvailability } from "../controllers/restaurantReservations.controller.js";

const router = Router();

router.get("/availability", getAvailability);

export default router;