import { Request, Response } from "express";
import multer from "multer";
import { supabaseAdmin } from "../config/supabaseClient.js";

export const upload = multer({ storage: multer.memoryStorage() });

// POST /api/v1/guests/:id/documents — staff/admin only. Expects a
// multipart/form-data upload with a single "file" field.
export async function uploadGuestDocument(req: Request, res: Response) {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: "A file is required." });
  }

  const filePath = `${id}/${Date.now()}-${file.originalname}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("guest-documents")
    .upload(filePath, file.buffer, { contentType: file.mimetype });

  if (uploadError) {
    return res.status(500).json({ success: false, message: uploadError.message });
  }

  res.status(201).json({ success: true, path: filePath });
}

// GET /api/v1/guests/:id/documents — staff/admin only. Lists uploaded
// files and generates short-lived signed URLs (the bucket is private).
export async function listGuestDocuments(req: Request, res: Response) {
  const { id } = req.params;

  const { data: files, error: listError } = await supabaseAdmin.storage
    .from("guest-documents")
    .list(id);

  if (listError) {
    return res.status(500).json({ success: false, message: listError.message });
  }

  const documents = await Promise.all(
    (files ?? []).map(async (file) => {
      const { data: signed } = await supabaseAdmin.storage
        .from("guest-documents")
        .createSignedUrl(`${id}/${file.name}`, 60 * 10); // 10-minute expiry

      return { name: file.name, url: signed?.signedUrl ?? null };
    })
  );

  res.json({ success: true, documents });
}