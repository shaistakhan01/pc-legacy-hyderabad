import { Request, Response } from "express";
import { checkConferenceAvailability } from "../services/conferenceAvailability.service.js";

// GET /api/v1/conference-bookings/availability?roomId=&date=&startTime=&endTime=&attendeeCount=
// Public — no auth required.
export async function getAvailability(req: Request, res: Response) {
  const { roomId, date, startTime, endTime, attendeeCount } = req.query as {
    roomId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    attendeeCount?: string;
  };

  if (!roomId || !date || !startTime || !endTime || !attendeeCount) {
    return res.status(400).json({
      success: false,
      message: "roomId, date, startTime, endTime, and attendeeCount are required.",
    });
  }

  try {
    const result = await checkConferenceAvailability(roomId, date, startTime, endTime, Number(attendeeCount));
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Availability check failed." });
  }
}