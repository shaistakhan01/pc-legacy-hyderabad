import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { getGuest } from "@/services/guests";
import { checkAvailability, createStaffAssistedRoomBooking } from "@/services/roomBookings";
import { Button, DatePicker, Select, Card } from "@/components/common";
import type { Database } from "@/types/database.types";

type RoomType = Database["public"]["Tables"]["room_types"]["Row"];

export function StaffAssistedRoomBooking() {
  const { guestId } = useParams<{ guestId: string }>();
  const navigate = useNavigate();

  const [guestName, setGuestName] = useState("");
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomTypeId, setRoomTypeId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numGuests, setNumGuests] = useState("1");
  const [availability, setAvailability] = useState<{ available: boolean; totalAmount: number } | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (guestId) getGuest(guestId).then((res) => res.success && setGuestName(res.guest.full_name));
    supabase.from("room_types").select("*").then(({ data }) => data && setRoomTypes(data));
  }, [guestId]);

  async function handleCheckAvailability() {
    if (!roomTypeId || !checkIn || !checkOut) {
      setStatusMessage("Please select a room type and both dates.");
      return;
    }

    setIsChecking(true);
    setStatusMessage("");
    const result = await checkAvailability(roomTypeId, checkIn, checkOut);
    setIsChecking(false);

    setAvailability({ available: result.available, totalAmount: result.totalAmount });
    if (!result.available) setStatusMessage("No rooms available for these dates.");
  }

  async function handleConfirmBooking() {
    if (!guestId || !roomTypeId) return;

    setIsBooking(true);
    const result = await createStaffAssistedRoomBooking({
      guestId,
      roomTypeId,
      checkIn,
      checkOut,
      numGuests: Number(numGuests),
    });
    setIsBooking(false);

    if (!result.success) {
      setStatusMessage(result.message ?? "Booking failed.");
      return;
    }

    navigate(`/admin/guests/${guestId}`);
  }

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-primary">
        Book a Room for {guestName || "Guest"}
      </h1>
      <Card className="max-w-md">
        <div className="flex flex-col gap-4">
          <Select
            label="Room Type"
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(e.target.value)}
            placeholder="Select a room type"
            options={roomTypes.map((rt) => ({ value: rt.id, label: `${rt.name} — ₹${rt.base_price}/night` }))}
          />
          <DatePicker label="Check-in" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          <DatePicker label="Check-out" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          <Select
            label="Guests"
            value={numGuests}
            onChange={(e) => setNumGuests(e.target.value)}
            options={Array.from({ length: 6 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}` }))}
          />
          <Button onClick={handleCheckAvailability} isLoading={isChecking} variant="secondary">
            Check Availability
          </Button>
          {statusMessage && <p className="text-sm text-error">{statusMessage}</p>}
          {availability?.available && (
            <div className="rounded-sm bg-neutral-100 p-4">
              <p className="text-sm text-neutral-700">
                Total: <strong className="text-primary">₹{availability.totalAmount}</strong> (collected at front desk)
              </p>
              <Button onClick={handleConfirmBooking} isLoading={isBooking} className="mt-3 w-full">
                Confirm Booking
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}