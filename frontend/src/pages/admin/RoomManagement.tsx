import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button, Input, Card, Modal, Badge, Tabs } from "@/components/common";
import type { Database } from "@/types/database.types";

type RoomType = Database["public"]["Tables"]["room_types"]["Row"];

interface BookingWithDetail {
  id: string;
  reference_number: string;
  status: string;
  total_amount: number;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  room_bookings: {
    check_in: string;
    check_out: string;
    rooms: { room_number: string } | null;
  } | null;
}

function RoomTypesTab() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [maxOccupancy, setMaxOccupancy] = useState("");
  const [amenitiesText, setAmenitiesText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function loadRoomTypes() {
    supabase
      .from("room_types")
      .select("*")
      .order("base_price", { ascending: true })
      .then(({ data }) => data && setRoomTypes(data));
  }

  useEffect(() => {
    loadRoomTypes();
  }, []);

  function openCreateModal() {
    setEditing(null);
    setName("");
    setDescription("");
    setBasePrice("");
    setMaxOccupancy("");
    setAmenitiesText("");
    setImageFile(null);
    setModalOpen(true);
  }

  function openEditModal(rt: RoomType) {
    setEditing(rt);
    setName(rt.name);
    setDescription(rt.description ?? "");
    setBasePrice(String(rt.base_price));
    setMaxOccupancy(String(rt.max_occupancy));
    setAmenitiesText((rt.amenities ?? []).join(", "));
    setImageFile(null);
    setModalOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    let imageUrl = editing?.image_url ?? null;

    if (imageFile) {
      const filePath = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("room-images")
        .upload(filePath, imageFile);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from("room-images").getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      }
    }

    const payload = {
      name,
      description,
      base_price: Number(basePrice),
      max_occupancy: Number(maxOccupancy),
      amenities: amenitiesText.split(",").map((a) => a.trim()).filter(Boolean),
      image_url: imageUrl,
    };

    if (editing) {
      await supabase.from("room_types").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("room_types").insert(payload);
    }

    setIsSaving(false);
    setModalOpen(false);
    loadRoomTypes();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this room type? This cannot be undone.")) return;
    await supabase.from("room_types").delete().eq("id", id);
    loadRoomTypes();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreateModal}>Add Room Type</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roomTypes.map((rt) => (
          <Card key={rt.id}>
            {rt.image_url && (
              <img src={rt.image_url} alt={rt.name} className="mb-3 h-32 w-full rounded-sm object-cover" />
            )}
            <h3 className="font-heading text-lg text-neutral-900">{rt.name}</h3>
            <p className="text-sm text-neutral-700">₹{rt.base_price}/night · Up to {rt.max_occupancy} guests</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => openEditModal(rt)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(rt.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Room Type" : "Add Room Type"}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input label="Base Price (per night)" type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
          <Input label="Max Occupancy" type="number" value={maxOccupancy} onChange={(e) => setMaxOccupancy(e.target.value)} required />
          <Input label="Amenities (comma-separated)" value={amenitiesText} onChange={(e) => setAmenitiesText(e.target.value)} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-900">Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          </div>
          <Button type="submit" isLoading={isSaving}>Save</Button>
        </form>
      </Modal>
    </div>
  );
}

const statusToBadge: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  confirmed: "success",
  pending: "warning",
  checked_in: "info",
  completed: "neutral",
  cancelled: "error",
};

function AllBookingsTab() {
  const [bookings, setBookings] = useState<BookingWithDetail[]>([]);

  useEffect(() => {
    supabase
      .from("bookings")
      .select(`id, reference_number, status, total_amount, cancelled_at, cancellation_reason, room_bookings ( check_in, check_out, rooms ( room_number ) )`)
      .eq("module_type", "room")
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setBookings(data as unknown as BookingWithDetail[]));
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((b) => {
        const detail = b.room_bookings;
        return (
          <Card key={b.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">
                  Room {detail?.rooms?.room_number} — {detail?.check_in} → {detail?.check_out}
                </p>
                <p className="text-xs text-neutral-400">Ref: {b.reference_number}</p>
              </div>
             <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-3">
                  <Badge status={statusToBadge[b.status] ?? "neutral"}>{b.status.replace("_", " ")}</Badge>
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
      {bookings.length === 0 && <p className="text-neutral-700">No room bookings yet.</p>}
    </div>
  );
}

export function RoomManagement() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-primary">Room Management</h1>
      <Tabs
        items={[
          { id: "types", label: "Room Types", content: <RoomTypesTab /> },
          { id: "bookings", label: "All Bookings", content: <AllBookingsTab /> },
        ]}
      />
    </div>
  );
}