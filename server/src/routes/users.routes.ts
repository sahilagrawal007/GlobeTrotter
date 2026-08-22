import { Router } from "express";
import { getMe, updateMe, deleteMe } from "../controllers/users.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateProfileSchema } from "@globetrotter/shared";

const router = Router();

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, validate(updateProfileSchema), updateMe);
router.delete("/me", requireAuth, deleteMe);

export default router;
