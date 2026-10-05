import express from "express";

import { getDialogue } from "../controllers/dialogue.controller.js";

const router = express.Router();

router.get("/:id", getDialogue);

export default router;