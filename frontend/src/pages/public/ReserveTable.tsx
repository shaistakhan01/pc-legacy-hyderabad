import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { checkTableAvailability, createReservation } from "@/services/restaurantReservations";
import { Button, DatePicker, Select, Input, Card, Toast } from "@/components/common";

const TIME_SLOTS = ["12:00", "13:00", "18:00", "19:00", "20:00", "21:00"];

export function ReserveTable() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [date, setDate] = useState("");
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [partySize, setPartySize] = useState("2");
  const [specialRequests, setSpecialRequests] = useState("");
  const [availability, setAvailability] = useState<{ available: boolean; tableNumber: string | null } | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  async function handleCheckAvailability() {
    if (!date) {
      setStatusMessage("Please select a date.");
      return;
    }

    setIsChecking(true);
    setStatusMessage("");
    setAvailability(null);

    const result = await checkTableAvailability(date, time, Number(partySize));
    setIsChecking(false);

    if (!result.success) {
      setStatusMessage(result.message ?? "Could not check availability.");
      return;
    }

    setAvailability({ available: result.available, tableNumber: result.tableNumber });

    if (!result.available) {
      setStatusMessage("No tables available for this date and time. Try a different slot.");
    }
  }

  async function handleReserve() {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsBooking(true);
    const result = await createReservation({
      reservationDate: date,
      reservationTime: time,
      partySize: Number(partySize),
      specialRequests: specialRequests || undefined,
    });
    setIsBooking(false);

    if (!result.success) {
      setStatusMessage(result.message ?? "Reservation failed.");
      return;
    }

    setShowSuccessToast(true);
    setTimeout(() => navigate("/account/bookings"), 1500);
  }

  return (
    <div className="mx-auto flex max-w-content justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 font-heading text-2xl text-primary">Reserve a Table</h1>
        <div className="flex flex-col gap-4">
          <DatePicker label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Select
            label="Time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
          />
          <Select
            label="Party Size"
            value={partySize}
            onChange={(e) => setPartySize(e.target.value)}
            options={Array.from({ length: 8 }, (_, i) => ({
              value: String(i + 1),
              label: `${i + 1} guest${i === 0 ? "" : "s"}`,
            }))}
          />
          <Input
            label="Special Requests (optional)"
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
          />
          <Button onClick={handleCheckAvailability} isLoading={isChecking} variant="secondary">
            Check Availability
          </Button>

          {statusMessage && <p className="text-sm text-error">{statusMessage}</p>}

          {availability?.available && (
            <div className="rounded-sm bg-neutral-100 p-4">
              <p className="text-sm text-neutral-700">
                Table {availability.tableNumber} is available.
              </p>
              <Button onClick={handleReserve} isLoading={isBooking} className="mt-3 w-full">
                {user ? "Confirm Reservation" : "Log In to Reserve"}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm">
          <Toast
            message="Reservation confirmed! Redirecting to your bookings..."
            variant="success"
            onDismiss={() => setShowSuccessToast(false)}
          />
        </div>
      )}
    </div>
  );
}