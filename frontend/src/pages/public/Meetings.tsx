import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, Badge } from "@/components/common";
import type { Database } from "@/types/database.types";

type ConferenceRoom = Database["public"]["Tables"]["conference_rooms"]["Row"];

// conference_rooms is public-read (Phase 2.3 RLS) — direct frontend query.
export function Meetings() {
  const [rooms, setRooms] = useState<ConferenceRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("conference_rooms")
      .select("*")
      .order("hourly_rate", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setRooms(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-16 text-center text-neutral-700">Loading meeting rooms...</div>;
  }

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <h1 className="mb-2 font-heading text-3xl text-primary">Meetings & Conference</h1>
      <p className="mb-8 text-neutral-700">Professional spaces for meetings, workshops, and conferences.</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Link key={room.id} to={`/meetings/${room.id}`}>
            <Card hoverable className="flex h-full flex-col">
              <h3 className="mb-1 font-heading text-xl text-neutral-900">{room.name}</h3>
              <p className="mb-3 text-sm text-neutral-700">Seats up to {room.capacity} people</p>
              <div className="mb-3 flex flex-wrap gap-1">
                {(room.equipment ?? []).map((e) => (
                  <Badge key={e} status="neutral">{e}</Badge>
                ))}
              </div>
              <div className="mt-auto">
                <span className="text-lg font-semibold text-primary">₹{room.hourly_rate}/hour</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}