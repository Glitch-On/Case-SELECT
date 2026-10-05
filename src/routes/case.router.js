import { Router } from "express";
import { getCase } from "../controllers/case.controller.js";

const router = Router();

router.get("/:id", getCase);

export default router;
