import express from "express";

import {
  getLocation,
  getLocationNpcs,
} from "../controllers/location.controller.js";

const router = express.Router();

router.get("/:id/npcs", getLocationNpcs);
router.get("/:id", getLocation);

export default router;