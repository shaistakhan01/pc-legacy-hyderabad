import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { createInvite, getInviteByToken, acceptInvite } from "../controllers/staffInvites.controller.js";

const router = Router();

router.post("/", requireAuth, requireRole("admin", "super_admin"), createInvite);
router.get("/:token", getInviteByToken);
router.post("/:token/accept", acceptInvite);

export default router;