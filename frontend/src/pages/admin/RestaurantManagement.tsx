import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button, Input, Select, Card, Modal, Badge, Tabs } from "@/components/common";
import type { Database } from "@/types/database.types";

type RestaurantTable = Database["public"]["Tables"]["restaurant_tables"]["Row"];
type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];

interface ReservationRow {
  id: string;
  reference_number: string;
  status: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  restaurant_reservations: {
    reservation_date: string;
    reservation_time: string;
    party_size: number;
    restaurant_tables: { table_number: string } | null;
  } | null;
}

function TablesTab() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [locationZone, setLocationZone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function loadTables() {
    supabase.from("restaurant_tables").select("*").order("table_number").then(({ data }) => data && setTables(data));
  }

  useEffect(() => {
    loadTables();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    await supabase.from("restaurant_tables").insert({
      table_number: tableNumber,
      capacity: Number(capacity),
      location_zone: locationZone,
      status: "available",
    });
    setIsSaving(false);
    setModalOpen(false);
    setTableNumber("");
    setCapacity("");
    setLocationZone("");
    loadTables();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this table?")) return;
    await supabase.from("restaurant_tables").delete().eq("id", id);
    loadTables();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setModalOpen(true)}>Add Table</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {tables.map((t) => (
          <Card key={t.id}>
            <h3 className="font-heading text-lg text-neutral-900">Table {t.table_number}</h3>
            <p className="text-sm text-neutral-700">Seats {t.capacity} · {t.location_zone}</p>
            <Badge status={t.status === "available" ? "success" : "neutral"}>{t.status}</Badge>
            <div className="mt-3">
              <Button size="sm" variant="destructive" onClick={() => handleDelete(t.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Table">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Table Number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} required />
          <Input label="Capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
          <Input label="Location Zone" value={locationZone} onChange={(e) => setLocationZone(e.target.value)} />
          <Button type="submit" isLoading={isSaving}>Save</Button>
        </form>
      </Modal>
    </div>
  );
}

function MenuTab() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Main Course");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function loadItems() {
    supabase.from("menu_items").select("*").order("category").then(({ data }) => data && setItems(data));
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      const filePath = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage.from("menu-images").upload(filePath, imageFile);
      if (!uploadError) {
        const { data } = supabase.storage.from("menu-images").getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }
    }

    await supabase.from("menu_items").insert({
      name,
      description,
      price: Number(price),
      category,
      image_url: imageUrl,
    });

    setIsSaving(false);
    setModalOpen(false);
    setName("");
    setDescription("");
    setPrice("");
    setImageFile(null);
    loadItems();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this menu item?")) return;
    await supabase.from("menu_items").delete().eq("id", id);
    loadItems();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setModalOpen(true)}>Add Menu Item</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            {item.image_url && <img src={item.image_url} alt={item.name} className="mb-3 h-28 w-full rounded-sm object-cover" />}
            <h3 className="font-medium text-neutral-900">{item.name}</h3>
            <p className="text-sm text-neutral-700">{item.description}</p>
            <p className="mt-2 font-semibold text-primary">₹{item.price}</p>
            <div className="mt-3">
              <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Menu Item">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input label="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "Starters", label: "Starters" },
              { value: "Main Course", label: "Main Course" },
              { value: "Dessert", label: "Dessert" },
            ]}
          />
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
  seated: "info",
  completed: "neutral",
  cancelled: "error",
};

function AllReservationsTab() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);

  useEffect(() => {
    supabase
      .from("bookings")
     .select(
        `id, reference_number, status, cancelled_at, cancellation_reason,
         restaurant_reservations ( reservation_date, reservation_time, party_size, restaurant_tables ( table_number ) )`
      )
      .eq("module_type", "restaurant")
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setReservations(data as unknown as ReservationRow[]));
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {reservations.map((r) => {
        const detail = r.restaurant_reservations;
        return (
          <Card key={r.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">
                  Table {detail?.restaurant_tables?.table_number} — {detail?.reservation_date} at {detail?.reservation_time}
                </p>
                <p className="text-xs text-neutral-400">Ref: {r.reference_number} · Party of {detail?.party_size}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge status={statusToBadge[r.status] ?? "neutral"}>{r.status}</Badge>
                {r.status === "cancelled" && r.cancelled_at && (
                  <p className="mt-1 text-xs text-neutral-400">
                    Cancelled {new Date(r.cancelled_at).toLocaleDateString()}
                    {r.cancellation_reason && ` — "${r.cancellation_reason}"`}
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
      {reservations.length === 0 && <p className="text-neutral-700">No reservations yet.</p>}
    </div>
  );
}

export function RestaurantManagement() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-primary">Restaurant Management</h1>
      <Tabs
        items={[
          { id: "tables", label: "Tables", content: <TablesTab /> },
          { id: "menu", label: "Menu", content: <MenuTab /> },
          { id: "reservations", label: "All Reservations", content: <AllReservationsTab /> },
        ]}
      />
    </div>
  );
}