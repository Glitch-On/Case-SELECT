import express from "express";

import {
  getCase,
  getCaseSteps,
} from "../controllers/case.controller.js";

const router = express.Router();

router.get("/:id/steps", getCaseSteps);
router.get("/:id", getCase);

export default router;