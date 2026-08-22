import { Router } from "express";
import { listActivities, createActivity } from "../controllers/activities.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { activityQuerySchema } from "@globetrotter/shared";

const router = Router();

router.get("/", requireAuth, validate(activityQuerySchema, "query"), listActivities);
router.post("/", requireAuth, createActivity);

export default router;
