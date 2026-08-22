import { Router } from "express";
import {
  listTrips,
  createTrip,
  getTrip,
  updateTrip,
  deleteTrip,
  getTripBudget,
  shareTrip,
} from "../controllers/trips.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createTripSchema, updateTripSchema, shareTripSchema } from "@globetrotter/shared";

const router = Router();

// All trip routes require auth
router.use(requireAuth);

router.get("/", listTrips);
router.post("/", validate(createTripSchema), createTrip);
router.get("/:tripId", getTrip);
router.patch("/:tripId", validate(updateTripSchema), updateTrip);
router.delete("/:tripId", deleteTrip);
router.get("/:tripId/budget", getTripBudget);
router.patch("/:tripId/share", validate(shareTripSchema), shareTrip);

export default router;
