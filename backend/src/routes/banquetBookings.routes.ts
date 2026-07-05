import { Router } from "express";
import { getAvailability, listAddOns } from "../controllers/banquetBookings.controller.js";

const router = Router();

router.get("/availability", getAvailability);
router.get("/add-ons", listAddOns);

export default router;