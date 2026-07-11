import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button, Input, Card, Modal, Badge, Tabs } from "@/components/common";
import type { Database } from "@/types/database.types";

type ConferenceRoom = Database["public"]["Tables"]["conference_rooms"]["Row"];

interface BookingRow {
  id: string;
  reference_number: string;
  status: string;
  total_amount: number;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  conference_bookings: {
    date: string;
    start_time: string;
    end_time: string;
    attendee_count: number;
    conference_rooms: { name: string } | null;
  } | null;
}

function RoomsTab() {
  const [rooms, setRooms] = useState<ConferenceRoom[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [equipmentText, setEquipmentText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function loadRooms() {
    supabase.from("conference_rooms").select("*").order("hourly_rate").then(({ data }) => data && setRooms(data));
  }

  useEffect(() => {
    loadRooms();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    await supabase.from("conference_rooms").insert({
      name,
      capacity: Number(capacity),
      hourly_rate: Number(hourlyRate),
      equipment: equipmentText.split(",").map((e) => e.trim()).filter(Boolean),
    });
    setIsSaving(false);
    setModalOpen(false);
    setName("");
    setCapacity("");
    setHourlyRate("");
    setEquipmentText("");
    loadRooms();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this room?")) return;
    await supabase.from("conference_rooms").delete().eq("id", id);
    loadRooms();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setModalOpen(true)}>Add Room</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {rooms.map((room) => (
          <Card key={room.id}>
            <h3 className="font-heading text-lg text-neutral-900">{room.name}</h3>
            <p className="text-sm text-neutral-700">Seats {room.capacity} · ₹{room.hourly_rate}/hour</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {(room.equipment ?? []).map((e) => <Badge key={e} status="neutral">{e}</Badge>)}
            </div>
            <div className="mt-3">
              <Button size="sm" variant="destructive" onClick={() => handleDelete(room.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Conference Room">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
          <Input label="Hourly Rate" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} required />
          <Input label="Equipment (comma-separated)" value={equipmentText} onChange={(e) => setEquipmentText(e.target.value)} />
          <Button type="submit" isLoading={isSaving}>Save</Button>
        </form>
      </Modal>
    </div>
  );
}

const statusToBadge: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  confirmed: "success",
  pending: "warning",
  completed: "neutral",
  cancelled: "error",
};

function AllBookingsTab() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);

  useEffect(() => {
    supabase
      .from("bookings")
     .select(`id, reference_number, status, total_amount, cancelled_at, cancellation_reason, conference_bookings ( date, start_time, end_time, attendee_count, conference_rooms ( name ) )`)
      .eq("module_type", "conference")
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setBookings(data as unknown as BookingRow[]));
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((b) => {
        const detail = b.conference_bookings;
        return (
          <Card key={b.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">
                  {detail?.conference_rooms?.name} — {detail?.date} · {detail?.start_time}–{detail?.end_time}
                </p>
                <p className="text-xs text-neutral-400">Ref: {b.reference_number} · {detail?.attendee_count} attendees</p>
              </div>
             <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-3">
                  <Badge status={statusToBadge[b.status] ?? "neutral"}>{b.status}</Badge>
                  <span className="font-semibold text-primary">₹{b.total_amount}</span>
                </div>
                {b.status === "cancelled" && b.cancelled_at && (
                  <p className="mt-1 text-xs text-neutral-400">
                    Cancelled {new Date(b.cancelled_at).toLocaleDateString()}
                    {b.cancellation_reason && ` — "${b.cancellation_reason}"`}
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
      {bookings.length === 0 && <p className="text-neutral-700">No conference bookings yet.</p>}
    </div>
  );
}

export function ConferenceManagement() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-primary">Conference Management</h1>
      <Tabs
        items={[
          { id: "rooms", label: "Rooms", content: <RoomsTab /> },
          { id: "bookings", label: "All Bookings", content: <AllBookingsTab /> },
        ]}
      />
    </div>
  );
}