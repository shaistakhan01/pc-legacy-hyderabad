import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { checkConferenceAvailability, createConferenceBooking } from "@/services/conferenceBookings";
import { Button, DatePicker, Input, Card, Badge, Toast } from "@/components/common";
import type { Database } from "@/types/database.types";

type ConferenceRoom = Database["public"]["Tables"]["conference_rooms"]["Row"];

export function ConferenceRoomDetail() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState<ConferenceRoom | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [purpose, setPurpose] = useState("");
  const [attendeeCount, setAttendeeCount] = useState("4");
  const [cateringRequired, setCateringRequired] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean; hours: number; totalAmount: number } | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    supabase.from("conference_rooms").select("*").eq("id", roomId).single().then(({ data }) => setRoom(data));
  }, [roomId]);

  async function handleCheckAvailability() {
    if (!roomId || !date) {
      setStatusMessage("Please select a date.");
      return;
    }

    setIsChecking(true);
    setStatusMessage("");
    setAvailability(null);

    const result = await checkConferenceAvailability(roomId, date, startTime, endTime, Number(attendeeCount));
    setIsChecking(false);

    if (!result.success) {
      setStatusMessage(result.message ?? "Could not check availability.");
      return;
    }

    setAvailability({ available: result.available, hours: result.hours, totalAmount: result.totalAmount });

    if (!result.available) {
      setStatusMessage(result.reason ?? "Not available for these details.");
    }
  }

  async function handleBookNow() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!roomId) return;

    setIsBooking(true);
    const result = await createConferenceBooking({
      roomId,
      date,
      startTime,
      endTime,
      purpose,
      attendeeCount: Number(attendeeCount),
      cateringRequired,
    });
    setIsBooking(false);

    if (!result.success) {
      setStatusMessage(result.message ?? "Booking failed.");
      return;
    }

    setShowSuccessToast(true);
    setTimeout(() => navigate("/account/bookings"), 1500);
  }

  if (!room) {
    return <div className="p-16 text-center text-neutral-700">Loading room...</div>;
  }

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h1 className="font-heading text-3xl text-primary">{room.name}</h1>
          <p className="mt-2 text-neutral-700">Seats up to {room.capacity} people</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(room.equipment ?? []).map((e) => (
              <Badge key={e} status="info">{e}</Badge>
            ))}
          </div>
          <p className="mt-4 text-lg font-semibold text-primary">₹{room.hourly_rate}/hour</p>
        </div>

        <Card>
          <h2 className="mb-4 font-heading text-xl text-neutral-900">Book This Room</h2>
          <div className="flex flex-col gap-4">
            <DatePicker label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              <Input label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <Input label="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Quarterly planning meeting" />
            <Input label="Attendee Count" type="number" value={attendeeCount} onChange={(e) => setAttendeeCount(e.target.value)} />

            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" checked={cateringRequired} onChange={(e) => setCateringRequired(e.target.checked)} />
              Catering required (arranged separately by staff)
            </label>

            <Button onClick={handleCheckAvailability} isLoading={isChecking} variant="secondary">
              Check Availability
            </Button>

            {statusMessage && <p className="text-sm text-error">{statusMessage}</p>}

            {availability?.available && (
              <div className="rounded-sm bg-neutral-100 p-4">
                <p className="text-sm text-neutral-700">
                  {availability.hours} hour{availability.hours === 1 ? "" : "s"} · Total:{" "}
                  <strong className="text-primary">₹{availability.totalAmount}</strong>
                </p>
                <Button onClick={handleBookNow} isLoading={isBooking} className="mt-3 w-full">
                  {user ? "Book Now" : "Log In to Book"}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm">
          <Toast
            message="Booking confirmed! Redirecting to your bookings..."
            variant="success"
            onDismiss={() => setShowSuccessToast(false)}
          />
        </div>
      )}
    </div>
  );
}