import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button, Input, Select, Card, Modal, Badge, Tabs } from "@/components/common";
import type { Database } from "@/types/database.types";

type EventHall = Database["public"]["Tables"]["event_halls"]["Row"];
type HallAddOn = Database["public"]["Tables"]["hall_add_ons"]["Row"];

interface BookingRow {
  id: string;
  reference_number: string;
  status: string;
  total_amount: number;
  banquet_bookings: {
    event_date: string;
    guest_count: number;
    event_halls: { name: string } | null;
  } | null;
}

function HallsTab() {
  const [halls, setHalls] = useState<EventHall[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [capacityMin, setCapacityMin] = useState("");
  const [capacityMax, setCapacityMax] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [layoutText, setLayoutText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function loadHalls() {
    supabase
      .from("event_halls")
      .select("*")
      .order("base_price")
      .then(({ data }) => data && setHalls(data));
  }

  useEffect(() => {
    loadHalls();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      const filePath = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("hall-images")
        .upload(filePath, imageFile);
      if (!uploadError) {
        const { data } = supabase.storage.from("hall-images").getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }
    }

    await supabase.from("event_halls").insert({
      name,
      capacity_min: Number(capacityMin),
      capacity_max: Number(capacityMax),
      base_price: Number(basePrice),
      layout_options: layoutText
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      image_url: imageUrl,
    });

    setIsSaving(false);
    setModalOpen(false);
    setName("");
    setCapacityMin("");
    setCapacityMax("");
    setBasePrice("");
    setLayoutText("");
    setImageFile(null);
    loadHalls();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this hall?")) return;
    await supabase.from("event_halls").delete().eq("id", id);
    loadHalls();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setModalOpen(true)}>Add Hall</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {halls.map((hall) => (
          <Card key={hall.id}>
            {hall.image_url && (
              <img
                src={hall.image_url}
                alt={hall.name}
                className="mb-3 h-32 w-full rounded-sm object-cover"
              />
            )}
            <h3 className="font-heading text-lg text-neutral-900">{hall.name}</h3>
            <p className="text-sm text-neutral-700">
              ₹{hall.base_price} · {hall.capacity_min}–{hall.capacity_max} guests
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {(hall.layout_options ?? []).map((l) => (
                <Badge key={l} status="neutral">{l}</Badge>
              ))}
            </div>
            <div className="mt-3">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(hall.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Hall">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Min Capacity"
            type="number"
            value={capacityMin}
            onChange={(e) => setCapacityMin(e.target.value)}
            required
          />
          <Input
            label="Max Capacity"
            type="number"
            value={capacityMax}
            onChange={(e) => setCapacityMax(e.target.value)}
            required
          />
          <Input
            label="Base Price"
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            required
          />
          <Input
            label="Layout Options (comma-separated)"
            value={layoutText}
            onChange={(e) => setLayoutText(e.target.value)}
            helperText="e.g. Banquet, Theatre, Cocktail"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-900">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button type="submit" isLoading={isSaving}>
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function AddOnsTab() {
  const [addOns, setAddOns] = useState<HallAddOn[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("catering");
  const [isSaving, setIsSaving] = useState(false);

  function loadAddOns() {
    supabase
      .from("hall_add_ons")
      .select("*")
      .order("category")
      .then(({ data }) => data && setAddOns(data));
  }

  useEffect(() => {
    loadAddOns();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    await supabase.from("hall_add_ons").insert({
      name,
      price: Number(price),
      category,
    });
    setIsSaving(false);
    setModalOpen(false);
    setName("");
    setPrice("");
    loadAddOns();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this add-on?")) return;
    await supabase.from("hall_add_ons").delete().eq("id", id);
    loadAddOns();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setModalOpen(true)}>Add Add-on</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {addOns.map((addon) => (
          <Card key={addon.id}>
            <h3 className="font-medium text-neutral-900">{addon.name}</h3>
            <p className="text-sm text-neutral-700">
              ₹{addon.price}
              {addon.category === "catering" ? "/plate" : ""} · {addon.category}
            </p>
            <div className="mt-3">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(addon.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Hall Add-on"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "catering", label: "Catering (per plate)" },
              { value: "decoration", label: "Decoration (flat fee)" },
              { value: "av_equipment", label: "AV Equipment (flat fee)" },
            ]}
          />
          <Button type="submit" isLoading={isSaving}>
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}

const statusToBadge: Record<string, "success" | "warning" | "error" | "info" | "neutral"> =
  {
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
      .select(
        `id, reference_number, status, total_amount,
         banquet_bookings ( event_date, guest_count, event_halls ( name ) )`
      )
      .eq("module_type", "banquet")
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setBookings(data as unknown as BookingRow[]));
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((b) => {
        const detail = b.banquet_bookings;
        return (
          <Card key={b.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">
                  {detail?.event_halls?.name} — {detail?.event_date} ·{" "}
                  {detail?.guest_count} guests
                </p>
                <p className="text-xs text-neutral-400">Ref: {b.reference_number}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={statusToBadge[b.status] ?? "neutral"}>
                  {b.status}
                </Badge>
                <span className="font-semibold text-primary">₹{b.total_amount}</span>
              </div>
            </div>
          </Card>
        );
      })}
      {bookings.length === 0 && (
        <p className="text-neutral-700">No banquet bookings yet.</p>
      )}
    </div>
  );
}

export function BanquetManagement() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-primary">Banquet Management</h1>
      <Tabs
        items={[
          { id: "halls", label: "Halls", content: <HallsTab /> },
          { id: "addons", label: "Add-ons", content: <AddOnsTab /> },
          { id: "bookings", label: "All Bookings", content: <AllBookingsTab /> },
        ]}
      />
    </div>
  );
}