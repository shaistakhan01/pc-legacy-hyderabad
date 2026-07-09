import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listGuests, createGuest, type Guest } from "@/services/guests";
import { Card, Input, Button, Modal } from "@/components/common";

export function GuestManagement() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function loadGuests(searchTerm?: string) {
    setLoading(true);
    listGuests(searchTerm).then((res) => {
      if (res.success) setGuests(res.guests);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadGuests();
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    loadGuests(search);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const result = await createGuest({ fullName, phone, email });
    setIsSaving(false);

    if (result.success) {
      setModalOpen(false);
      setFullName("");
      setPhone("");
      setEmail("");
      loadGuests(search);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl text-primary">Guests / CRM</h1>
        <Button onClick={() => setModalOpen(true)}>Add Guest</Button>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or email..."
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {loading ? (
        <p className="text-neutral-700">Loading guests...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {guests.map((guest) => (
            <Link key={guest.id} to={`/admin/guests/${guest.id}`}>
              <Card hoverable>
                <p className="font-medium text-neutral-900">{guest.full_name}</p>
                <p className="text-sm text-neutral-700">
                  {guest.phone ?? "No phone"} · {guest.email ?? "No email"}
                </p>
              </Card>
            </Link>
          ))}
          {guests.length === 0 && <p className="text-neutral-700">No guests found.</p>}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Guest">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" isLoading={isSaving}>Save Guest</Button>
        </form>
      </Modal>
    </div>
  );
}