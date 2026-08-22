import { Router } from "express";
import { suggestItinerary, estimateBudget } from "../controllers/ai.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.post("/suggest-itinerary", suggestItinerary);
router.post("/estimate-budget", estimateBudget);

export default router;
