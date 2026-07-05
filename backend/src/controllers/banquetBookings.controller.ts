import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabaseClient.js";
import { checkHallAvailability, calculateAddOnsCost } from "../services/banquetAvailability.service.js";

// GET /api/v1/banquet-bookings/availability?hallId=&eventDate=&startTime=&endTime=&guestCount=
// Public — no auth required.
export async function getAvailability(req: Request, res: Response) {
  const { hallId, eventDate, startTime, endTime, guestCount } = req.query as {
    hallId?: string;
    eventDate?: string;
    startTime?: string;
    endTime?: string;
    guestCount?: string;
  };

  if (!hallId || !eventDate || !startTime || !endTime || !guestCount) {
    return res.status(400).json({
      success: false,
      message: "hallId, eventDate, startTime, endTime, and guestCount are required.",
    });
  }

  try {
    const result = await checkHallAvailability(hallId, eventDate, startTime, endTime, Number(guestCount));
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Availability check failed." });
  }
}

// GET /api/v1/banquet-bookings/add-ons — public, used to populate the
// booking form's add-on checkboxes with live pricing.
export async function listAddOns(_req: Request, res: Response) {
  const { data, error } = await supabaseAdmin.from("hall_add_ons").select("*").order("category");

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  res.json({ success: true, addOns: data });
}