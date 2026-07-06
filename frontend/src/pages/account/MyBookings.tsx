import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, Badge, Tabs } from "@/components/common";

interface RoomBookingRow {
  id: string;
  reference_number: string;
  status: string;
  total_amount: number;
  room_bookings: {
    check_in: string;
    check_out: string;
    num_guests: number;
    rooms: { room_number: string; room_types: { name: string } | null } | null;
  } | null;
}

interface RestaurantBookingRow {
  id: string;
  reference_number: string;
  status: string;
  restaurant_reservations: {
    reservation_date: string;
    reservation_time: string;
    party_size: number;
    restaurant_tables: { table_number: string } | null;
  } | null;
}

interface BanquetBookingRow {
  id: string;
  reference_number: string;
  status: string;
  total_amount: number;
  banquet_bookings: {
    event_date: string;
    start_time: string;
    end_time: string;
    event_type: string | null;
    guest_count: number;
    event_halls: { name: string } | null;
  } | null;
}

interface ConferenceBookingRow {
  id: string;
  reference_number: string;
  status: string;
  total_amount: number;
  conference_bookings: {
    date: string;
    start_time: string;
    end_time: string;
    purpose: string | null;
    attendee_count: number;
    catering_required: boolean;
    conference_rooms: { name: string } | null;
  } | null;
}

const statusToBadge: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  confirmed: "success",
  pending: "warning",
  checked_in: "info",
  seated: "info",
  completed: "neutral",
  cancelled: "error",
};

function RoomBookingsTab() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<RoomBookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("bookings")
      .select(
        `id, reference_number, status, total_amount,
         room_bookings ( check_in, check_out, num_guests, rooms ( room_number, room_types ( name ) ) )`
      )
      .eq("module_type", "room")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setBookings(data as unknown as RoomBookingRow[]);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <p className="text-neutral-700">Loading...</p>;
  if (bookings.length === 0)
    return <p className="text-neutral-700">You haven't made any room bookings yet.</p>;

  return (
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
                <p className="mt-1 text-xs text-neutral-400">
                  Ref: {booking.reference_number}
                </p>
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
  );
}

function RestaurantBookingsTab() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<RestaurantBookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("bookings")
      .select(
        `id, reference_number, status,
         restaurant_reservations ( reservation_date, reservation_time, party_size, restaurant_tables ( table_number ) )`
      )
      .eq("module_type", "restaurant")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setBookings(data as unknown as RestaurantBookingRow[]);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <p className="text-neutral-700">Loading...</p>;
  if (bookings.length === 0)
    return <p className="text-neutral-700">You haven't made any reservations yet.</p>;

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking) => {
        const detail = booking.restaurant_reservations;
        return (
          <Card key={booking.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-lg text-neutral-900">
                  Table {detail?.restaurant_tables?.table_number ?? "—"}
                </h3>
                <p className="text-sm text-neutral-700">
                  {detail?.reservation_date} at {detail?.reservation_time} · {detail?.party_size}{" "}
                  guest{detail?.party_size === 1 ? "" : "s"}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Ref: {booking.reference_number}
                </p>
              </div>
              <Badge status={statusToBadge[booking.status] ?? "neutral"}>
                {booking.status.replace("_", " ")}
              </Badge>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function BanquetBookingsTab() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BanquetBookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("bookings")
      .select(
        `id, reference_number, status, total_amount,
         banquet_bookings ( event_date, start_time, end_time, event_type, guest_count, event_halls ( name ) )`
      )
      .eq("module_type", "banquet")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setBookings(data as unknown as BanquetBookingRow[]);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <p className="text-neutral-700">Loading...</p>;
  if (bookings.length === 0)
    return <p className="text-neutral-700">You haven't booked any events yet.</p>;

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking) => {
        const detail = booking.banquet_bookings;
        return (
          <Card key={booking.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-lg text-neutral-900">
                  {detail?.event_halls?.name ?? "Venue"}
                </h3>
                <p className="text-sm text-neutral-700">
                  {detail?.event_type} · {detail?.guest_count} guests
                </p>
                <p className="text-sm text-neutral-700">
                  {detail?.event_date} · {detail?.start_time} – {detail?.end_time}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Ref: {booking.reference_number}
                </p>
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
  );
}

function ConferenceBookingsTab() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<ConferenceBookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("bookings")
      .select(
        `id, reference_number, status, total_amount,
         conference_bookings ( date, start_time, end_time, purpose, attendee_count, catering_required, conference_rooms ( name ) )`
      )
      .eq("module_type", "conference")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setBookings(data as unknown as ConferenceBookingRow[]);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <p className="text-neutral-700">Loading...</p>;
  if (bookings.length === 0)
    return <p className="text-neutral-700">You haven't booked any meeting rooms yet.</p>;

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking) => {
        const detail = booking.conference_bookings;
        return (
          <Card key={booking.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-lg text-neutral-900">
                  {detail?.conference_rooms?.name ?? "Room"}
                </h3>
                <p className="text-sm text-neutral-700">
                  {detail?.purpose} · {detail?.attendee_count} attendee
                  {detail?.attendee_count === 1 ? "" : "s"}
                </p>
                <p className="text-sm text-neutral-700">
                  {detail?.date} · {detail?.start_time} – {detail?.end_time}
                </p>
                {detail?.catering_required && (
                  <Badge status="info">Catering requested</Badge>
                )}
                <p className="mt-1 text-xs text-neutral-400">
                  Ref: {booking.reference_number}
                </p>
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
  );
}

export function MyBookings() {
  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <h1 className="mb-6 font-heading text-2xl text-primary">My Bookings</h1>
      <Tabs
        items={[
          { id: "rooms", label: "Rooms", content: <RoomBookingsTab /> },
          { id: "dining", label: "Dining", content: <RestaurantBookingsTab /> },
          { id: "events", label: "Events", content: <BanquetBookingsTab /> },
          { id: "meetings", label: "Meetings", content: <ConferenceBookingsTab /> },
        ]}
      />
    </div>
  );
}