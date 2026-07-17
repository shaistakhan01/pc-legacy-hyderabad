import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button, Input, Card, Modal, Badge, Tabs } from "@/components/common";
import type { Database } from "@/types/database.types";
import { fetchMenuSections, type MenuSection, type MenuItem } from "@/services/menuSections";

type RestaurantTable = Database["public"]["Tables"]["restaurant_tables"]["Row"];

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

const API_BASE = "http://localhost:5000";
async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` };
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
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function loadSections() {
    fetchMenuSections(true).then((res) => res.success && setSections(res.sections));
  }

  useEffect(() => {
    loadSections();
  }, []);

  async function updateSectionField(sectionId: string, field: string, value: string | number | boolean) {
    await fetch(`${API_BASE}/api/v1/menu-sections/${sectionId}`, {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify({ [field]: value }),
    });
    loadSections();
  }

  function openAddItem(sectionId: string) {
    setActiveSectionId(sectionId);
    setEditingItem(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setModalOpen(true);
  }

  function openEditItem(sectionId: string, item: MenuItem) {
    setActiveSectionId(sectionId);
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description ?? "");
    setPrice(item.price ? String(item.price) : "");
    setCategory(item.category ?? "");
    setModalOpen(true);
  }

  async function handleSaveItem(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const payload = { name, description, price: price ? Number(price) : null, category };

    if (editingItem) {
      await fetch(`${API_BASE}/api/v1/menu-sections/items/${editingItem.id}`, {
        method: "PATCH",
        headers: await authHeaders(),
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${API_BASE}/api/v1/menu-sections/${activeSectionId}/items`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify(payload),
      });
    }
    setIsSaving(false);
    setModalOpen(false);
    loadSections();
  }

  async function toggleItemAvailability(item: MenuItem) {
    await fetch(`${API_BASE}/api/v1/menu-sections/items/${item.id}`, {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify({ isAvailable: !item.is_available }),
    });
    loadSections();
  }

  async function deleteMenuItem(itemId: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`${API_BASE}/api/v1/menu-sections/items/${itemId}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    loadSections();
  }

  return (
    <div className="flex flex-col gap-8">
      {sections.map((section) => (
        <Card key={section.id}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-lg text-neutral-900">
              {section.icon} {section.name}
            </h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={section.is_enabled}
                onChange={(e) => updateSectionField(section.id, "isEnabled", e.target.checked)}
              />
              Enabled
            </label>
          </div>

          {section.type === "buffet" && (
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              <Input
                label="Price (per person)"
                type="number"
                defaultValue={section.price ?? ""}
                onBlur={(e) => updateSectionField(section.id, "price", Number(e.target.value))}
              />
              <Input
                label="Timing"
                defaultValue={section.timing_text ?? ""}
                onBlur={(e) => updateSectionField(section.id, "timingText", e.target.value)}
              />
              <Input
                label="Availability"
                defaultValue={section.availability_text ?? ""}
                onBlur={(e) => updateSectionField(section.id, "availabilityText", e.target.value)}
              />
            </div>
          )}

          <div className="mb-3 flex justify-end">
            <Button size="sm" onClick={() => openAddItem(section.id)}>+ Add Item</Button>
          </div>

          <div className="flex flex-col gap-2">
            {section.menu_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-sm border border-neutral-200 p-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {item.name} {item.price !== null && `— ₹${item.price}`}
                  </p>
                  {item.category && <p className="text-xs text-neutral-400">{item.category}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={item.is_available ? "success" : "error"}>
                    {item.is_available ? "Available" : "Out of Stock"}
                  </Badge>
                  <Button size="sm" variant="secondary" onClick={() => toggleItemAvailability(item)}>
                    Toggle
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => openEditItem(section.id, item)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMenuItem(item.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Edit Item" : "Add Item"}>
        <form onSubmit={handleSaveItem} className="flex flex-col gap-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input label="Price (leave blank for buffet items)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Input label="Category (for à la carte)" value={category} onChange={(e) => setCategory(e.target.value)} />
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