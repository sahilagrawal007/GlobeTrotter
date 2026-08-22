import { Router } from "express";
import { listActivities } from "../controllers/activities.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { activityQuerySchema } from "@globetrotter/shared";

const router = Router();

router.get("/", requireAuth, validate(activityQuerySchema, "query"), listActivities);

export default router;
