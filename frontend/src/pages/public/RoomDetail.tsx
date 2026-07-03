import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { checkAvailability, createRoomBooking } from "@/services/roomBookings";
import { Button, DatePicker, Select, Card, Badge, Toast } from "@/components/common";
import type { Database } from "@/types/database.types";

type RoomType = Database["public"]["Tables"]["room_types"]["Row"];

export function RoomDetail() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numGuests, setNumGuests] = useState("1");
  const [availability, setAvailability] = useState<{
    available: boolean;
    nights: number;
    totalAmount: number;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    supabase
      .from("room_types")
      .select("*")
      .eq("id", roomId)
      .single()
      .then(({ data }) => setRoomType(data));
  }, [roomId]);

  async function handleCheckAvailability() {
    if (!roomId || !checkIn || !checkOut) {
      setStatusMessage("Please select both check-in and check-out dates.");
      return;
    }

    setIsChecking(true);
    setStatusMessage("");
    setAvailability(null);

    const result = await checkAvailability(roomId, checkIn, checkOut);
    setIsChecking(false);

    if (!result.success) {
      setStatusMessage(result.message ?? "Could not check availability.");
      return;
    }

    setAvailability({
      available: result.available,
      nights: result.nights,
      totalAmount: result.totalAmount,
    });

    if (!result.available) {
      setStatusMessage("No rooms available for these dates. Try a different range.");
    }
  }

  async function handleBookNow() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!roomId) return;

    setIsBooking(true);
    const result = await createRoomBooking({
      roomTypeId: roomId,
      checkIn,
      checkOut,
      numGuests: Number(numGuests),
    });
    setIsBooking(false);

    if (!result.success) {
      setStatusMessage(result.message ?? "Booking failed.");
      return;
    }

    setShowSuccessToast(true);
    setTimeout(() => navigate("/account/bookings"), 1500);
  }

  if (!roomType) {
    return <div className="p-16 text-center text-neutral-700">Loading room...</div>;
  }

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          {roomType.image_url ? (
            <img src={roomType.image_url} alt={roomType.name} className="w-full rounded-md object-cover" />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-md bg-neutral-200 text-neutral-400">
              No Image
            </div>
          )}
          <h1 className="mt-6 font-heading text-3xl text-primary">{roomType.name}</h1>
          <p className="mt-2 text-neutral-700">{roomType.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(roomType.amenities ?? []).map((a) => (
              <Badge key={a} status="info">{a}</Badge>
            ))}
          </div>
          <p className="mt-4 text-lg font-semibold text-primary">
            ₹{roomType.base_price}/night · Up to {roomType.max_occupancy} guests
          </p>
        </div>

        <Card>
          <h2 className="mb-4 font-heading text-xl text-neutral-900">Check Availability</h2>
          <div className="flex flex-col gap-4">
            <DatePicker label="Check-in" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            <DatePicker label="Check-out" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            <Select
              label="Guests"
              value={numGuests}
              onChange={(e) => setNumGuests(e.target.value)}
              options={Array.from({ length: roomType.max_occupancy }, (_, i) => ({
                value: String(i + 1),
                label: `${i + 1} guest${i === 0 ? "" : "s"}`,
              }))}
            />
            <Button onClick={handleCheckAvailability} isLoading={isChecking} variant="secondary">
              Check Availability
            </Button>

            {statusMessage && <p className="text-sm text-error">{statusMessage}</p>}

            {availability?.available && (
              <div className="rounded-sm bg-neutral-100 p-4">
                <p className="text-sm text-neutral-700">
                  {availability.nights} night{availability.nights === 1 ? "" : "s"} · Total:{" "}
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