import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { modifyRoomBooking } from "@/services/roomBookings";
import { Button, DatePicker, Card } from "@/components/common";

export function ModifyRoomBooking() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [noteMessage, setNoteMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!bookingId || !checkIn || !checkOut) {
      setStatusMessage("Please select both new dates.");
      return;
    }

    setIsSaving(true);
    setStatusMessage("");
    setNoteMessage("");

    const result = await modifyRoomBooking(bookingId, checkIn, checkOut);
    setIsSaving(false);

    if (!result.success) {
      setStatusMessage(result.message ?? "Failed to modify booking.");
      return;
    }

    if (result.note) {
      setNoteMessage(result.note);
      setTimeout(() => navigate("/account/bookings"), 3000);
    } else {
      navigate("/account/bookings");
    }
  }

  return (
    <div className="mx-auto flex max-w-content justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 font-heading text-2xl text-primary">Modify Booking Dates</h1>
        <div className="flex flex-col gap-4">
          <DatePicker label="New Check-in" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          <DatePicker label="New Check-out" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          <Button onClick={handleSubmit} isLoading={isSaving}>Update Booking</Button>
          {statusMessage && <p className="text-sm text-error">{statusMessage}</p>}
          {noteMessage && <p className="text-sm text-warning">{noteMessage}</p>}
        </div>
      </Card>
    </div>
  );
}