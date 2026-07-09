import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { studioUpdateSchema } from "../validators/studioValidator.js";
import { updateStudio, getStudio } from "../controllers/studioController.js";

const router = express.Router();

router.get("/profile", protect, getStudio);
router.put("/profile", protect, validate(studioUpdateSchema), updateStudio);

export default router;
