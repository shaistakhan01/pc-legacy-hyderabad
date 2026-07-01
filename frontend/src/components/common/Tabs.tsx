import { ReactNode, useState } from "react";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
}

export function Tabs({ items, defaultTabId }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? items[0]?.id);
  const activeItem = items.find((item) => item.id === activeId);

  return (
    <div>
      <div role="tablist" className="flex gap-2 border-b border-neutral-200">
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={activeId === item.id}
            onClick={() => setActiveId(item.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeId === item.id
                ? "border-b-2 border-primary text-primary"
                : "text-neutral-700 hover:text-neutral-900"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-4">
        {activeItem?.content}
      </div>
    </div>
  );
}