import { useEffect, useState } from "react";
import { fetchMenuSections, type MenuSection } from "@/services/menuSections";
import { Card, Badge } from "@/components/common";

export function Dining() {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuSections().then((res) => {
      if (res.success) {
        setSections(res.sections);
        setActiveId(res.sections[0]?.id ?? null);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-16 text-center text-neutral-700">Loading menu...</div>;

  const active = sections.find((s) => s.id === activeId);

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

      {/* Category cards */}
      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className={`rounded-md border-2 p-6 text-left transition-all ${
              activeId === s.id
                ? "border-accent bg-accent/10 shadow-elevation-2"
                : "border-neutral-200 bg-surface hover:border-accent/50"
            }`}
          >
            <span className="mb-2 block text-3xl">{s.icon}</span>
            <h3 className="font-heading text-lg text-neutral-900">{s.name}</h3>
            {s.type === "buffet" ? (
              <p className="mt-1 text-sm text-neutral-700">₹{s.price} per person</p>
            ) : (
              <p className="mt-1 text-sm text-neutral-700">À la carte</p>
            )}
          </button>
        ))}
      </div>

      {/* Active section content */}
      {active && (
        <div>
          {active.type === "buffet" ? (
            <BuffetSection section={active} />
          ) : (
            <ALaCarteSection section={active} />
          )}
        </div>
      )}
    </div>
  );
}

function BuffetSection({ section }: { section: MenuSection }) {
  return (
    <Card>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-sm bg-neutral-100 p-4">
        <div>
          <Badge status="info">{section.availability_text}</Badge>
          <p className="mt-2 text-sm font-medium text-neutral-900">⏰ {section.timing_text}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-700">Per Person</p>
          <p className="text-2xl font-semibold text-primary">₹{section.price}</p>
        </div>
      </div>

      <h3 className="mb-3 font-heading text-lg text-neutral-900">{section.name} Menu</h3>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {section.menu_items
          .filter((i) => i.is_available)
          .map((item, idx) => (
            <div key={item.id} className="flex items-start gap-2 rounded-sm border border-neutral-200 p-3">
              <span className="text-sm font-semibold text-accent">{idx + 1}.</span>
              <div>
                <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                {item.description && <p className="text-xs text-neutral-700">{item.description}</p>}
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}

function ALaCarteSection({ section }: { section: MenuSection }) {
  const availableItems = section.menu_items.filter((i) => i.is_available);
  const categories = Array.from(new Set(availableItems.map((i) => i.category ?? "Other")));

  return (
    <div>
      <div className="mb-6 rounded-sm bg-neutral-100 p-4">
        <Badge status="info">{section.availability_text}</Badge>
      </div>
      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h3 className="mb-4 font-heading text-lg text-neutral-900 border-b border-neutral-200 pb-2">
            {category}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {availableItems
              .filter((i) => (i.category ?? "Other") === category)
              .map((item) => (
                <Card key={item.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-neutral-900">{item.name}</h4>
                      {item.description && <p className="mt-1 text-sm text-neutral-700">{item.description}</p>}
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