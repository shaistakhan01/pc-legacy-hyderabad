import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { upload, uploadGuestDocument, listGuestDocuments } from "../controllers/guestDocuments.controller.js";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, requireRole("staff", "admin", "super_admin"), listGuestDocuments);
router.post("/", requireAuth, requireRole("staff", "admin", "super_admin"), upload.single("file"), uploadGuestDocument);

export default router;