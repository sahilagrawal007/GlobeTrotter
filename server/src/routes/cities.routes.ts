import { Router } from "express";
import { listCities } from "../controllers/cities.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { cityQuerySchema } from "@globetrotter/shared";

const router = Router();

router.get("/", requireAuth, validate(cityQuerySchema, "query"), listCities);

export default router;
