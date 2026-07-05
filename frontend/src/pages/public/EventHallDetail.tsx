import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import {
  checkHallAvailability,
  listAddOns,
  createBanquetBooking,
  type HallAddOn,
} from "@/services/banquetBookings";
import { Button, DatePicker, Input, Select, Card, Badge, Toast } from "@/components/common";
import type { Database } from "@/types/database.types";

type EventHall = Database["public"]["Tables"]["event_halls"]["Row"];

const EVENT_TYPES = ["Wedding", "Corporate Event", "Birthday", "Anniversary", "Conference", "Other"];

export function EventHallDetail() {
  const { hallId } = useParams<{ hallId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hall, setHall] = useState<EventHall | null>(null);
  const [addOns, setAddOns] = useState<HallAddOn[]>([]);
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("22:00");
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [guestCount, setGuestCount] = useState("100");
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [availability, setAvailability] = useState<{ available: boolean; basePrice: number } | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (!hallId) return;
    supabase.from("event_halls").select("*").eq("id", hallId).single().then(({ data }) => setHall(data));
    listAddOns().then((res) => res.success && setAddOns(res.addOns));
  }, [hallId]);

  function toggleAddOn(id: string) {
    setSelectedAddOnIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const addOnsTotal = addOns
    .filter((a) => selectedAddOnIds.includes(a.id))
    .reduce((sum, a) => sum + (a.category === "catering" ? a.price * Number(guestCount || 0) : a.price), 0);

  async function handleCheckAvailability() {
    if (!hallId || !eventDate) {
      setStatusMessage("Please select an event date.");
      return;
    }

    setIsChecking(true);
    setStatusMessage("");
    setAvailability(null);

    const result = await checkHallAvailability(hallId, eventDate, startTime, endTime, Number(guestCount));
    setIsChecking(false);

    if (!result.success) {
      setStatusMessage(result.message ?? "Could not check availability.");
      return;
    }

    setAvailability({ available: result.available, basePrice: result.basePrice });

    if (!result.available) {
      setStatusMessage(result.reason ?? "Not available for these details.");
    }
  }

  async function handleBookNow() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!hallId) return;

    setIsBooking(true);
    const result = await createBanquetBooking({
      hallId,
      eventDate,
      startTime,
      endTime,
      eventType,
      guestCount: Number(guestCount),
      addOnIds: selectedAddOnIds,
    });
    setIsBooking(false);

    if (!result.success) {
      setStatusMessage(result.message ?? "Booking failed.");
      return;
    }

    setShowSuccessToast(true);
    setTimeout(() => navigate("/account/bookings"), 1500);
  }

  if (!hall) {
    return <div className="p-16 text-center text-neutral-700">Loading venue...</div>;
  }

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          {hall.image_url ? (
            <img src={hall.image_url} alt={hall.name} className="w-full rounded-md object-cover" />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-md bg-neutral-200 text-neutral-400">
              No Image
            </div>
          )}
          <h1 className="mt-6 font-heading text-3xl text-primary">{hall.name}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {(hall.layout_options ?? []).map((l) => (
              <Badge key={l} status="info">{l}</Badge>
            ))}
          </div>
          <p className="mt-4 text-lg font-semibold text-primary">
            ₹{hall.base_price} base · {hall.capacity_min}–{hall.capacity_max} guests
          </p>
        </div>

        <Card>
          <h2 className="mb-4 font-heading text-xl text-neutral-900">Plan Your Event</h2>
          <div className="flex flex-col gap-4">
            <DatePicker label="Event Date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              <Input label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <Select
              label="Event Type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              options={EVENT_TYPES.map((t) => ({ value: t, label: t }))}
            />
            <Input label="Guest Count" type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} />

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-900">Add-ons</label>
              <div className="flex flex-col gap-2">
                {addOns.map((addon) => (
                  <label key={addon.id} className="flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={selectedAddOnIds.includes(addon.id)}
                      onChange={() => toggleAddOn(addon.id)}
                    />
                    {addon.name} — ₹{addon.price}
                    {addon.category === "catering" ? "/plate" : ""}
                  </label>
                ))}
              </div>
            </div>

            <Button onClick={handleCheckAvailability} isLoading={isChecking} variant="secondary">
              Check Availability
            </Button>

            {statusMessage && <p className="text-sm text-error">{statusMessage}</p>}

            {availability?.available && (
              <div className="rounded-sm bg-neutral-100 p-4">
                <p className="text-sm text-neutral-700">
                  Base: ₹{availability.basePrice} + Add-ons: ₹{addOnsTotal} ={" "}
                  <strong className="text-primary">₹{availability.basePrice + addOnsTotal}</strong>
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