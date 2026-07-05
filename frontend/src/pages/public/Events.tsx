import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, Badge } from "@/components/common";
import type { Database } from "@/types/database.types";

type EventHall = Database["public"]["Tables"]["event_halls"]["Row"];

// event_halls is public-read (Phase 2.3 RLS) — direct frontend query.
export function Events() {
  const [halls, setHalls] = useState<EventHall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("event_halls")
      .select("*")
      .order("base_price", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setHalls(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-16 text-center text-neutral-700">Loading venues...</div>;
  }

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <h1 className="mb-2 font-heading text-3xl text-primary">Banquet & Events</h1>
      <p className="mb-8 text-neutral-700">Find the perfect venue for your celebration.</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {halls.map((hall) => (
          <Link key={hall.id} to={`/events/${hall.id}`}>
            <Card hoverable className="flex h-full flex-col">
              {hall.image_url ? (
                <img
                  src={hall.image_url}
                  alt={hall.name}
                  className="mb-4 h-40 w-full rounded-sm object-cover"
                />
              ) : (
                <div className="mb-4 flex h-40 items-center justify-center rounded-sm bg-neutral-200 text-sm text-neutral-400">
                  No Image
                </div>
              )}
              <h3 className="mb-1 font-heading text-xl text-neutral-900">{hall.name}</h3>
              <div className="mb-3 flex flex-wrap gap-1">
                {(hall.layout_options ?? []).map((l) => (
                  <Badge key={l} status="neutral">{l}</Badge>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-lg font-semibold text-primary">
                  ₹{hall.base_price}
                </span>
                <span className="text-xs text-neutral-700">
                  {hall.capacity_min}–{hall.capacity_max} guests
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}