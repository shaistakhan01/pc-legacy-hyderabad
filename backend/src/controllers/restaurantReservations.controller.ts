import { Request, Response } from "express";
import { checkTableAvailability } from "../services/restaurantAvailability.service.js";

// GET /api/v1/restaurant-reservations/availability?date=&time=&partySize=
// Public — no auth required.
export async function getAvailability(req: Request, res: Response) {
  const { date, time, partySize } = req.query as {
    date?: string;
    time?: string;
    partySize?: string;
  };

  if (!date || !time || !partySize) {
    return res.status(400).json({
      success: false,
      message: "date, time, and partySize are required query parameters.",
    });
  }

  try {
    const result = await checkTableAvailability(date, time, Number(partySize));
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Availability check failed." });
  }
}