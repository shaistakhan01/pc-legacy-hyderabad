import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, Badge } from "@/components/common";

interface BookingRow {
  id: string;
  reference_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  room_bookings: {
    check_in: string;
    check_out: string;
    num_guests: number;
    rooms: {
      room_number: string;
      room_types: {
        name: string;
      } | null;
    } | null;
  } | null;
}

const statusToBadge: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  confirmed: "success",
  pending: "warning",
  checked_in: "info",
  completed: "neutral",
  cancelled: "error",
};

export function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("bookings")
      .select(
        `id, reference_number, status, total_amount, created_at,
         room_bookings ( check_in, check_out, num_guests, rooms ( room_number, room_types ( name ) ) )`
      )
      .eq("module_type", "room")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setBookings(data as unknown as BookingRow[]);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return <div className="p-16 text-center text-neutral-700">Loading your bookings...</div>;
  }

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <h1 className="mb-6 font-heading text-2xl text-primary">My Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-neutral-700">You haven't made any room bookings yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => {
            const detail = booking.room_bookings;
            return (
              <Card key={booking.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-lg text-neutral-900">
                      {detail?.rooms?.room_types?.name ?? "Room"}
                    </h3>
                    <p className="text-sm text-neutral-700">
                      Room {detail?.rooms?.room_number} · {detail?.num_guests} guest
                      {detail?.num_guests === 1 ? "" : "s"}
                    </p>
                    <p className="text-sm text-neutral-700">
                      {detail?.check_in} → {detail?.check_out}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">Ref: {booking.reference_number}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge status={statusToBadge[booking.status] ?? "neutral"}>
                      {booking.status.replace("_", " ")}
                    </Badge>
                    <span className="font-semibold text-primary">₹{booking.total_amount}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}