import { Router } from "express";
import { getStats, listUsers, listTrips } from "../controllers/admin.controller";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/stats", getStats);
router.get("/users", listUsers);
router.get("/trips", listTrips);

export default router;
