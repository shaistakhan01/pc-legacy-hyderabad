import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, Badge } from "@/components/common";
import type { Database } from "@/types/database.types";

type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];

// menu_items is public-read (Phase 2.3 RLS) — direct frontend query.
export function Dining() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("menu_items")
      .select("*")
      .order("category")
      .then(({ data, error }) => {
        if (!error && data) setMenuItems(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-16 text-center text-neutral-700">Loading menu...</div>;
  }

  const categories = Array.from(new Set(menuItems.map((item) => item.category ?? "Other")));

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-heading text-3xl text-primary">Dining</h1>
          <p className="text-neutral-700">Explore our menu and reserve a table.</p>
        </div>
        <a
          href="/dining/reserve"
          className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition-colors"
        >
          Reserve a Table
        </a>
      </div>

      {categories.map((category) => (
        <div key={category} className="mb-10">
          <h2 className="mb-4 font-heading text-xl text-neutral-900">{category}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {menuItems
              .filter((item) => (item.category ?? "Other") === category)
              .map((item) => (
                <Card key={item.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-neutral-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-neutral-700">{item.description}</p>
                    </div>
                    <Badge status="neutral">₹{item.price}</Badge>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}