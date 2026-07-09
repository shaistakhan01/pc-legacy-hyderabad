import React from "react";
import { FormEvent, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getGuest, updateGuest, type Guest } from "@/services/guests";
import { listGuestDocuments, uploadGuestDocument, type GuestDocument } from "@/services/guestDocuments";
import { Card, Input, Button } from "@/components/common";

export function GuestDetail() {
  const { guestId } = useParams<{ guestId: string }>();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [documents, setDocuments] = useState<GuestDocument[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  function loadGuest() {
    if (!guestId) return;
    getGuest(guestId).then((res) => {
      if (res.success) {
        setGuest(res.guest);
        setFullName(res.guest.full_name);
        setPhone(res.guest.phone ?? "");
        setEmail(res.guest.email ?? "");
      }
    });
  }

  function loadDocuments() {
    if (!guestId) return;
    listGuestDocuments(guestId).then((res) => res.success && setDocuments(res.documents));
  }

  useEffect(() => {
    loadGuest();
    loadDocuments();
  }, [guestId]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!guestId) return;

    setIsSaving(true);
    setSavedMessage("");
    const result = await updateGuest(guestId, { fullName, phone, email });
    setIsSaving(false);

    if (result.success) {
      setSavedMessage("Guest details updated.");
      loadGuest();
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !guestId) return;

    setIsUploading(true);
    await uploadGuestDocument(guestId, file);
    setIsUploading(false);
    loadDocuments();
  }

  if (!guest) {
    return <div className="p-16 text-center text-neutral-700">Loading guest...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-primary">{guest.full_name}</h1>

      <Link to={`/admin/guests/${guestId}/book-room`} className="mb-4 inline-block text-sm text-primary hover:underline">
        + Book a room for this guest
      </Link>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-heading text-lg text-neutral-900">Details</h3>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" isLoading={isSaving}>Save Changes</Button>
            {savedMessage && <p className="text-sm text-success">{savedMessage}</p>}
          </form>
        </Card>

        <Card>
          <h3 className="mb-4 font-heading text-lg text-neutral-900">ID Documents</h3>
          <input type="file" accept="image/*,.pdf" onChange={handleFileChange} disabled={isUploading} />
          <div className="mt-4 flex flex-col gap-2">
            {documents.map((doc) => {
              return (
                <React.Fragment key={doc.name}>
                  <a href={doc.url ?? "#"} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                    {doc.name}
                  </a>
                </React.Fragment>
              );
            })}
            {documents.length === 0 && <p className="text-sm text-neutral-700">No documents uploaded yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}