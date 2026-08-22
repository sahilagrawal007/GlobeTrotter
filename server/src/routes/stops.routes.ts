import { Router } from "express";
import {
  createStop,
  updateStop,
  deleteStop,
  reorderStops,
  addStopActivity,
  deleteStopActivity,
} from "../controllers/stops.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createStopSchema,
  updateStopSchema,
  reorderStopsSchema,
  addStopActivitySchema,
} from "@globetrotter/shared";

const router = Router();

router.use(requireAuth);

// Note: reorder must be defined BEFORE /:stopId to avoid ambiguity
router.patch("/:tripId/stops/reorder", validate(reorderStopsSchema), reorderStops);

router.post("/:tripId/stops", validate(createStopSchema), createStop);
router.patch("/:tripId/stops/:stopId", validate(updateStopSchema), updateStop);
router.delete("/:tripId/stops/:stopId", deleteStop);

router.post("/:tripId/stops/:stopId/activities", validate(addStopActivitySchema), addStopActivity);
router.delete("/:tripId/stops/:stopId/activities/:stopActivityId", deleteStopActivity);

export default router;
