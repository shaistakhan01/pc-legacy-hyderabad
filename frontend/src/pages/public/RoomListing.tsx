import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, Badge } from "@/components/common";
import type { Database } from "@/types/database.types";

type RoomType = Database["public"]["Tables"]["room_types"]["Row"];

// room_types is public-read (Phase 2.3 RLS) — safe to query directly
// from the frontend client, no backend round-trip needed for browsing.
export function RoomListing() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("room_types")
      .select("*")
      .order("base_price", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setRoomTypes(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-16 text-center text-neutral-700">Loading rooms...</div>;
  }

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <h1 className="mb-2 font-heading text-3xl text-primary">Our Rooms</h1>
      <p className="mb-8 text-neutral-700">Choose the perfect room for your stay.</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roomTypes.map((room) => (
          <Link key={room.id} to={`/rooms/${room.id}`}>
            <Card hoverable className="flex h-full flex-col">
              {room.image_url ? (
                <img
                  src={room.image_url}
                  alt={room.name}
                  className="mb-4 h-40 w-full rounded-sm object-cover"
                />
              ) : (
                <div className="mb-4 flex h-40 items-center justify-center rounded-sm bg-neutral-200 text-sm text-neutral-400">
                  No Image
                </div>
              )}
              <h3 className="mb-1 font-heading text-xl text-neutral-900">{room.name}</h3>
              <p className="mb-3 line-clamp-2 text-sm text-neutral-700">{room.description}</p>
              <div className="mb-3 flex flex-wrap gap-1">
                {room.amenities.slice(0, 3).map((a) => (
                  <Badge key={a} status="neutral">{a}</Badge>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-lg font-semibold text-primary">
                  ₹{room.base_price}/night
                </span>
                <span className="text-xs text-neutral-700">Up to {room.max_occupancy} guests</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}