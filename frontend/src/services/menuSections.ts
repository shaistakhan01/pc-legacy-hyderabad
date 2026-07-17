const API_BASE = "http://localhost:5000";

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  image_url: string | null;
  is_available: boolean;
}

export interface MenuSection {
  id: string;
  name: string;
  type: "buffet" | "a_la_carte";
  icon: string | null;
  price: number | null;
  timing_text: string | null;
  availability_text: string | null;
  is_enabled: boolean;
  menu_items: MenuItem[];
}

export async function fetchMenuSections(admin = false): Promise<{ success: boolean; sections: MenuSection[] }> {
  const res = await fetch(`${API_BASE}/api/v1/menu-sections${admin ? "?admin=true" : ""}`);
  return res.json();
}