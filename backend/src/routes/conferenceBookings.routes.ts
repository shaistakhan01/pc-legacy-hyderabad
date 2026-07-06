import { Router } from "express";
import { getAvailability } from "../controllers/conferenceBookings.controller.js";

const router = Router();

router.get("/availability", getAvailability);

export default router;