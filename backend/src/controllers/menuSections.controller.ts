import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabaseClient.js";

// GET /api/v1/menu-sections — public. Nests items per section, only
// returning enabled sections and available items to public visitors.
export async function listSections(req: Request, res: Response) {
  const includeDisabled = req.query.admin === "true"; // admin panel passes this to see everything

  let query = supabaseAdmin
    .from("menu_sections")
    .select("*, menu_items(*)")
    .order("sort_order", { ascending: true });

  if (!includeDisabled) {
    query = query.eq("is_enabled", true);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ success: false, message: error.message });

  res.json({ success: true, sections: data });
}

// PATCH /api/v1/menu-sections/:id — staff/admin. Update price/timing/enabled/etc.
export async function updateSection(req: Request, res: Response) {
  const { id } = req.params;
  const { name, price, timingText, availabilityText, isEnabled } = req.body as {
    name?: string; price?: number; timingText?: string; availabilityText?: string; isEnabled?: boolean;
  };

  const { data, error } = await supabaseAdmin
    .from("menu_sections")
    .update({
      ...(name !== undefined && { name }),
      ...(price !== undefined && { price }),
      ...(timingText !== undefined && { timing_text: timingText }),
      ...(availabilityText !== undefined && { availability_text: availabilityText }),
      ...(isEnabled !== undefined && { is_enabled: isEnabled }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return res.status(500).json({ success: false, message: error?.message ?? "Update failed." });
  res.json({ success: true, section: data });
}

// POST /api/v1/menu-sections/:sectionId/items — staff/admin.
export async function createItem(req: Request, res: Response) {
  const { sectionId } = req.params;
  const { name, description, price, category, imageUrl } = req.body as {
    name?: string; description?: string; price?: number; category?: string; imageUrl?: string;
  };

  if (!name) return res.status(400).json({ success: false, message: "name is required." });

  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .insert({ section_id: sectionId, name, description, price: price ?? null, category, image_url: imageUrl })
    .select()
    .single();

  if (error || !data) return res.status(500).json({ success: false, message: error?.message ?? "Failed to create item." });
  res.status(201).json({ success: true, item: data });
}

// PATCH /api/v1/menu-sections/items/:itemId — staff/admin.
export async function updateItem(req: Request, res: Response) {
  const { itemId } = req.params;
  const { name, description, price, category, imageUrl, isAvailable } = req.body as {
    name?: string; description?: string; price?: number; category?: string; imageUrl?: string; isAvailable?: boolean;
  };

  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .update({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(category !== undefined && { category }),
      ...(imageUrl !== undefined && { image_url: imageUrl }),
      ...(isAvailable !== undefined && { is_available: isAvailable }),
    })
    .eq("id", itemId)
    .select()
    .single();

  if (error || !data) return res.status(500).json({ success: false, message: error?.message ?? "Update failed." });
  res.json({ success: true, item: data });
}

// DELETE /api/v1/menu-sections/items/:itemId — staff/admin.
export async function deleteItem(req: Request, res: Response) {
  const { itemId } = req.params;
  const { error } = await supabaseAdmin.from("menu_items").delete().eq("id", itemId);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
}