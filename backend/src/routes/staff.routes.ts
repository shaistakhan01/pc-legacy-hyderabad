import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { listStaff, updateRole, toggleActive } from "../controllers/staff.controller.js";

const router = Router();

router.get("/", requireAuth, requireRole("staff", "admin", "super_admin"), listStaff);
router.patch("/:userId/role", requireAuth, requireRole("admin", "super_admin"), updateRole);
router.patch("/:userId/active", requireAuth, requireRole("admin", "super_admin"), toggleActive);

export default router;