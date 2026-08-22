import { Router } from "express";
import { getPublicTrip, copyPublicTrip } from "../controllers/public.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/trips/:slug", getPublicTrip);
router.post("/trips/:slug/copy", requireAuth, copyPublicTrip);

export default router;
