import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { listStaff } from "../controllers/staff.controller.js";

const router = Router();

router.get("/", requireAuth, requireRole("staff", "admin", "super_admin"), listStaff);

export default router;