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
// GET /api/v1/reports/revenue-trend?startDate=&endDate= — staff/admin.
// Groups revenue by calendar day for charting.
export async function getRevenueTrend(req: Request, res: Response) {
  const { startDate, endDate } = req.query as DateRangeQuery;

  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: "startDate and endDate are required." });
  }

  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select("total_amount, status, created_at")
    .gte("created_at", startDate)
    .lte("created_at", `${endDate}T23:59:59`)
    .neq("status", "cancelled")
    .order("created_at", { ascending: true });

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  const revenueByDay = new Map<string, number>();

  for (const b of bookings ?? []) {
    const day = b.created_at.slice(0, 10);
    revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + Number(b.total_amount));
  }

  const trend = Array.from(revenueByDay.entries()).map(([date, revenue]) => ({ date, revenue }));

  res.json({ success: true, trend });
}
// GET /api/v1/reports/occupancy?startDate=&endDate= — staff/admin.
// Room occupancy = booked room-nights ÷ (total rooms × days in range).
export async function getOccupancy(req: Request, res: Response) {
  const { startDate, endDate } = req.query as DateRangeQuery;

  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: "startDate and endDate are required." });
  }

  const daysInRange = Math.max(
    1,
    Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  const { count: totalRooms } = await supabaseAdmin
    .from("rooms")
    .select("*", { count: "exact", head: true });

  const { data: roomBookings, error: roomError } = await supabaseAdmin
    .from("room_bookings")
    .select("check_in, check_out, bookings!inner(status, created_at)")
    .gte("bookings.created_at", startDate)
    .lte("bookings.created_at", `${endDate}T23:59:59`)
    .neq("bookings.status", "cancelled");

  if (roomError) {
    return res.status(500).json({ success: false, message: roomError.message });
  }

  const bookedRoomNights = (roomBookings ?? []).reduce((sum, rb) => {
    const nights = Math.round(
      (new Date(rb.check_out).getTime() - new Date(rb.check_in).getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + Math.max(0, nights);
  }, 0);

  const totalAvailableRoomNights = (totalRooms ?? 0) * daysInRange;
  const roomOccupancyRate = totalAvailableRoomNights > 0
    ? Math.round((bookedRoomNights / totalAvailableRoomNights) * 1000) / 10
    : 0;

  const [restaurantCount, banquetCount, conferenceCount] = await Promise.all([
    supabaseAdmin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("module_type", "restaurant")
      .gte("created_at", startDate)
      .lte("created_at", `${endDate}T23:59:59`),
    supabaseAdmin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("module_type", "banquet")
      .gte("created_at", startDate)
      .lte("created_at", `${endDate}T23:59:59`),
    supabaseAdmin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("module_type", "conference")
      .gte("created_at", startDate)
      .lte("created_at", `${endDate}T23:59:59`),
  ]);

  res.json({
    success: true,
    roomOccupancyRate,
    totalRooms: totalRooms ?? 0,
    bookedRoomNights,
    restaurantBookingCount: restaurantCount.count ?? 0,
    banquetBookingCount: banquetCount.count ?? 0,
    conferenceBookingCount: conferenceCount.count ?? 0,
  });
}