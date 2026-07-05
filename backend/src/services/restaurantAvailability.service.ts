import { supabaseAdmin } from "../config/supabaseClient.js";

const RESERVATION_DURATION_MINUTES = 90;

export interface TableAvailabilityResult {
  available: boolean;
  tableId: string | null;
  tableNumber: string | null;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Two reservations on the same table conflict if their 90-minute windows
// overlap. Uses the service-role client since restaurant_reservations is
// RLS-restricted to owner/staff — this check must work for anonymous
// browsers too.
export async function checkTableAvailability(
  reservationDate: string,
  reservationTime: string,
  partySize: number
): Promise<TableAvailabilityResult> {
  const { data: candidateTables, error: tablesError } = await supabaseAdmin
    .from("restaurant_tables")
    .select("id, table_number, capacity")
    .gte("capacity", partySize)
    .eq("status", "available")
    .order("capacity", { ascending: true });

  if (tablesError || !candidateTables || candidateTables.length === 0) {
    return { available: false, tableId: null, tableNumber: null };
  }

  const candidateIds = candidateTables.map((t) => t.id);

  const { data: sameDayReservations, error: reservationsError } = await supabaseAdmin
    .from("restaurant_reservations")
    .select("table_id, reservation_time, bookings!inner(status)")
    .in("table_id", candidateIds)
    .eq("reservation_date", reservationDate)
    .neq("bookings.status", "cancelled");

  if (reservationsError) {
    throw new Error(reservationsError.message);
  }

  const requestedStart = timeToMinutes(reservationTime);
  const requestedEnd = requestedStart + RESERVATION_DURATION_MINUTES;

  const bookedTableIds = new Set(
    (sameDayReservations ?? [])
      .filter((r) => {
        const existingStart = timeToMinutes(r.reservation_time);
        const existingEnd = existingStart + RESERVATION_DURATION_MINUTES;
        return requestedStart < existingEnd && requestedEnd > existingStart;
      })
      .map((r) => r.table_id)
  );

  const availableTable = candidateTables.find((t) => !bookedTableIds.has(t.id));

  return {
    available: Boolean(availableTable),
    tableId: availableTable?.id ?? null,
    tableNumber: availableTable?.table_number ?? null,
  };
}