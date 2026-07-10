import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabaseClient.js";

interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

// GET /api/v1/reports/summary?startDate=&endDate= — staff/admin/super_admin.
// One aggregation query set, reused by the dashboard overview and every
// report page in this phase — each just requests a different date range.
export async function getSummary(req: Request, res: Response) {
  const { startDate, endDate } = req.query as DateRangeQuery;

  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: "startDate and endDate are required." });
  }

  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select("module_type, status, total_amount, created_at")
    .gte("created_at", startDate)
    .lte("created_at", `${endDate}T23:59:59`);

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  const rows = bookings ?? [];

  const totalRevenue = rows
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + Number(b.total_amount), 0);

  const totalBookings = rows.length;

  const bookingsByModule: Record<string, number> = {};
  const revenueByModule: Record<string, number> = {};
  const bookingsByStatus: Record<string, number> = {};

  for (const b of rows) {
    bookingsByModule[b.module_type] = (bookingsByModule[b.module_type] ?? 0) + 1;
    bookingsByStatus[b.status] = (bookingsByStatus[b.status] ?? 0) + 1;
    if (b.status !== "cancelled") {
      revenueByModule[b.module_type] = (revenueByModule[b.module_type] ?? 0) + Number(b.total_amount);
    }
  }

  res.json({
    success: true,
    totalRevenue,
    totalBookings,
    bookingsByModule,
    revenueByModule,
    bookingsByStatus,
  });
}