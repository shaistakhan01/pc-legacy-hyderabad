import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  listSections, updateSection, createItem, updateItem, deleteItem,
} from "../controllers/menuSections.controller.js";

const router = Router();

router.get("/", listSections);
router.patch("/:id", requireAuth, requireRole("staff", "admin", "super_admin"), updateSection);
router.post("/:sectionId/items", requireAuth, requireRole("staff", "admin", "super_admin"), createItem);
router.patch("/items/:itemId", requireAuth, requireRole("staff", "admin", "super_admin"), updateItem);
router.delete("/items/:itemId", requireAuth, requireRole("staff", "admin", "super_admin"), deleteItem);

export default router;