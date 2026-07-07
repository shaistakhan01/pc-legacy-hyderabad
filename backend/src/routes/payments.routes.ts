import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { createPaymentIntent } from "../controllers/payments.controller.js";

const router = Router();

router.post("/create-payment-intent", requireAuth, createPaymentIntent);

export default router;