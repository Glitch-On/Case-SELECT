import express from "express";

import {
  getCases,
  getCase,
  getCaseSteps,
} from "../controllers/case.controller.js";

const router = express.Router();

router.get("/", getCases);
router.get("/:id/steps", getCaseSteps);
router.get("/:id", getCase);

export default router;