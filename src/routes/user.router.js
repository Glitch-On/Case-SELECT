import express from "express";

import { getUserProgress } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/:id/progress", getUserProgress);

export default router;
